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
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your React frontend port
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
    //console.log("request-initial-data", canvasId, strokes, 46);
    
    //console.log("request-initial-data",canvasId, strokes[0]?.strokes);
    socket.emit("initial-data", strokes?.strokes || []);
  });


  socket.on("join-canvas", (canvasId) => {
    socket.join(canvasId);
  });
});


//const users = {}; // socket.id -> { username, color }
// io.on("connection", (socket) => {
//   console.log("User connected:", socket.id);

//   socket.on("register-user", ({ username, color }) => {
//     users[socket.id] = { username, color };
//     console.log(`User registered: ${username} (${color})`);
//   });


//   socket.on("draw", async(data) => {
//     const user = users[socket.id];
//     const payload = {
//       ...data,
//       userId: socket.id,
//       username: user?.username || "Anonymous",
//       color: user?.color || "black",
//     };

//     socket.broadcast.emit("draw", payload);
//     // save in db
//     console.dir(data, {depth : null});

//     const newStroke = new strokeSchema(data?.stroke);
//     await newStroke.save();

//   });

//   socket.on("request-initial-data", async () => {
//     const strokes = await strokeSchema.find({});
//     socket.emit("initial-data", strokes);
//   });

//   socket.on("disconnect", () => {
//     delete users[socket.id];
//     console.log("User disconnected:", socket.id);
//   });
// });

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
