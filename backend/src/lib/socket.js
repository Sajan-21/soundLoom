import { Server } from "socket.io";
import { Message } from "../models/message.model.js";

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      credentials: true,
    },
  });

  const userSockets = new Map(); // { userId: socketId }
  const userActivities = new Map(); // { userId: activity }

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // User connects
    socket.on("user_connected", (userId) => {
      userSockets.set(userId, socket.id);
      userActivities.set(userId, "Idle");

      console.log(`User connected: ${userId} (Socket: ${socket.id})`);

      // Notify all clients about the new user
      io.emit("user_connected", userId);

      // Send the current list of online users and activities
      socket.emit("users_online", Array.from(userSockets.keys()));
      socket.emit("activities", Array.from(userActivities.entries()));
    });

    // User updates their activity
    socket.on("update_activity", ({ userId, activity }) => {
      console.log(`Activity updated: ${userId} - ${activity}`);
      userActivities.set(userId, activity);
      io.emit("activity_updated", { userId, activity });
    });

    // Sending a message
    socket.on("send_message", async (data) => {
      try {
        const { senderId, receiverId, content } = data;
        console.log(`Message received:`, data);

        // Save the message to the database
        const message = await Message.create({
          senderId,
          receiverId,
          content,
        });

        console.log(`Message saved: ${message}`);

        // Send the message to the sender immediately
        socket.emit("message_sent", message);

        // If the receiver is online, send the message in real-time
        const receiverSocketId = userSockets.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receive_message", message);
        }
      } catch (error) {
        console.error("Message error:", error.message);
        socket.emit("message_error", error.message);
      }
    });

    // User disconnects
    socket.on("disconnect", () => {
      let disconnectedUserId;
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          userSockets.delete(userId);
          userActivities.delete(userId);
          break;
        }
      }

      if (disconnectedUserId) {
        console.log(`User disconnected: ${disconnectedUserId}`);
        io.emit("user_disconnected", disconnectedUserId);
      }
    });
  });
};
