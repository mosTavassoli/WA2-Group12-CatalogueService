const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  description: String,
  price: {
    type: Number,
    required: true,
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  category: {
    type: String,
    enum: ["STYLE", "FOOD", "TECH", "SPORT"],
    required: true,
  },
  stars: Number,
});

module.exports = mongoose.model("Product", productSchema);
