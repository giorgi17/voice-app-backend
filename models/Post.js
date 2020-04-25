const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Create Schema
const PostSchema = new Schema({
  user_id: {
    type: String,
    required: true
  },
  picture: {
    type: String,
    required: true
  },
  sound: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  }
});

module.exports = Post = mongoose.model("posts", PostSchema);