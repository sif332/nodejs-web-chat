import { Schema, model, Types } from "mongoose";

//collection contain which users belong to which rooms
const userRoomSchema = new Schema({
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
  join_at: {
    type: Date,
    required: true,
  },
});
userRoomSchema.index({ user_id: 1, room_id: 1 }, { unique: true });

const UserRoom = model("user_rooms", userRoomSchema);

export default UserRoom;
