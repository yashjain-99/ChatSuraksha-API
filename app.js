import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import socketIO from "./socket.js";
import userRoutes from "./routes/user.js";
import conversationRoutes from "./routes/conversation.js";
import imageRoutes from "./routes/image.js";
import inboxRoutes from "./routes/inbox.js";
import authRoutes from "./routes/auth.js";
import refreshRoute from "./routes/refresh.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import "./connection.js";
import cookieParser from "cookie-parser";
import validate from "./routes/validate.js";
import authenticateJWT from "./middlewares/autheticateJWT.js";
import { registerTotp, validateTotp, verifyTotp } from "./controllers/totp.js";

const app = express();
const server = http.createServer(app);
socketIO(server);
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS setup
const allowedOrigins =
  process.env.NODE_ENV === "development"
    ? [process.env.DEV_URL]
    : [process.env.PROD_URL];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(cookieParser());

// Mount route modules
app.use("/api/auth", authRoutes);
app.post("/api/totp/validate", validateTotp);
app.use("/api/validate", validate);
app.use("/api/refresh", refreshRoute);

app.use(authenticateJWT);
app.post("/api/totp/register", registerTotp);
app.post("/api/totp/verify", verifyTotp);
app.use("/api/users", userRoutes);
app.use("/api/inbox", inboxRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/image", imageRoutes);

// Use the errorHandler middleware at the end
app.use(errorHandler);

// Start the server
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
