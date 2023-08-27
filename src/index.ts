import express from "express";
import bodyParser from "body-parser";
import { Server } from "socket.io";
import http from "http";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRouter from "./routes/user.route.js";
import roomRouter from "./routes/room.route.js";
import messageRouter from "./routes/message.route.js";

dotenv.config();
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const port = process.env.PORT || 4000;
const MONGO_INITDB_ROOT_USERNAME = process.env.MONGO_INITDB_ROOT_USERNAME;
const MONGO_INITDB_ROOT_PASSWORD = process.env.MONGO_INITDB_ROOT_PASSWORD;
const MONGO_URL = `mongodb://${MONGO_INITDB_ROOT_USERNAME}:${MONGO_INITDB_ROOT_PASSWORD}@localhost:27017/web-chat`;
mongoose
  .connect(MONGO_URL)
  .then(() => console.log("Connected to Web-Chat Database"))
  .catch((error) =>
    console.log("Failed to connect Web-Chat Database:", error.message)
  );

app.use("/user", userRouter);
app.use("/room", roomRouter);
app.use("/message", messageRouter);
app.get("/", (req, res) => {
  return res.send({ message: "welcome to chatApp" });
});

server.listen(port, () => {
  console.log(`Socket io running at http://localhost:${port}/`);
});
