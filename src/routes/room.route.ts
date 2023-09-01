import express, { CustomRequest } from "express";
import { jwtTokenVerify } from "../middlewares/index.js";
import { IRooms, postgresClient } from "../models/postgresDev.model.js";

const router = express.Router();

router.use(jwtTokenVerify);

router.post("/create", async (req: CustomRequest, res) => {
  const { roomName } = req.query;
  try {
    await postgresClient.query(
      "INSERT INTO public.rooms (room_name, room_profile_pic) VALUES ($1, $2)",
      [roomName, ""]
    );
    const room_id = (
      await postgresClient.query<IRooms>(
        "SELECT room_id FROM public.rooms WHERE room_name = $1",
        [roomName]
      )
    ).rows[0].room_id;
    await postgresClient.query(
      "INSERT INTO public.user_room (user_id, room_id) VALUES ($1, $2)",
      [parseInt(req.decodedToken!.userID, 10), room_id]
    );
    return res.status(201).send({ message: "Room Created" });
  } catch (error) {
    const err = error as Error;
    //Conflict
    return res.status(409).send({ message: err.message });
  }
});

router.post("/join", async (req: CustomRequest, res) => {
  const { roomID } = req.query;
  try {
    await postgresClient.query(
      "INSERT INTO public.user_room (user_id, room_id) VALUES ($1, $2)",
      [parseInt(req.decodedToken!.userID, 10), parseInt(roomID as string, 10)]
    );
    return res.status(201).send({ message: "Room Joined" });
  } catch (error) {
    const err = error as Error;
    //Conflict
    return res.status(409).send({ message: err.message });
  }
});

router.get("/belong", async (req: CustomRequest, res) => {
  const userID = req.decodedToken?.userID;
  try {
    const results = (
      await postgresClient.query(
        "SELECT user_room.*, rooms.room_name, rooms.room_profile_pic FROM user_room JOIN rooms ON user_room.room_id = rooms.room_id WHERE user_id = $1",
        [parseInt(userID as string, 10)]
      )
    ).rows;

    const rooms = results.map((room) => {
      return {
        _id: room.room_id.toString(),
        room_name: room.room_name,
        room_profile_pic: room.room_profile_pic,
        created_at: room.created_at.getTime().toString(),
      };
    });

    return res.status(201).send(rooms);
  } catch (error) {
    const err = error as Error;
    //Conflict
    return res.status(409).send({ message: err.message });
  }
});

router.get("/list-all", async (req: CustomRequest, res) => {
  const token = req.decodedToken;
  //Convert Object to Array
  const role = Object.values(token!.role);
  if (!role.includes("admin")) {
    return res.status(401).send({ message: "Unauthorized You're not Admin" });
  }
  try {
    const rooms = (
      await postgresClient.query<IRooms>("SELECT * FROM public.rooms")
    ).rows;
    return res.status(201).send(rooms);
  } catch (error) {
    const err = error as Error;
    //Conflict
    return res.status(409).send({ message: err.message });
  }
});

export default router;
