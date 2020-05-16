const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Create Schema
const NotificationSwitchSchema = new Schema({
  user_id: {
    type: String,
    required: true
  },
  target: {
    type: String,
    required: true
  },
  notify: {
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

module.exports = NotificationSwitch = mongoose.model("notificationsSwitch", NotificationSwitchSchema);