# mongoose-find-by-reference

[![npm version](https://img.shields.io/npm/v/mongoose-find-by-reference.svg)](https://www.npmjs.com/package/mongoose-find-by-reference)
[![Build Status](https://travis-ci.com/cheezone/mongoose-find-by-reference.svg?branch=master)](https://travis-ci.com/cheezone/mongoose-find-by-reference)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/cheezone/mongoose-find-by-reference/issues)
[![Downloads](https://img.shields.io/npm/dm/mongoose-find-by-reference.svg)](https://img.shields.io/npm/dm/mongoose-find-by-reference.svg)

This is a Mongoose plugin that allows your Mongoose to support lookup on reference fields.

Its principle is to parse your find request. When it finds that you want to filter the value of the reference field, it will read the model corresponding to the reference field and perform the search, obtain the id array that matches the filter, and then put the reference field The filter of the value is replaced by the judgment of whether the value of the reference field is in the id array.

# install

```bash
npm i -S mongoose-find-by-reference
```

# useage

The `mongoose-find-by-reference` module exposes a single function that you can
pass to [Mongoose schema's `plugin()` function](https://mongoosejs.com/docs/api.html#schema_Schema-plugin).

```javascript
const schema = new mongoose.Schema({
  /* ... */
});
schema.plugin(require('mongoose-find-by-reference'));
```

Then, you can use it like this.

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

Its conditions will be automatically replaced with:

```typescript
const newConditions = {
  $and: {
    parents: {
      $in: [/* ObjectIDs for Eligible Cats */],
    },
    sex: 0,
  },
};
```