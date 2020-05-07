const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Create Schema
const NotificationsSchema = new Schema({
  user_id: {
    type: String,
    required: true
  },
  action_taker_user_id: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  // Who was affected by action, (Followed who, liked which post...)
  target: {
    type: String,
    required: true
  },
  seen: {
    type: Boolean,
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

module.exports = Notifications = mongoose.model("notifications", NotificationsSchema);