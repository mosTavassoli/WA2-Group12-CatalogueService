const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
  },
  stars: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

module.exports = mongoose.model("Cooment", commentSchema);
