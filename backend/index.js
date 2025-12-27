import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/db/connect.js";
import cookieParser from "cookie-parser";
import { mailInit } from "./src/utils/mail.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, 'uploads', 'submissions');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads/submissions directory');
}

app.set("view engine", "ejs");
app.set("views", "./src/views");
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CORS_ALLOWED_ORIGINS,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// app.get("/", (req, res) => {
//   res.send("Hi");
// });

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

import ConvenerRouter from "./src/routes/convenerRoute.js"
app.use('/v1/convener' , ConvenerRouter);

import AuthRouter from  "./src/routes/authRoutes.js"
app.use('/v1/auth' , AuthRouter);

import SuperAdminRouter from "./src/routes/superAdminRoutes.js"
app.use('/v1/superadmin' , SuperAdminRouter);

import PSRouter from "./src/routes/psRoutes.js"
app.use('/v1/ps', PSRouter);

import SubmissionRouter from "./src/routes/submissionRoutes.js"
app.use('/v1/submission' , SubmissionRouter);

import TeamsRouter from "./src/routes/teamsRoutes.js"
app.use('/v1/teams' , TeamsRouter);

import TechSecyRouter from "./src/routes/techSecyRoutes.js";
app.use('/v1/techsecy', TechSecyRouter);

import JudgeRouter from "./src/routes/judgeRoutes.js"
app.use('/v1/judge' , JudgeRouter);

import CompanyRouter from "./src/routes/companyRoutes.js"
app.use('/v1/company', CompanyRouter);

import PSsubmissionRouter from "./src/routes/pssubmissionRoutes.js"
app.use('/v1/pssubmission' , PSsubmissionRouter);

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
