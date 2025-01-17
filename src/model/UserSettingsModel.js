const path = require('path');
const { Schema } = require('mongoose');

const { Currency, PushNotification, MeasureSystem } = require(path.resolve('src/lib/Enums'));
const { i18n: { locales } } = require(path.resolve('config'));

const userSettingsSchema = new Schema({
  pushNotifications: {
    type: [{
      type: String,
      enum: PushNotification.toList(),
      required: true,
    }],
    default: [],
  },
  language: {
    type: String,
    enum: locales,
    required: true,
  },
  currency: {
    type: String,
    enum: Currency.toList(),
    required: true,
  },
  measureSystem: {
    type: String,
    enum: MeasureSystem.toList(),
    required: true,
  },
}, { _id: false });

module.exports = userSettingsSchema;
