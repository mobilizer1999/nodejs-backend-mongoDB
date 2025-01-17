const { Schema, model } = require('mongoose');
const createdAtField = require('./commonFields/CreatedAtField');
const uuidField = require('./commonFields/UUIDField');

const collectionName = 'UserCartItem';
const schema = new Schema({
  ...uuidField(collectionName),
  ...createdAtField,

  user: {
    type: String,
    ref: 'User',
    required: true,
    index: true,
  },
  product: {
    type: String,
    ref: 'Product',
  },
  deliveryRate: {
    type: String,
    ref: 'DeliveryRate',
  },
  quantity: {
    type: Number,
    default: 1,
  },
});

module.exports = new model(collectionName, schema);
