import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';

const SuperAdminSchema = new mongoose.Schema({
    username : {type : String , required : true},
    publicKey : {type : String , required : true},
    privateKey : {type : String, required : true}
});


SuperAdminSchema.pre("save", async function () {
    if(this.isModified("password"))
        this.publicKey = await bcrypt.hash(this.publicKey, 10);
        this.privateKey = await bcrypt.hash(this.privateKey, 10);
} )

SuperAdminSchema.methods.areKeyCorrect = async function(publicKey , privateKey) {
    const publicKeyCheck = await bcrypt.compare(publicKey , this.publicKey)
    const privateKeyCheck = await bcrypt.compare(privateKey , this.privateKey)
    return publicKeyCheck && privateKeyCheck
}

SuperAdminSchema.methods.generateAccessToken =  function(){
    return jwt.sign(
        {
            _id : this._id,
            username : "superadmin",
            role : "SuperAdmin"
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}


export default mongoose.model("SuperAdmin", SuperAdminSchema);
