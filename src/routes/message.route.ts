import express, { Request } from "express";
import { jwtTokenVerify } from "../middlewares/index.js";
import UserRoom from "../models/userRoom.model.js";
import Message from "../models/message.model.js";

const router = express.Router();

router.use(jwtTokenVerify);

router.get("/by-roomid", async (req: Request, res) => {
  const { roomID } = req.query;
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
    const messages = await Message.find({ room_id: roomID }).sort({
      created_at: -1,
    });
    return res.status(201).send(messages);
  } catch (error) {
    const err = error as Error;
    //Conflict
    return res.status(409).send({ message: err.message });
  }
});

router.post("/by-roomid", async (req: Request, res) => {
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
