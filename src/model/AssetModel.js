const { Schema, model } = require('mongoose');
const createdAtField = require('./commonFields/CreatedAtField');
const uuidField = require('./commonFields/UUIDField');

const collectionName = 'Asset';

const schema = new Schema({
  ...uuidField(collectionName),
  ...createdAtField,

  owner: {
    type: String,
    ref: 'User',
    required: true,
  },
  path: {
    type: String,
    required: true,
    index: { unique: true },
  },
  url: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['UPLOADING', 'UPLOADED', 'FAILED', 'CANCELED'],
    required: true,
    default: 'UPLOADING',
  },
  type: {
    type: String,
    enum: ['IMAGE', 'VIDEO', 'PDF'],
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  mimetype: {
    type: String,
    required: true,
  },
});

module.exports = new model(collectionName, schema);
