import mongoose from "mongoose";

const TechSecySchema = new mongoose.Schema({
  user : { type : mongoose.Schema.Types.ObjectId, ref : "User", required : true },
  hostelId : { type : Number, required : true }
});

export default mongoose.model("TechSecy", TechSecySchema);
