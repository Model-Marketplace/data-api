const mongoose = require('mongoose');

const dataTextSchema = new mongoose.Schema(
  {
    status: {
      type: String, // pending, accepted, rejected
      required: true,
    },
    contributor: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true
    },
    approver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    corpus: {
      type: String,
      required: true
    },
    label: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const DataText = mongoose.model('DataText', dataTextSchema);

module.exports = DataText;