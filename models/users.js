import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    max: 50,
    required: true,
  },
  email: {
    type: String,
    required: true,
    max: 50,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    min: 6,
  },
  profilePicture: {
    type: String,
    default: "",
  },
  token: {
    type: String,
  },
});

const Users = mongoose.model("User", userSchema);

export default Users;
