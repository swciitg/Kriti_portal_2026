import mongoose from "mongoose";

const TokenSchema = new mongoose.Schema({
    token : {
        type : String ,
        required : true
    } , 
    email : {
        type : String , 
        unique : true ,
        required : true
    } , 
    expiresAt : {
        type : Number ,
        required : true
    }
});

const Token = mongoose.model("Token" , TokenSchema);
export default Token;