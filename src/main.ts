import { Schema, Model, SchemaType, isValidObjectId } from "mongoose";

/**
 * 错误信息对象，包含中文和英文两种语言的错误信息
 * Error messages object, containing error messages in both Chinese and English
 */
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
 * 翻译函数，根据环境变量 LANG 的值返回对应语言的错误信息
 * Translation function, returns error messages in the language corresponding to the value of the LANG environment variable
 * @param messageId - 错误信息的 ID
 * @param messageId - ID of the error message
 */
function i18n(messageId: string) {
  if (messageId in messages) {
    const message = messages[messageId];
    const lang = (process.env.LANG ?? "").match("CN");
    if (lang) return message["zh-CN"];
    else return message["en-US"];
  }
}

/**
 * MongooseFindByReference 函数，用于在 Mongoose 中通过引用查找数据
 * MongooseFindByReference function, used to find data by reference in Mongoose
 * @param schema - Mongoose 的 Schema 对象
 * @param schema - The Schema object of Mongoose
 */
export function MongooseFindByReference(schema: Schema) {
  // 假设得到的不是 Schema 则报错
  // Throw an error if the received is not a Schema
  if (schema.constructor.name !== "Schema")
    throw new Error(i18n("schemaTypeError"));

  // 对 Schema 挂上钩子
  // Hook on the Schema
  schema.pre(["find", "findOne", "distinct"], async function (next) {
    /** 当前的 Model 们
     *  Current Models */
    const models = this.model.db.models;

    // 对  Models 进行判空
    // Check Models for emptiness
    if (Object.keys(models ?? {}).length === 0)
      throw new Error(i18n("modelCountError"));

    /** 当前的 Schema
     *  Current Schema */
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
        // If it is Ref Path, read it directly
        const options = obj.options;
        if (options?.ref?.length) refKey = options.ref;
        // else if (options?.refPath?.length)
        //   if (schema.path(options.refPath)) return { refPath: options.refPath };
      } else if ((obj as any)?.$embeddedSchemaType) {
        // 假设是数组就读取子项 Type
        // If it is an array, read the subitem Type
        return getModel((obj as any).$embeddedSchemaType);
      }
      return models[refKey];
    }

    /**
     * 将路径数组转换为引用路径数组
     * Transforms a path array into a reference path array
     * @param paths - 要转换的路径数组
     * @param paths - The path array to be transformed
     * @param tSchema - 当前的 Mongoose Schema 对象，默认为主 Schema
     * @param tSchema - The current Mongoose Schema object, default is the main Schema
     * @returns 转换后的引用路径数组
     * @returns The transformed reference path array
     * @exmples ['owner','name','en-US']  => ['owner', 'name.en-US']
     */
    function transPath2RefPath(
      paths: string[],
      tSchema: Schema = schema
    ): string[] {
      let previousPath: string[] = [];

      // 如果还有路径没有转换完
      // If there are still paths that have not been converted
      while (paths.length > 0) {
        const path = paths.shift() ?? "";

        // 如果 Schema 里面有这个路径
        // If the Schema has this path
        if (tSchema.path([...previousPath, path].join("."))) {
          previousPath.push(path);
        } else {
          const currentModel = getModel(tSchema.path(previousPath.join(".")));
          if (currentModel) {
            const recurseResult = transPath2RefPath(
              [path, ...paths],
              currentModel.schema
            );
            if (!paths.length) {
              return [previousPath.join("."), ...recurseResult];
            } else {
              previousPath.push(...recurseResult);
            }
          } else return [...previousPath, path];
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

    type Dict = { [key: string]: any };
    function flatten(
      dd: Dict,
      separator: string = ".",
      prefix: string = ""
    ): Dict {
      // transform nested object to dot notation
      `
        { person: { name: "John" } } to { "person.name": "John" }
      `;
      let result: Dict = {};

      for (let [k, v] of Object.entries(dd)) {
        let key = prefix ? `${prefix}${separator}${k}` : k;

        if (
          v.constructor === Object &&
          !Object.keys(v).some((checkKey) => checkKey.startsWith("$"))
        ) {
          let flatObject = flatten(v as Dict, separator, key);
          result = { ...result, ...flatObject };
        } else {
          result[key] = v;
        }
      }

      return result;
    }

    async function lookup(
      prevPaths: string[],
      conditions: Record<string, any>,
      cSchema = schema
    ): Promise<any> {
      // 如果 Conditions 不能进行分析就直接返回它
      // If Conditions cannot be analyzed, return it directly
      if (
        typeof conditions !== "object" ||
        conditions === null ||
        Object.keys(conditions).length === 0
      ) {
        return conditions;
      }

      /** 最终结果 */
      /** Final result */
      const result: Record<string, any> = {};

      // 获取前一个 Path 的值
      // Get the value of the previous Path
      const prevPathsValue = cSchema.path(prevPaths.join("."));

      for (let [paths, value] of Object.entries(conditions)) {
        // paths 1 = 'owner.name.en'; value 1 = 'Dean'

        // 判断 Paths 存在于 Schema 上
        // Determine whether Paths exists on Schema
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
        // Current Paths array
        const currentPathsArray = paths.startsWith("$")
          ? paths === "$"
            ? prevPaths
            : []
          : [...prevPaths, paths];

        // 当前的 Paths
        // Current Paths
        const currentPathsString = currentPathsArray.join(".");

        // 当前的 Paths 对应的值
        // The value corresponding to the current Paths
        const currentPathsValue = cSchema.path(currentPathsString);

        if (!paths.startsWith("$"))
          if (currentPathsValue === undefined) {
            const currentModel = getModel(prevPathsValue);
            if (currentModel) {
              const subCoditions = await lookup([], value, currentModel.schema);
              if (subCoditions) {
                const ids = (
                  await currentModel.find(
                    flatten({ [paths]: subCoditions }),
                    "_id"
                  )
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
          Object.keys(value).length > 0 &&
          !isValidObjectId(value)
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
