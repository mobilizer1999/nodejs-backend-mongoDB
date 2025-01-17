const { Schema, model } = require('mongoose');
const uuidField = require('./commonFields/UUIDField');
const createdAtField = require('./commonFields/CreatedAtField');

const collectionName = 'LiveStreamCategory';

const schema = new Schema({
  ...uuidField(collectionName),
  ...createdAtField,
  order: {
    type: Number,
    required: true,
  },
  imagePath: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

module.exports = new model(collectionName, schema);
