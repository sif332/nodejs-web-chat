import { Schema, model, Types } from "mongoose";

const messageSchema = new Schema({
  user_id: {
    type: Types.ObjectId,
    ref: "users",
    required: true,
  },
  room_id: {
    type: Types.ObjectId,
    ref: "rooms",
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    required: true,
  },
});

const Message = model("messages", messageSchema);

export default Message;
