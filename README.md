# mongoose-find-by-reference

[![npm version](https://img.shields.io/npm/v/mongoose-find-by-reference.svg)](https://www.npmjs.com/package/mongoose-find-by-reference)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/cheezone/mongoose-find-by-reference/issues)
[![Downloads](https://img.shields.io/npm/dm/mongoose-find-by-reference.svg)](https://img.shields.io/npm/dm/mongoose-find-by-reference.svg)

English | [简体中文](README.zh_CN.md)

This is a Mongoose plugin that allows your Mongoose to support lookup on reference fields.

Reference field is like this:

```typescript
{
    type: MongooseSchema.Types.ObjectId,
    ref: 'XXX',
  }
```

Its principle is to parse your find request. When it finds that you want to filter the value of the reference field, it will read the model corresponding to the reference field and perform the search, obtain the id array that matches the filter, and then put the reference field The filter of the value is replaced by the judgment of whether the value of the reference field is in the id array.

# install

```bash
npm i -S mongoose-find-by-reference
```

# usage

The `mongoose-find-by-reference` module exposes a single function that you can
pass to [Mongoose schema's `plugin()` function](https://mongoosejs.com/docs/api.html#schema_Schema-plugin).

```javascript
const { MongooseFindByReference } = require("mongoose-find-by-reference");
const schema = new mongoose.Schema({
  /* ... */
});
schema.plugin(MongooseFindByReference);
```

Then, you can use it like this.

```typescript
const result = await catModel
  .find({
    $and: {
      parents: {
        "owner.name": "Dean",
      },
      sex: 0,
    },
  })
  .exec();
```

Its conditions will be automatically replaced with:

```typescript
const newConditions = {
  $and: {
    parents: {
      $in: [
        /* ObjectIDs for Eligible Cats */
      ],
    },
    sex: 0,
  },
};
```

# need help

Now this project needs everyone's help, and there is currently a lack of testing.

Thanks to:

<a href="https://github.com/cheezone/mongoose-find-by-reference/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=cheezone/mongoose-find-by-reference" />
</a>
 

Thanks you so much for your contribution! 🎉 I appreciate your time and effort in submitting the pull request. Your changes are valuable, and we're grateful for your commitment to improving our project. If you have any further suggestions or if there's anything else you'd like to contribute, please feel free to let me know. Thanks again! 🙌
 
