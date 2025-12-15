import mongoose from "mongoose";

const CompanySchema = new mongoose.Schema({
  user : { type : mongoose.Schema.Types.ObjectId, ref : "User", required : true },
  ps : { type : mongoose.Schema.Types.ObjectId, ref : "PS", required : true },
  verified : { type : Boolean, default : false },
  submitMarkRequestPending : { type : Boolean, default : false }
});

export default mongoose.model("Company", CompanySchema);
