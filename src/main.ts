import { Schema, Model, SchemaType } from "mongoose";

const messages: Record<string, any> = {
  schemaTypeError: {
    "zh-CN": '参数 "schema" 的类型得是 "Schema"。',
    "en-US": 'param "schema" type must be "Schema".',
  },
  modelCountError: {
    "zh-CN": "钩子函数访问到的 Model 数量为 0 或者不存在。",
    "en-US": "The number of models accessed is 0 or does not exist.",
  },
};

/**
 * 翻译//函数
 */
function i18n(messageId: string) {
  if (messageId in messages) {
    const message = messages[messageId];
    const lang = (process.env.LANG ?? "").match("CN");
    if (lang) return message["zh-CN"];
    else return message["en-US"];
  }
}

export function MongooseFindByReference(schema: Schema) {
  // 假设得到的不是 Schema 则报错
  if (schema.constructor.name !== "Schema")
    throw new Error(i18n("schemaTypeError"));

  // 对 Schema 挂上钩子
  schema.pre(["find", "findOne"], async function (next) {
    /** 当前的 Model 们 */
    const models = this.model.db.models;

    // 对  Models 进行判空
    if (Object.keys(models ?? {}).length === 0)
      throw new Error(i18n("modelCountError"));

    /** 当前的 Schema */
    const schema: Schema = this.model.schema;

    /**
     * 返回 Ref Path 关联的 Model。
     * Return the Model which conntected with Ref Path.
     * @param obj
     * @returns
     */
    function getModel(obj: SchemaType): Model<any> | undefined {
      let refKey = "";
      if (obj?.instance === "ObjectID") {
        // 假设是 Ref Path 就直接读取
        const options = obj.options;
        if (options?.ref?.length) refKey = options.ref;
        // else if (options?.refPath?.length)
        //   if (schema.path(options.refPath)) return { refPath: options.refPath };
      } else if ((obj as any)?.$embeddedSchemaType) {
        // 假设是数组就读取子项 Type
        return getModel((obj as any).$embeddedSchemaType);
      }
      return models[refKey];
    }

    /**
     *
     * @param paths
     *
     * @exmples ['owner','name','en-US']  => ['owner', 'name.en-US']
     */
    function transPath2RefPath(
      paths: string[],
      tSchema: Schema = schema
    ): string[] {
      let previousPath: string[] = [];
      while (paths.length > 0) {
        const path = paths.shift() ?? "";
        if (tSchema.path([...previousPath, path].join("."))) {
          previousPath.push(path);
        } else {
          const currentModel = getModel(tSchema.path(previousPath.join(".")));
          if (currentModel) {
            const result = [
              previousPath.join("."),
              ...transPath2RefPath([path, ...paths], currentModel.schema),
            ];
            return result;
          } else return [path];
        }
      }
      return previousPath;
    }

    `{
        $and:{
            'owner.name':'Dean',
            'infos.timestamp.createdAt':Date,
        },
        $or:[]
    }`;

    async function lookup(
      prevPaths: string[],
      conditions: Record<string, any>,
      cSchema = schema
    ): Promise<any> {
      // 如果 Conditions 不能进行分析就直接返回它
      if (
        typeof conditions !== "object" ||
        conditions === null ||
        Object.keys(conditions).length === 0
      ) {
        return conditions;
      }

      /** 最终结果 */
      const result: Record<string, any> = {};

      // 获取前一个 Path 的值
      const prevPathsValue = cSchema.path(prevPaths.join("."));

      for (let [paths, value] of Object.entries(conditions)) {
        // paths 1 = 'owner.name.en'; value 1 = 'Dean'

        // 判断 Paths 存在于 Schema 上
        if (schema.path(paths)) {
        } else {
          const reduceResult = [
            ...transPath2RefPath(paths.split(".")),
            value as any,
          ].reduceRight((previousValue, currentValue) =>
            currentValue === "$"
              ? previousValue
              : { [currentValue]: previousValue }
          );
          [[paths, value]] = Object.entries(reduceResult);
        }

        // 当前的 Paths 数组
        const currentPathsArray = paths.startsWith("$")
          ? paths === "$"
            ? prevPaths
            : []
          : [...prevPaths, paths];

        // 当前的 Paths
        const currentPathsString = currentPathsArray.join(".");

        // 当前的 Paths 对应的值
        const currentPathsValue = cSchema.path(currentPathsString);

        if (!paths.startsWith("$"))
          if (currentPathsValue === undefined) {
            const currentModel = getModel(prevPathsValue);
            if (currentModel) {
              const subCoditions = await lookup([], value, currentModel.schema);
              if (subCoditions) {
                const ids = (
                  await currentModel.find({ [paths]: subCoditions }, "_id")
                ).map((v) => v._id);

                return { $in: ids };
              }
            }
          }

        if (Array.isArray(value))
          Object.assign(result, {
            [paths]: await Promise.all(
              value.map(
                async (v) => await lookup(currentPathsArray, v, cSchema)
              )
            ),
          });
        else if (
          typeof value === "object" &&
          value !== null &&
          Object.keys(value).length > 0
        )
          Object.assign(result, {
            [paths]: Object.fromEntries(
              await Promise.all(
                Object.entries(value).map(
                  async ([k, v]) =>
                    Object.entries(
                      await lookup(
                        currentPathsArray,
                        {
                          [k]: v,
                        },
                        cSchema
                      )
                    )[0]
                )
              )
            ),
          });
        else result[paths] = value;
      }
      return result;
    }
    (this as any)._conditions = await lookup([], (this as any)._conditions);
    next();
  });
}
