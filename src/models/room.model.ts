import { Schema, model } from "mongoose";

const roomSchema = new Schema({
  room_name: {
    type: String,
    required: true,
  },
  room_profile_pic: {
    type: String,
  },
  created_at: {
    type: Date,
    required: true,
  },
});

const Room = model("rooms", roomSchema);

export default Room;
