const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const http = require("http");

const authRoutes = require("./routes/authRoutes");
const pollRoutes = require("./routes/pollRoutes");
const userRoutes = require("./routes/userRoutes");
const authMiddleware = require("./middlewares/authMiddleware");
const errorMiddleware = require("./middlewares/errorMiddleware");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/polls", authMiddleware, pollRoutes(io));
app.use("/api/users", authMiddleware, userRoutes);

app.use(errorMiddleware);

io.on("connection", (socket) => {
  console.log("New user connected");

  socket.on("vote", async (data) => {
    try {
      const { pollId, optionId } = data;
      io.emit("voteUpdate", data);
    } catch (error) {
      console.error("Error handling vote:", error);
    }
  });

  socket.on("comment", (data) => {
    io.emit("updateComments", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
