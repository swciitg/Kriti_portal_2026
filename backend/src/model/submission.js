import mongoose from "mongoose";

const PenaltySchema = new mongoose.Schema(
  {
    category: String,
    weightage: Number,
  },
  { _id: false }
);

const SubmissionDeliverableSchema = new mongoose.Schema(
  {
    name: String,
    url: String,
  },
  { _id: false }
);

const SubmissionSchema = new mongoose.Schema({
  ps: { type: mongoose.Schema.Types.ObjectId, ref: "PS", required: true },
  hostelId: { type: Number, required: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
  midEval: { type: Boolean, required: true },
  submissionTime: { type: Date, required: true },
  penalty: [PenaltySchema],
  deliverables: [SubmissionDeliverableSchema],
  pptPointsDistribution: [Number],
  submissionPointsDistribution: [Number],
});

export default mongoose.model("Submission", SubmissionSchema);
