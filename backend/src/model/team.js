// model/team.js
import mongoose from "mongoose";

const TeamMemberSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true,
      trim: true 
    },
    email: { 
      type: String, 
      required: true,
      trim: true,
      lowercase: true
    },
    yearOfStudy: { 
      type: Number, 
      required: true
    },
    phoneNumber: { 
      type: String, 
      required: true,
      trim: true
    },
    department: { 
      type: String, 
      required: true,
      trim: true
    }
  },
  { _id: false }
);

const TeamSchema = new mongoose.Schema(
  {
    techSecy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TechSecy",
      required: true,
    },
    hostelId: {
      type: String,
      required: true,
    },
    ps: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PS",
      required: true,
    },
    teamMembers: {
      type: [TeamMemberSchema],
      required: true
    },
    submitted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const team = mongoose.model("Team", TeamSchema);
export default team;
