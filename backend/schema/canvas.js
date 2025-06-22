const mongoose = require("mongoose");

const StrokeSchema = new mongoose.Schema({
  username: String,
  color: String,
  lineWidth: Number,
  points: [{ x: Number, y: Number }],
});

const CanvasSchema = new mongoose.Schema({
  title: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  strokes: [StrokeSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Canvas", CanvasSchema);
