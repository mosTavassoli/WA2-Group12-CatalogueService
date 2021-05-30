import mongoose from "mongoose";

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

export default mongoose.model("Product", productSchema);
