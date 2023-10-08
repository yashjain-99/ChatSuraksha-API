import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import socketIO from "./socket.js";
import userRoutes from "./routes/user.js";
import conversationRoutes from "./routes/conversation.js";
import authRoutes from "./routes/auth.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import "./connection.js";

const app = express();
const server = http.createServer(app);
socketIO(server);
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin:
      process.env.NODE_ENV == "development"
        ? process.env.DEV_URL
        : process.env.PROD_URL,
  })
);

// Mount route modules
app.use("/api/users", userRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/auth", authRoutes);

// Use the errorHandler middleware at the end
app.use(errorHandler);

// Start the server
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
