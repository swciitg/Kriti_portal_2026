import mongoose from "mongoose";

const TeamMemberSchema = new mongoose.Schema({
  name : String,
  email : { type : String, match : /.+\@.+\..+/ },
  rollNumber : Number,
  discordId : String
},
{ _id: false });

const TeamSchema = new mongoose.Schema({
  techSecy : { type : mongoose.Schema.Types.ObjectId, ref : "TechSecy", required : true },
  hostelId : { type : Number, required : true },
  ps : { type : mongoose.Schema.Types.ObjectId, ref : "PS", required : true },
  teamMembers : [TeamMemberSchema],
  submitted : { type : Boolean, default : false }
}); // removed {_id: false}

export default mongoose.model("Team", TeamSchema);
