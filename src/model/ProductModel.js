const { Schema, model } = require('mongoose');
const { Currency, WeightUnitSystem, MarketType } = require('../lib/Enums');
const uuidField = require('./commonFields/UUIDField');
const createdAtField = require('./commonFields/CreatedAtField');

const collectionName = 'Product';

const schema = new Schema({
  ...uuidField(collectionName),
  ...createdAtField,
  seller: {
    type: String,
    ref: 'User',
    index: true,
  },
  title: {
    type: String,
    required: true,
    index: true,
  },
  description: {
    type: String,
    required: true,
    index: true,
  },
  price: {
    type: Number,
    required: true,
    index: true,
  },
  oldPrice: {
    type: Number,
  },
  currency: {
    type: String,
    enum: Currency.toList(),
  },
  assets: [{
    type: String,
    ref: 'Asset',
  }],
  category: {
    type: String,
    ref: 'ProductCategory',
    index: true,
  },
  brand: {
    type: String,
    ref: 'Brand',
    index: true,
  },
  freeDeliveryTo: [{
    type: String,
    enum: MarketType.toList(),
    required: true,
  }],
  weight: {
    type: {
      value: {
        type: Number,
        required: true,
      },
      unit: {
        type: String,
        enum: WeightUnitSystem.toList(),
        required: true,
      },
    },
  },
  shippingBox: {
    type: String,
    ref: 'ShippingBox',
    index: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true,
  },
});

schema.indexes([
  { currency: 1, price: 1 },
]);

schema.methods.getTagName = function getTagName() {
  return `${collectionName}:${this._id}`;
};

module.exports = new model(collectionName, schema);
