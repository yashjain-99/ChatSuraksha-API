import { Server as socketServer } from "socket.io";

export default function (server) {
  const io = new socketServer(server, {
    cors: {
      origin: "http://localhost:1234",
    },
  });
  const connectedUsers = [];

  io.on("connection", (socket) => {
    const socketId = socket.id;
    const userId = socket.handshake.query.userId;
    const fullName = socket.handshake.query.fullName;
    socket.on("addUser", (userId) => {
      console.log("adding user");
      const isUserAlreadyConnected = connectedUsers.find(
        (user) => user.userId === userId
      );
      if (!isUserAlreadyConnected) {
        connectedUsers.push({ userId, socketId, fullName });
      }
      console.log("connected users", connectedUsers);
      socket.on("disconnect", () => {
        const index = connectedUsers.findIndex(
          (user) => user.userId === userId
        );
        connectedUsers.splice(index, 1);
        console.log("disconnected");
        console.log("connected users", connectedUsers);
      });
    });
    socket.on("sendMessage", ({ senderId, reciepientId, text }) => {
      const index = connectedUsers.findIndex(
        (user) => user.userId === reciepientId
      );
      if (index > -1) {
        let reciepientSocketId = connectedUsers[index].socketId;
        console.log("reciepient socket id", reciepientSocketId);
        socket.to(reciepientSocketId).emit("getMessage", {
          senderId,
          reciepientId,
          text,
          fullName,
        });
      }
    });
  });
}
