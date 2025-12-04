import mongoose from "mongoose";

const connectDB = async () => {
    try{
        const  connectionResponse= await mongoose.connect(process.env.DB_URL);
        console.log(`\nMongoDb connected. HOST reponse :${connectionResponse.connection.host}`) ;
    }catch(error){
        console.log("\nMONGO CONNECTION FAILED in indexDB.js" , error);
        process.exit(1);
    }
}

export default connectDB;
