const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

let callRequests = [];

io.on("connection", (socket) => {
  socket.emit("me", socket.id);

  socket.on("signal", (data) => {
    console.log("Received signal event: ", data);
    if (data && data.to) {
      console.log("Emitting signal to: ", data.to);
      io.to(data.to).emit("signal", data);
    } else {
      console.log("Invalid data or missing 'to' field: ", data);
    }
  });

  socket.on("requestCall", (data) => {
    const request = {
      id: socket.id,
      name: data.name || "Anonymous",
      phoneNumber: data.phoneNumber,
      timestamp: new Date(),
    };
    callRequests.push(request);
    io.emit("updateDashboard", callRequests);
  });

  socket.on("adminCallUser", ({ id, name }) => {
    io.to(id).emit("callUser", { from: socket.id, name: "Admin" });
    io.to(id).emit("callAccepted");
  });

  socket.on("disconnect", () => {});
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
