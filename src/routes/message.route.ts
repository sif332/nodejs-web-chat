import express, { CustomRequest } from "express";
import { jwtTokenVerify } from "../middlewares/index.js";
import { postgresClient } from "../models/postgresDev.model.js";

const router = express.Router();

router.use(jwtTokenVerify);

router.get("/by-roomid", async (req: CustomRequest, res) => {
  const { roomID } = req.query;
  const userID = req.decodedToken?.userID;

  try {
    //find if user belong to this room or not
    const room = (
      await postgresClient.query(
        "SELECT * FROM public.user_room WHERE user_id = $1 AND room_id = $2",
        [parseInt(userID as string, 10), parseInt(roomID as string, 10)]
      )
    ).rows[0];
    if (!room) {
      return res.status(404).send({
        message: `Username ${roomID} not found or This room is not yours`,
      });
    }
    //query all message in that room by roomID and connect user_id of message collection to username of user collection
    const messagesQuery = (
      await postgresClient.query(
        "SELECT messages.*, users.username FROM messages JOIN users ON messages.user_id = users.user_id WHERE messages.room_id = $1 ORDER BY messages.created_at DESC",
        [parseInt(roomID as string, 10)]
      )
    ).rows;
    //clean data and map username to message before send
    const messages = messagesQuery.map((message) => {
      return {
        user_id: message.user_id.toString(),
        username: message.username,
        room_id: message.room_id.toString(),
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
    const room = (
      await postgresClient.query(
        "SELECT * FROM public.user_room WHERE user_id = $1 AND room_id = $2",
        [parseInt(userID as string, 10), parseInt(roomID as string, 10)]
      )
    ).rows[0];
    if (!room) {
      return res.status(404).send({
        message: `Username ${roomID} not found or This room is not yours`,
      });
    }
    await postgresClient.query(
      "INSERT INTO public.messages (user_id, room_id, message) VALUES ($1,$2,$3)",
      [parseInt(userID as string, 10), parseInt(roomID as string, 10), message]
    );
    return res.status(201).send({ message: "Message Sent" });
  } catch (error) {
    const err = error as Error;
    //Conflict
    return res.status(409).send({ message: err.message });
  }
});

export default router;
