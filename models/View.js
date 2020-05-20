const mongoose = require("mongoose");
const Schema = mongoose.Schema;
// Create Schema
const ViewsSchema = new Schema({
  user_id: {
    type: String,
    required: true
  },
  post_id: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
});

module.exports = Views = mongoose.model("views", ViewsSchema);