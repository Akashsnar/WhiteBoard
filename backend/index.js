const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const strokeSchema = require("./schema/strokes");
const connectDB = require("./db/mongodb");
const dotenv = require("dotenv");
const Canvas = require("./schema/canvas");
const auth = require("./routes/auth");
const canvasRoutes = require("./routes/canvas");

dotenv.config();

const app = express();
const server = http.createServer(app);

connectDB();
// Allow connections from frontend
app.use(cors());
app.use(express.json());
app.use("/auth", auth);
app.use("/canvas", canvasRoutes);
app.get("/", (req, res) => {
  res.send("Welcome to the Canvas API");
});

const activeUsersPerCanvas = {};
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL, // Your React frontend port
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("draw", async ({ canvasId, stroke }) => {
    console.log("hit draw event", canvasId, stroke);

    io.to(canvasId).emit("draw", { stroke });

    await Canvas.findByIdAndUpdate(canvasId, {
      $push: { strokes: stroke }
    });
  });

  socket.on("request-initial-data", async ({canvasId}) => {
    const strokes = await Canvas.findById(canvasId);
    socket.emit("initial-data", strokes?.strokes || []);
  });


  socket.on("join-canvas", ({ canvasId, username }) => {
    socket.join(canvasId);
    socket.canvasId = canvasId;
    socket.username = username;

    if (!activeUsersPerCanvas[canvasId]) activeUsersPerCanvas[canvasId] = new Set();
    activeUsersPerCanvas[canvasId].add(username);

    io.to(canvasId).emit("user-list", Array.from(activeUsersPerCanvas[canvasId]));
  });


  socket.on("disconnect", () => {
    const { canvasId, username } = socket;
    if (canvasId && username && activeUsersPerCanvas[canvasId]) {
      activeUsersPerCanvas[canvasId].delete(username);
      io.to(canvasId).emit("user-list", Array.from(activeUsersPerCanvas[canvasId]));
    }
  });
  
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
