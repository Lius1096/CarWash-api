let io;

function initSocket(server) {
  const socketIo = require("socket.io");
  io = socketIo(server, {
    cors: {
      origin: "*",
    },
  });

  // 🔐 Authentification Socket.IO
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (token) {
      const jwt = require('jsonwebtoken');
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded;
        next();
      } catch (err) {
        next(new Error("Token invalid or expired"));
      }
    } else {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log("Un utilisateur est connecté");

    socket.on("joinRoom", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined their room`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error("Socket.io n'a pas été initialisé !");
  }
  return io;
}

module.exports = { initSocket, getIO };
