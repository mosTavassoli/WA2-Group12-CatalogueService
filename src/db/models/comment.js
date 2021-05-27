import mongoose from "mongoose";

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

// module.exports = mongoose.model("Coment", commentSchema);
export default mongoose.model("Comment", commentSchema);
