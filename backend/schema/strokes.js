const mongoose = require("mongoose");

const StrokeSchema = new mongoose.Schema({
  username: String,
  color: String,
  lineWidth: Number,
  points: [{ x: Number, y: Number }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Stroke", StrokeSchema);