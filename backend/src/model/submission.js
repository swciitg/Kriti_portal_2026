import mongoose from "mongoose";

const PenaltySchema = new mongoose.Schema({
  category : String,
  weightage : Number
});

const SubmissionDeliverableSchema = new mongoose.Schema({
  name : String,
  url : { type : String, match : /^https? :\/\/.+/ }
});

const SubmissionSchema = new mongoose.Schema({
  ps : { type : mongoose.Schema.Types.ObjectId, ref : "PS", required : true },
  hostelId : { type : Number, required : true },
  team : { type : mongoose.Schema.Types.ObjectId, ref : "Team", required : true },
  midEval  : {type  : Boolean , required  : true},
  submissionTime : { type : Date, default : Date.now },
  penalty : [PenaltySchema],
  deliverables : [SubmissionDeliverableSchema],
  pptPointsDistibution : [Number], // this is in accordance with the order in the PS schema
  submissionPointsDistribution : [Number]
});

export default mongoose.model("Submission", SubmissionSchema);
