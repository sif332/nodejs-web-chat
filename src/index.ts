import jwt from "jsonwebtoken";
import express from "express";
import bodyParser from "body-parser";
import { Server } from "socket.io";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import userRouter from "./routes/user.route.js";
import roomRouter from "./routes/room.route.js";
import messageRouter from "./routes/message.route.js";
import { createMessage } from "./sockets/index.js";
import { postgresClient } from "./models/postgresDev.model.js";

dotenv.config();
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [
      "https://webchat.xaiphersk.com",
      "http://localhost:3000",
      "http://192.168.1.33:3000",
    ],
  })
);

const server = http.createServer(app);

const port = process.env.PORT ?? 8080;
const TOKEN_SECRET = process.env.TOKEN_SECRET ?? "token1234";

postgresClient
  .connect()
  .then(async () => {
    console.log("Connected to Web-Chat-Dev Database");
  })
  .catch((error) =>
    console.log("Failed to connect Web-Chat-Dev Database:", error.message)
  );

app.use("/user", userRouter);
app.use("/room", roomRouter);
app.use("/message", messageRouter);
app.get("/", (req, res) => {
  return res.send({ message: "welcome to chatApp" });
});

const io = new Server(server, {
  cors: {
    origin: [
      "https://webchat.xaiphersk.com",
      "http://localhost:3000",
      "http://192.168.1.33:3000",
    ],
  },
  transports: ["websocket"],
});

io.on("connection", (socket) => {
  socket.on("joinRoom", (roomId: string) => {
    socket.join(roomId);
  });

  socket.on(
    "chat",
    async (
      token: string,
      roomID: string,
      username: string,
      message: string
    ) => {
      console.log(socket.id);
      if (!token) {
        socket.emit("invalidToken");
        return;
      }
      try {
        const decodedToken = jwt.verify(token, TOKEN_SECRET) as IJwtToken;
        const newMessage = await createMessage(
          roomID,
          decodedToken.userID,
          username,
          message
        );
        if (!newMessage) {
          return;
        }
        io.to(roomID).emit("chat", roomID, newMessage);
      } catch (error) {
        socket.emit("invalidToken");
        return;
      }
    }
  );

  socket.on("disconnect", () => {});
});

server.listen(port, () => {
  console.log(`Socket io running at Port: ${port}`);
});
