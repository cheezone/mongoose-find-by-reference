// index.ts
function MongooseFindByReference(schema) {
  if (schema.constructor.name !== "Schema")
    throw new Error('\u53C2\u6570 "schema" \u7684\u7C7B\u578B\u5F97\u662F "Schema"\u3002\n param "schema" type must be "Schema".');
  schema.pre(["find", "findOne"], async function(next) {
    const models = this.model.db.models;
    if (!models || Object.keys(models).length === 0)
      throw new Error("\u8BBF\u95EE\u5230\u7684 Model \u6570\u91CF\u4E3A 0 \u6216\u8005\u4E0D\u5B58\u5728\u3002\n The number of models accessed is 0 or does not exist.");
    function getRefModel(obj) {
      var _a, _b;
      return (obj == null ? void 0 : obj.instance) === "ObjectID" && ((_b = (_a = obj.options) == null ? void 0 : _a.ref) == null ? void 0 : _b.length) && Object.keys(models).includes(obj.options.ref) && models[obj.options.ref] || (obj == null ? void 0 : obj.$embeddedSchemaType) && getRefModel(obj.$embeddedSchemaType) || void 0;
    }
    const schema2 = this.model.schema;
    const loopUpdateCoditions = async (prevPaths, conditions, cSchema = schema2) => {
      if (typeof conditions !== "object" || conditions === null || Object.keys(conditions).length === 0)
        return conditions;
      const result = {};
      const prevPathsValue = cSchema.path(prevPaths.join("."));
      for (let [paths, value] of Object.entries(conditions)) {
        if (paths.includes("."))
          [[paths, value]] = Object.entries([...paths.split("."), value].reduceRight((previousValue, currentValue) => currentValue === "$" ? previousValue : { [currentValue]: previousValue }));
        const currentPathsArray = paths.startsWith("$") ? paths === "$" ? prevPaths : [] : [...prevPaths, paths];
        const currentPathsString = currentPathsArray.join(".");
        const currentPathsValue = cSchema.path(currentPathsString);
        if (!paths.startsWith("$")) {
          if (currentPathsValue === void 0) {
            const currentModel = getRefModel(prevPathsValue);
            if (currentModel) {
              const subCoditions = await loopUpdateCoditions([], value, currentModel.schema);
              if (subCoditions) {
                const ids = (await currentModel.find({ [paths]: subCoditions }, "_id")).map((v) => v._id);
                return { $in: ids };
              }
            }
          }
        }
        if (Array.isArray(value))
          Object.assign(result, {
            [paths]: await Promise.all(value.map(async (v) => await loopUpdateCoditions(currentPathsArray, v, cSchema)))
          });
        else if (typeof value === "object" && value !== null && Object.keys(value).length > 0)
          Object.assign(result, {
            [paths]: Object.fromEntries(await Promise.all(Object.entries(value).map(async ([k, v]) => Object.entries(await loopUpdateCoditions(currentPathsArray, {
              [k]: v
            }, cSchema))[0])))
          });
        else
          result[paths] = value;
      }
      return result;
    };
    this._conditions = await loopUpdateCoditions([], this._conditions);
    next();
  });
}
export {
  MongooseFindByReference
};
