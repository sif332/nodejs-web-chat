import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const saltRounds = 10;
const TOKEN_SECRET = process.env.TOKEN_SECRET || "token1234";

export async function hashPassword(plainPwd: string) {
  const hashPwd = await bcrypt.hash(plainPwd, saltRounds);
  return hashPwd;
}

export async function compareHashPassword(plainPwd: string, hashPwd: string) {
  const comparePwd = await bcrypt.compare(plainPwd, hashPwd);
  return comparePwd;
}

export function jwtTokenGenerator(userID: string, role: string[]) {
  const payload: IJwtToken = {
    userID: userID,
    role: role,
  };
  const token = jwt.sign(payload, TOKEN_SECRET, { expiresIn: "1h" });
  return token;
}
