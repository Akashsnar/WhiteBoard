const express = require("express");
const router = express.Router();
const Canvas = require("../schema/canvas");
const authMiddleware = require("../middleware/auth");

// Create new canvas
router.post("/create", authMiddleware, async (req, res) => {
  const { title } = req.body;
  const canvas = new Canvas({
    title,
    createdBy: req.user.id,
    participants: [req.user.id],
    strokes: []
  });
  await canvas.save();
  res.json(canvas);
});

// Get all canvases (global)
router.get("/", async (req, res) => {
  const canvases = await Canvas.find().populate("createdBy", "username");
  res.json(canvases);
});



//delete canvas
router.delete("/delete/:id", authMiddleware, async (req, res) => {

  const {id} = req.params;
  console.log(id, req.params, 30);
  
  await Canvas.deleteOne({_id : id});
  res.json();
});
module.exports = router;
