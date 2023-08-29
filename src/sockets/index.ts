import UserRoom from "../models/userRoom.model.js";
import Message from "../models/message.model.js";

export async function createMessage(
  roomID: string,
  userID: string,
  username: string,
  message: string
) {
  try {
    const room = await UserRoom.findOne({
      user_id: userID,
      room_id: roomID,
    });
    if (!room) {
      return null;
    }
    const createdMessage = await Message.create({
      room_id: roomID,
      user_id: userID,
      message: message,
      created_at: new Date(),
    });
    const newMessage: IGetMessageByRoomID = {
      user_id: createdMessage.user_id.toString(),
      username: username,
      room_id: createdMessage.room_id.toString(),
      message: createdMessage.message,
      created_at: createdMessage.created_at.toString(),
    };
    return newMessage;
    // return res.status(201).send(messages);
  } catch (error) {
    const err = error as Error;
    return null;
  }
}
