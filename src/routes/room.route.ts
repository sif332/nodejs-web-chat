import express, { Request } from "express";
import { jwtTokenVerify } from "../middlewares/index.js";
import Room from "../models/room.model.js";
import UserRoom from "../models/userRoom.model.js";

const router = express.Router();

router.use(jwtTokenVerify);

router.post("/create", async (req: Request, res) => {
  const { roomName } = req.query;
  try {
    const room = await Room.create({
      room_name: roomName,
      room_profile_pic: "",
      created_at: new Date(),
    });
    await UserRoom.create({
      user_id: req.decodedToken?.userID,
      room_id: room.id,
      join_at: new Date(),
    });
    return res.status(201).send(room.id);
  } catch (error) {
    const err = error as Error;
    //Conflict
    return res.status(409).send({ message: err.message });
  }
});

router.post("/join", async (req: Request, res) => {
  const { roomID } = req.query;
  try {
    const userRoom = await UserRoom.create({
      user_id: req.decodedToken?.userID,
      room_id: roomID,
      join_at: new Date(),
    });
    return res.status(201).send(userRoom);
  } catch (error) {
    const err = error as Error;
    //Conflict
    return res.status(409).send({ message: err.message });
  }
});

router.get("/belong", async (req: Request, res) => {
  const userID = req.decodedToken?.userID;
  console.log(userID);
  try {
    const results = await UserRoom.find({ user_id: userID }).populate(
      "room_id",
      "room_name"
    );

    const rooms = results.map((room) => room.room_id);

    return res.status(201).send(rooms);
  } catch (error) {
    const err = error as Error;
    //Conflict
    return res.status(409).send({ message: err.message });
  }
});

router.get("/list-all", async (req: Request, res) => {
  const token = req.decodedToken;
  //Convert Object to Array
  const role = Object.values(token!.role);
  if (!role.includes("admin")) {
    return res.status(401).send({ message: "Unauthorized You're not Admin" });
  }
  try {
    const rooms = await Room.find({});
    return res.status(201).send(rooms);
  } catch (error) {
    const err = error as Error;
    //Conflict
    return res.status(409).send({ message: err.message });
  }
});

export default router;
