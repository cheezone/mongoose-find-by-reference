# mongoose-find-by-reference

[![npm version](https://img.shields.io/npm/v/mongoose-find-by-reference.svg)](https://www.npmjs.com/package/mongoose-find-by-reference)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/cheezone/mongoose-find-by-reference/issues)
[![Downloads](https://img.shields.io/npm/dm/mongoose-find-by-reference.svg)](https://img.shields.io/npm/dm/mongoose-find-by-reference.svg)

[English](README.md) |  简体中文

这是一个可以让你的 Mongoose 支持在参考字段上执行 Find 的插件。

参考字段，也就是类似这样的字段：

```typescript
{
    type: MongooseSchema.Types.ObjectId,
    ref: 'XXX',
  }
```

它的原理是解析你的 Find 请求，当发现你在访问参考字段的属性的时候，它就会读取参考字段对应的 Model 并进行 Find，将对参考字段值的筛选替换成符合条件的 ObjectId 数组。

# 安装

```bash
npm i -S mongoose-find-by-reference
```

# 使用

`mongoose-find-by-reference` 会导出一个适用于 [Mongoose Schema 的 `plugin()` ](https://mongoosejs.com/docs/api.html#schema_Schema-plugin) 的函数。

```javascript
const { MongooseFindByReference } = require('mongoose-find-by-reference');
const schema = new mongoose.Schema({
  /* ... */
});
schema.plugin(MongooseFindByReference);
```

接着，你可以这么用：

```typescript
const result = await catModel
  .find({
    $and: {
      parents: {
        'owner.name': 'Dean',
      },
      sex: 0,
    },
  })
  .exec();
```

搜索条件就会被替换成：

```typescript
const newConditions = {
  $and: {
    parents: {
      $in: [/* 符合条件的猫的 ObjectId 数组 */],
    },
    sex: 0,
  },
};
```