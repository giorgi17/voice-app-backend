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
  },
  date: {
    type: Date,
    default: Date.now
  },
});

module.exports = Follower = mongoose.model("followers", FollowerSchema);