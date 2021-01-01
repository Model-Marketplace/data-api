const mongoose = require('mongoose');

const repoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    type: {
      type: String
    },
    owners: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    contributors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  {
    timestamps: true
  }
);

const Repo = mongoose.model('Repo', repoSchema);

module.exports = Repo;
