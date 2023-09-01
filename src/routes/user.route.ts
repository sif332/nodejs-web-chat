import express, { CustomRequest } from "express";
import {
  compareHashPassword,
  hashPassword,
  jwtTokenGenerator,
} from "../utils/index.js";
import { jwtTokenVerify } from "../middlewares/index.js";
import { IUsers, postgresClient } from "../models/postgresDev.model.js";

const router = express.Router();

router.get("/", jwtTokenVerify, async (req: CustomRequest, res) => {
  const userID = req.decodedToken?.userID;
  try {
    const user = (
      await postgresClient.query<IUsers>(
        "SELECT * FROM public.users WHERE user_id = $1",
        [userID]
      )
    ).rows[0];

    //User not Found
    if (!user) {
      return res.status(404).send({ message: `Username ${userID} not found.` });
    }
    //If not admin and not his user data
    if (user.user_id.toString() !== userID) {
      return res.status(401).send({
        message: "Unauthorized This is not your Data",
      });
    }
    return res.status(200).send({
      userID: user.user_id.toString(),
      username: user.username,
      displayName: user.display_name,
    });
  } catch (error) {
    const err = error as Error;
    //Internal Server Error
    return res.status(500).send({ message: err.message });
  }
});

router.get("/by-username", jwtTokenVerify, async (req: CustomRequest, res) => {
  const { username } = req.query;
  const token = req.decodedToken;
  //Convert Object to Array
  const role = Object.values(token!.role);
  try {
    const user = (
      await postgresClient.query<IUsers>(
        "SELECT * FROM public.users WHERE username = $1",
        [username]
      )
    ).rows[0];
    //User not Found
    if (!user) {
      return res
        .status(404)
        .send({ message: `Username ${username} not found.` });
    }
    //If not admin and not his user data
    if (!role.includes("admin") && user.user_id.toString() !== token!.userID) {
      return res.status(401).send({
        message: "Unauthorized You're not Admin or This is not your Data",
      });
    }
    return res.status(200).send({
      userID: user.user_id.toString(),
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
    await postgresClient.query(
      "INSERT INTO public.users (username, display_name, password_hash, role, profile_pic) VALUES ($1, $2, $3, $4, $5)",
      [username, displayName, hashPwd, ["user"], ""]
    );
    return res.status(201).send({ message: "User Inserted" });
  } catch (error) {
    const err = error as Error;
    //Conflict
    return res.status(409).send({ message: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = (
      await postgresClient.query<IUsers>(
        "SELECT * FROM public.users WHERE username = $1",
        [username]
      )
    ).rows[0];
    if (!user) {
      //Not Found
      return res
        .status(404)
        .send({ message: `Username ${username} not found.` });
    }
    if (!(await compareHashPassword(password, user.password_hash))) {
      //Unauthorized
      return res
        .status(401)
        .send({ message: `${username}: Incorrect password` });
    }
    const token = jwtTokenGenerator(user.user_id.toString(), user.role);
    return res.status(202).send({
      token: token,
      userID: user.user_id.toString(),
      username: user.username,
      displayName: user.display_name,
    });
  } catch (error) {
    const err = error as Error;
    //Conflict
    return res.status(409).send({ message: err.message });
  }
});

router.get("/list-all", jwtTokenVerify, async (req: CustomRequest, res) => {
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
    const users = (
      await postgresClient.query<IUsers>("SELECT * FROM public.users")
    ).rows;
    return res.status(200).send(users);
  } catch (error) {
    const err = error as Error;
    //Internal Server Error
    return res.status(500).send({ message: err.message });
  }
});

export default router;
