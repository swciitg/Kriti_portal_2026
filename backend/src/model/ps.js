import mongoose from "mongoose";

const DeliverableSchema = new mongoose.Schema({
  name : String,
  type : { type : String, enum : ["URL", "pdf", "zip", "ipynb", "docs", "pptx"] }
});

const PointsDistributionSchema = new mongoose.Schema({
  field : String,
  weightage : Number
});

const PSSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  registrationDeadline: { type: Date, required: true },
  submissionDeadline: { type: Date, required: true },
  judge: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  pdf: { type: String, match: /^https?:\/\/.+/, required: true },
  midEvalExist: { type: Boolean, default: false },
  midEvalSubmissionDeadline: { type: Date, default: null },
  prep: { type: String, enum: ["high", "mid", "low", "no"], required: true },
  points: Number,
  midEvalSubmissionDeliverables: [DeliverableSchema],
  submissionDeliverables: [DeliverableSchema],
  midEvalPointsDistribution: [PointsDistributionSchema],
  submissionPointsDistribution: [PointsDistributionSchema],
  pptPointsDistribution: [PointsDistributionSchema],
  pptSchedule: { type: String, match: /^https? :\/\/.+/ },
  rankings: [{ hostel_id: Number }],
});

export default mongoose.model("PS", PSSchema);
