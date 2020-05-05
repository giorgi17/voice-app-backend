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
  }
});

module.exports = Dislikes = mongoose.model("dislikes", DislikesSchema);