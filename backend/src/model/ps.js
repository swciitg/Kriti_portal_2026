// model/ps.js
import mongoose from "mongoose";

const DeliverableSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["url", "pdf", "zip", "ipynb", "doc", "pptx", "png", "jpg"],
      required: true,
    },
  },
  { _id: false }
);

const PointsItemSchema = new mongoose.Schema(
  {
    field: { type: String, required: true },
    weightage: { type: Number, required: true, min: 0, max: 100 },
  },
  { _id: false }
);

const PSSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    prep: {
      type: String,
      enum: ["high", "mid", "low", "no"],
      required: true,
    },

    startDate: { type: Date, required: true },
    submissionDeadline: { type: Date, required: true },
    registrationDeadline: { type: Date, required: true }, // add this line

    midEvalExist: { type: Boolean, default: false },
    midEvalSubmissionDeadline: { type: Date },

    judge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },
    companyPOC: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },

    pdf: {
      type: String,
      required: true,
      match: /^https?:\/\/.+/,
    },

    submissionDeliverables: { type: [DeliverableSchema], default: [] },
    midEvalSubmissionDeliverables: { type: [DeliverableSchema], default: [] },

    submissionPointsDistribution: { type: [PointsItemSchema], default: [] },
    pptPointsDistribution: { type: [PointsItemSchema], default: [] },
    midEvalPointsDistribution: { type: [PointsItemSchema], default: [] },

    overallPointsDistribution: { type: [Number], required:true}, // [300, 150, 150] ([sub, ppt, mid]) add this new line

    points: { type: Number, required: true, min: 0 },
    teamStrength: { type: Number, required: true, min: 1 },

    // removed pptSchedule
  },
  { timestamps: true }
);

// custom validators
PSSchema.path("midEvalSubmissionDeadline").validate(function (value) {
  if (this.midEvalExist && !value) return false;
  return true;
}, "Mid evaluation submission deadline is required when midEvalExist is true.");

PSSchema.path("submissionPointsDistribution").validate(function (value) {
  if (!value || !value.length) return true;
  const total = value.reduce((sum, item) => sum + (item.weightage || 0), 0);
  return total === 100;
}, "Submission points distribution must total 100.");

PSSchema.path("pptPointsDistribution").validate(function (value) {
  if (!value || !value.length) return true;
  const total = value.reduce((sum, item) => sum + (item.weightage || 0), 0);
  return total === 100;
}, "PPT points distribution must total 100.");

const PS = mongoose.model("PS", PSSchema);
export default PS;
