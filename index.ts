import { Schema, Model } from 'mongoose'
export function MongooseFindByReference(schema: Schema) {
    if (schema.constructor.name !== 'Schema')
        throw new Error(
            '参数 "schema" 的类型得是 "Schema"。\n param "schema" type must be "Schema".',
        );

    schema.pre(['find', 'findOne'], async function (next) {
        /** 当前的 Model 们 */
        const models = this.model.db.models;

        if (!models || Object.keys(models).length === 0)
            throw new Error(
                '访问到的 Model 数量为 0 或者不存在。\n The number of models accessed is 0 or does not exist.',
            );

        const getRefModel = (obj: any): Model<any> | undefined | {
            refPath
            : string
        } => {
            let refKey = ''
            if (obj)
                if (obj.instance === 'ObjectID') {
                    if (obj.options?.ref?.length)
                        refKey = obj.options.ref
                    else if (obj.options?.refPath?.length)
                        if (schema.path(obj.options.refPath))
                            return { refPath: obj.options.refPath }
                }
                else if (obj?.$embeddedSchemaType) {
                    return getRefModel(obj.$embeddedSchemaType)
                }
            if (refKey)
                return Object.keys(models).includes(refKey) &&
                    models[refKey] || undefined

        }




        const schema: Schema = this.model.schema;

        const loopUpdateCoditions = async (
            prevPaths: string[],
            conditions: Record<string, any>,
            cSchema = schema,
        ): Promise<any> => {
            if (
                typeof conditions !== 'object' ||
                conditions === null ||
                Object.keys(conditions).length === 0
            )
                return conditions;
            const result: Record<string, any> = {};
            const prevPathsValue = cSchema.path(prevPaths.join('.'));
            for (let [paths, value] of Object.entries(conditions)) {

                if (paths.includes('.'))
                    [[paths, value]] = Object.entries(
                        [...paths.split('.'), value as any].reduceRight(
                            (previousValue, currentValue) =>
                                currentValue === '$'
                                    ? previousValue
                                    : { [currentValue]: previousValue },
                        ),
                    );

                const currentPathsArray = paths.startsWith('$')
                    ? paths === '$'
                        ? prevPaths
                        : []
                    : [...prevPaths, paths];
                const currentPathsString = currentPathsArray.join('.');
                const currentPathsValue = cSchema.path(currentPathsString);
                if (!paths.startsWith('$'))
                    if (currentPathsValue === undefined) {
                        const currentModel = getRefModel(prevPathsValue);
                        if (currentModel) {
                            if ('refPath' in currentModel) {
                                console.error(`Can't do it with 'refPath' because we can't read it in Query.`)
                                return undefined
                            } else {
                                const subCoditions = await loopUpdateCoditions(
                                    [],
                                    value,
                                    currentModel.schema,
                                );
                                if (subCoditions) {
                                    const ids = (
                                        await currentModel.find({ [paths]: subCoditions }, '_id')
                                    ).map((v) => v._id);

                                    return { $in: ids };
                                }
                            }
                        }
                    }

                if (Array.isArray(value))
                    Object.assign(result, {
                        [paths]: await Promise.all(
                            value.map(
                                async (v) =>
                                    await loopUpdateCoditions(currentPathsArray, v, cSchema),
                            ),
                        ),
                    });
                else if (
                    typeof value === 'object' &&
                    value !== null &&
                    Object.keys(value).length > 0
                )
                    Object.assign(result, {
                        [paths]: Object.fromEntries(
                            await Promise.all(
                                Object.entries(value).map(
                                    async ([k, v]) =>
                                        Object.entries(
                                            await loopUpdateCoditions(
                                                currentPathsArray,
                                                {
                                                    [k]: v,
                                                },
                                                cSchema,
                                            ),
                                        )[0],
                                ),
                            ),
                        ),
                    });
                else result[paths] = value;
            }
            return result;
        };
        (this as any)._conditions = await loopUpdateCoditions(
            [],
            (this as any)._conditions,
        );


        next();
    });
}