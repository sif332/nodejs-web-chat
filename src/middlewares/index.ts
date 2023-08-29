import { Response, NextFunction, CustomRequest } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const TOKEN_SECRET = process.env.TOKEN_SECRET ?? "token1234";

export function jwtTokenVerify(
  req: CustomRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split("Bearer ")[1];
  if (!token) {
    return res.status(401).send({ message: "Unauthorized Missing Auth Token" });
  }
  try {
    const decodedToken = jwt.verify(token, TOKEN_SECRET) as IJwtToken;
    req.decodedToken = decodedToken;
    next();
  } catch (error) {
    return res.status(401).send({ message: "Unauthorized Invalid Auth Token" });
  }
}
