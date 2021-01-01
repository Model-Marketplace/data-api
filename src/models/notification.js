const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    body: {
      type: String,
      required: true
    },
    read: {
      type: Boolean,
      default: false,
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User'
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
)

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;