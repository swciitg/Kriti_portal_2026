import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';

const UserSchema = new mongoose.Schema({
  username : { type : String, unique : true, required : true },
  email : { type : String, unique : true, required : true },
  password : { type : String, required : true },
  role : { 
    type : String, 
    enum : ["SuperAdmin", "Convener", "TechSecy", "Judge", "Company"], 
    required : true 
  },
  lastLogin : { type : Date, default : null }
});

UserSchema.pre("save", async function () {
    if(this.isModified("password"))
        this.password = await bcrypt.hash(this.password, 10);
} )

UserSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password , this.password)
}

UserSchema.methods.generateAccessToken =  function(){
    return jwt.sign(
        {
            _id : this._id,
            email : this.email,
            username : this.username,
            role : this.role
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

export default mongoose.model("User", UserSchema);
