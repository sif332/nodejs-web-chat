import { Schema, model } from "mongoose";

const userSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  display_name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: [String],
    required: true,
  },
  profile_pic: String,
  created_at: {
    type: Date,
    required: true,
  },
});

const User = model("users", userSchema);

export default User;
