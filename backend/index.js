import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/db/connect.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin : process.env.CORS_ALLOWED_ORIGINS
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hi");
});


connectDB()
.then(()=>{
    app.on("error"  , (error)=>{
        console.log("ERROR ALERT!!! \n\n ", error);
        throw error
    })
    app.listen(PORT ,()=>{
        console.log(`The server is running on ${process.env.PORT || 5000}`);
    })
})
.catch((error)=>{
    console.error("MongoDB connection failed in index.js\n" , error);
})
