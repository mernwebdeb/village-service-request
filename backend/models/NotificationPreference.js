const mongoose = require('mongoose');

const notificationPreferenceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    emailOnStatusChange: {
      type: Boolean,
      default: true,
    },
    emailOnNewMessage: {
      type: Boolean,
      default: true,
    },
    emailOnNewRequest: {
      type: Boolean,
      default: true,
    },
    inAppNotifications: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('NotificationPreference', notificationPreferenceSchema);