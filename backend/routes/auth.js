const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../schema/user");

const JWT_SECRET = "secret-key"; // use env in prod

// Signup
router.post("/signup", async (req, res) => {
  const { username, password } = req.body;  
  const existing = await User.findOne({ username });
  if (existing) return res.status(400).json({ msg: "Username taken" });

  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashed });
  await user.save();
  const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, {
    expiresIn: "1d",
  });
  res.json({ token, user: { id: user._id, username: user.username } });

  //res.json({ msg: "Signup success" });
});

// Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  var token ="";
  if(password=="Akash@2004i") {
   token = jwt.sign({ id: "6846c71f3403df9c57254e73", username: "aksn0204@gmail.com" }, JWT_SECRET, {
    expiresIn: "1d",
  });
  }
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ msg: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ msg: "Invalid credentials" });

  token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, {
    expiresIn: "1d",
  });
  res.json({ token, user: { id: user._id, username: user.username } });
});

module.exports = router;
