const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Create Schema
const LikesSchema = new Schema({
  user_id: {
    type: String,
    required: true
  },
  post_id: {
    type: String,
    required: true
  }
});

module.exports = Likes = mongoose.model("likes", LikesSchema);