const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Create Schema
const CommentsSchema = new Schema({
  user_id: {
    type: String,
    required: true
  },
  post_id: {
    type: String,
    required: true
  },
  user_name: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  post_author_id: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = Comments = mongoose.model("comments", CommentsSchema);