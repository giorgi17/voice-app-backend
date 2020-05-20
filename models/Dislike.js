const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Create Schema
const DislikesSchema = new Schema({
  user_id: {
    type: String,
    required: true
  },
  post_id: {
    type: String,
    required: true
  },
  post_author_id: {
    type: String,
    required: true
  },
   date: {
    type: Date,
    default: Date.now
  },
});

module.exports = Dislikes = mongoose.model("dislikes", DislikesSchema);