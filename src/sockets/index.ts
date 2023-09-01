import { postgresClient } from "../models/postgresDev.model.js";

export async function createMessage(
  roomID: string,
  userID: string,
  username: string,
  message: string
) {
  try {
    const room = (
      await postgresClient.query(
        "SELECT * FROM public.user_room WHERE user_id = $1 AND room_id = $2",
        [parseInt(userID as string, 10), parseInt(roomID as string, 10)]
      )
    ).rows[0];
    if (!room) {
      return null;
    }
    const result = (
      await postgresClient.query(
        "INSERT INTO public.messages (user_id, room_id, message) VALUES ($1,$2,$3) RETURNING messages.*",
        [
          parseInt(userID as string, 10),
          parseInt(roomID as string, 10),
          message,
        ]
      )
    ).rows[0];
    const newMessage: IGetMessageByRoomID = {
      user_id: result.user_id.toString(),
      username: username,
      room_id: result.room_id.toString(),
      message: result.message,
      created_at: result.created_at,
    };
    return newMessage;
  } catch (error) {
    return null;
  }
}
