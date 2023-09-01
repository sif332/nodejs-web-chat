import pg from "pg";
import dotenv from "dotenv";

dotenv.config();
export interface IUsers {
  user_id: number;
  username: string;
  display_name: string;
  password_hash: string;
  role: string[];
  profile_pic: string;
  created_at: Date;
}

export interface IUsers_room {
  user_id: number;
  room_id: number;
  created_at: Date;
}

export interface IRooms {
  room_id: number;
  room_name: string;
  room_profile_pic: string;
  created_at: Date;
}

export interface IMessages {
  message_id: number;
  user_id: number;
  room_id: number;
  message: string;
  created_at: Date;
}

export const postgresClient = new pg.Client({
  host: process.env.POSTGRES_BASEURL ?? "localhost",
  port: 5432,
  database: "webchat-dev",
  user: process.env.POSTGRES_USER ?? "sif332",
  password: process.env.POSTGRES_PASSWORD ?? "xai332",
});
