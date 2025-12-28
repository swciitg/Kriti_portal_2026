import mongoose from "mongoose";

const pptScheduleSchema = new mongoose.Schema(
  {
    ps: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PS",
      required: true,
      unique : true
    },
    schedule: [
      {
        hostelId: {
          type: String,
          required: true,
        },
        date: {
          type: String,
          required: true,
        },
        time: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("PptSchedule", pptScheduleSchema);
