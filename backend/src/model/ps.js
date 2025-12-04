import mongoose from "mongoose";

const DeliverableSchema = new mongoose.Schema({
  name: String,
  type: { type: String, enum: ["URL", "pdf", "zip", "ipynb", "docs", "pptx"] }
});

const PointsDistributionSchema = new mongoose.Schema({
  field: String,
  weightage: Number
});

const PSSchema = new mongoose.Schema({
  name: { type: String, required: true },
  registrationDeadline: Date,
  submissionDeadline: Date,
  judge: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  pdf: { type: String, match: /^https?:\/\/.+/ },
  midEvalExist: { type: Boolean, default: false },
  MidEvalSubmissionDeadline: { type: Date, default: null },
  prep: { type: String, enum: ["high", "mid", "low", "no"] },
  points: Number,
  midEvalSubmissionDeliverables: [DeliverableSchema],
  submissionDeliverables: [DeliverableSchema],
  midEvalPointsDistribution: [PointsDistributionSchema],
  submissionPointsDistribution: [PointsDistributionSchema],
  pptPointsDistibution : [PointsDistributionSchema],
  pptSchedule: { type: String, match: /^https?:\/\/.+/ },
  rankings: [{ hostel_id: Number }]
});

export default mongoose.model("PS", PSSchema);
