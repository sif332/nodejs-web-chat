import express, { CustomRequest } from "express";
import { jwtTokenVerify } from "../middlewares/index.js";
import UserRoom from "../models/userRoom.model.js";
import Message from "../models/message.model.js";

const router = express.Router();

router.use(jwtTokenVerify);

router.get("/by-roomid", async (req: CustomRequest, res) => {
  const { roomID } = req.query;
  const userID = req.decodedToken?.userID;

  try {
    //find if user belong to this room or not
    const room = await UserRoom.findOne({
      user_id: userID,
      room_id: roomID,
    });
    if (!room) {
      return res.status(404).send({
        message: `Username ${roomID} not found or This room is not yours`,
      });
    }
    //query all message in that room by roomID and connect user_id of message collection to username of user collection
    const messagesQuery = await Message.find({ room_id: roomID })
      .sort({
        created_at: -1,
      })
      .populate<{ user_id: { _id: string; username: string } }>("user_id", {
        username: 1,
      });
    //clean data and map username to message before send
    const messages = messagesQuery.map((message) => {
      return {
        user_id: message.user_id._id,
        username: message.user_id.username,
        room_id: message.room_id,
        message: message.message,
        created_at: message.created_at,
      };
    });
    return res.status(201).send(messages);
  } catch (error) {
    const err = error as Error;
    //Conflict
    return res.status(409).send({ message: err.message });
  }
});

router.post("/by-roomid", async (req: CustomRequest, res) => {
  const { roomID } = req.query;
  const { message } = req.body;
  const userID = req.decodedToken?.userID;
  try {
    const room = await UserRoom.findOne({
      user_id: userID,
      room_id: roomID,
    });
    if (!room) {
      return res.status(404).send({
        message: `Username ${roomID} not found or This room is not yours`,
      });
    }
    const messages = await Message.create({
      room_id: roomID,
      user_id: userID,
      message: message,
      created_at: new Date(),
    });
    return res.status(201).send(messages);
  } catch (error) {
    const err = error as Error;
    //Conflict
    return res.status(409).send({ message: err.message });
  }
});

export default router;
