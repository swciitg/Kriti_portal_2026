import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  psId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PS",
    required: true,
  },
  requestType: {
    type: String,
    enum: ["EDIT_TEAM"], // update this later to have different requests
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  hostelId: {
    type: String,
  },
  psName: {
    type: String,
  }
});

export default mongoose.model("Request", requestSchema);