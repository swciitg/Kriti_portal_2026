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

// app.get("/", (req, res) => {
//   res.send("Hi");
// });

import ConvenerRouter from "./src/routes/convenerRoute.js"
app.use('/api/v1/convener' , ConvenerRouter);

import AuthRouter from  "./src/routes/authRoutes.js"
app.use('/api/v1/auth' , AuthRouter);

import SuperAdminRouter from "./src/routes/superAdminRoutes.js"
app.use('/api/v1/superadmin' , SuperAdminRouter);

import PSRouter from "./src/routes/psRoutes.js"
app.use('/api/v1/ps', PSRouter);

import SubmissionRouter from "./src/routes/submissionRoutes.js"
app.use('/api/v1/submission' , SubmissionRouter);

import TeamsRouter from "./src/routes/teamsRoutes.js"
app.use('/api/v1/teams' , TeamsRouter);

import JudgeRouter from "./src/routes/judgeRoutes.js"
app.use('/api/v1/judge' , JudgeRouter);

import CompanyRouter from "./src/routes/companyRoutes.js"
import { mailInit } from "./src/utils/mail.js";
app.use('/api/v1/company', CompanyRouter);

mailInit();

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
