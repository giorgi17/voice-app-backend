const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Create Schema
const FollowerSchema = new Schema({
  followed_id: {
    type: String,
    required: true
  },
  follower_id: {
    type: String,
    required: true
  }
});

module.exports = Follower = mongoose.model("followers", FollowerSchema);