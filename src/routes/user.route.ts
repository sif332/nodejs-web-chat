import express, { Request } from "express";
import User from "../models/user.model.js";
import { Error } from "mongoose";
import {
  compareHashPassword,
  hashPassword,
  jwtTokenGenerator,
} from "../utils/index.js";
import { jwtTokenVerify } from "../middlewares/index.js";

const router = express.Router();

router.get("/", jwtTokenVerify, async (req: Request, res) => {
  const userID = req.decodedToken?.userID;
  try {
    const user = await User.findOne({ _id: userID }, { password: 0 });
    //User not Found
    if (!user) {
      return res.status(404).send({ message: `Username ${userID} not found.` });
    }
    //If not admin and not his user data
    if (user.id !== userID) {
      return res.status(401).send({
        message: "Unauthorized This is not your Data",
      });
    }
    return res.status(200).send({
      userID: user.id,
      username: user.username,
      displayName: user.display_name,
    });
  } catch (error) {
    const err = error as Error;
    //Internal Server Error
    return res.status(500).send({ message: err.message });
  }
});

router.get("/by-username", jwtTokenVerify, async (req: Request, res) => {
  const { username } = req.query;
  const token = req.decodedToken;
  //Convert Object to Array
  const role = Object.values(token!.role);
  try {
    const user = await User.findOne({ username: username }, { password: 0 });
    //User not Found
    if (!user) {
      return res
        .status(404)
        .send({ message: `Username ${username} not found.` });
    }
    //If not admin and not his user data
    if (!role.includes("admin") && user.id !== token!.userID) {
      return res.status(401).send({
        message: "Unauthorized You're not Admin or This is not your Data",
      });
    }
    return res.status(200).send({
      userID: user.id,
      username: user.username,
      displayName: user.display_name,
    });
  } catch (error) {
    const err = error as Error;
    //Internal Server Error
    return res.status(500).send({ message: err.message });
  }
});

router.post("/register", async (req, res) => {
  const { username, displayName, password } = req.body;
  try {
    const hashPwd = await hashPassword(password);
    const user = await User.create({
      username: username,
      display_name: displayName,
      password: hashPwd,
      role: ["user"],
      profile_pic: "",
      created_at: new Date(),
    });
    return res.status(201).send(user.id);
  } catch (error) {
    const err = error as Error;
    //Conflict
    return res.status(409).send({ message: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username: username });
    if (!user) {
      //Not Found
      return res
        .status(404)
        .send({ message: `Username ${username} not found.` });
    }
    if (!(await compareHashPassword(password, user.password))) {
      //Unauthorized
      return res
        .status(401)
        .send({ message: `${username}: Incorrect password` });
    }
    const token = jwtTokenGenerator(user.id, user.role);
    return res.status(202).send({
      token: token,
      userID: user.id,
      username: user.username,
      displayName: user.display_name,
    });
  } catch (error) {
    const err = error as Error;
    //Conflict
    return res.status(409).send({ message: err.message });
  }
});

router.get("/list-all", jwtTokenVerify, async (req: Request, res) => {
  const token = req.decodedToken;
  if (!token) {
    return res.status(401).send({ message: "Unauthorized Missing Auth Token" });
  }
  //Convert Object to Array
  const role = Object.values(token.role);
  if (!role.includes("admin")) {
    return res.status(401).send({ message: "Unauthorized You're not Admin" });
  }
  try {
    const user = await User.find({});
    return res.status(200).send(user);
  } catch (error) {
    const err = error as Error;
    //Internal Server Error
    return res.status(500).send({ message: err.message });
  }
});

export default router;
