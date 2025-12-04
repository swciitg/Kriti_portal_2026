import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ["SuperAdmin", "Convener", "TechSecy", "Judge", "Company"], 
    required: true 
  }
});

export default mongoose.model("User", UserSchema);
