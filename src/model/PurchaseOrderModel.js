const { Schema, model } = require('mongoose');
const { Currency, PurchaseOrderStatus } = require('../lib/Enums');
const uuidField = require('./commonFields/UUIDField');
const createdAtField = require('./commonFields/CreatedAtField');

const collectionName = 'PurchaseOrder';

const schema = new Schema({
  ...uuidField(collectionName),
  ...createdAtField,
  buyer: {
    type: String,
    ref: 'User',
    required: true,
    index: true,
  },
  deliveryOrders: [{
    type: String,
    ref: 'DeliveryOrder',
    required: true,
  }],
  items: [{
    type: String,
    ref: 'OrderItem',
    required: true,
  }],
  payments: [{
    type: String,
    ref: 'PaymentTransaction',
  }],
  quantity: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    enum: Currency.toList(),
  },
  price: {
    type: Number,
    required: true,
  },
  deliveryPrice: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false,
  },
  status: {
    type: String,
    required: true,
    enum: PurchaseOrderStatus.toList(),
  },
});

schema.methods.getTagName = function getTagName() {
  return `PurchaseOrder:${this._id}`;
};

module.exports = new model(collectionName, schema);
