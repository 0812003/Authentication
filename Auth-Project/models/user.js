import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  title: String,
  content: String,
  createdAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  googleId: String,
  notes: [noteSchema],
});

const User = mongoose.model("User", userSchema);
export default User;
