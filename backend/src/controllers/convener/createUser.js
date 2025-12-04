import judge from "../../model/judge.js";
import ps from "../../model/ps.js";
import techSecy from "../../model/techSecy.js";
import user from "../../model/user.js";
import mongoose from "mongoose";

export async function OnBoardUser(req , res) {
    try {
        const data = req.body;
        const {username , password , email , role} = data;
    
        if([username , password , email , role].some(field => field === undefined || !field)) {
            return res.status(400).json({
                "success" : false,
                "message" : "All fields are necesaary"
            });
        }
    
        if(!(["TechSecy", "Judge", "Company"].includes(role))) {
            return res.status(403).json({
                "success" : false,
                "message" : "Forbidden to assign undefined roles"
            });
        }
    
        if(role === "TechSecy" && !data.hostelId) {
            return res.status(400).json({
                "success" : false,
                "message" : "Hostel ID is required field for Technical Secretary Onboarding"
            });
        }
    
        // for company to be added later
    
        const checkForExistingUser =  await user.findOne({
            $or:[{email} , {username}]
        });
    
        if(checkForExistingUser) {
            return res.status(409).json({
                "success" : false ,
                "message" : "User with Similar Email or Username exists"
            });
        }
    
        if(role === "TechSecy") {
            if(!data.hostelId) {
                return res.status(400).json({
                    "success" : false,
                    "message" : "Hostel ID is required field for Technical Secretary Onboarding"
                });
            }
    
            const hostelIdCheck = await techSecy.findOne({hostelId : data.hostelId});
            if(hostelIdCheck) {
                return res.status(409).json({
                    "success" : false ,
                    "message" : "Technical Secretary with same Hostel exists"
                });
            }
        }
    
    
        if(role === "Judge") {
            if(!data.ps) {
                return res.status(400).json({
                    "success" : false,
                    "message" : "Problem Statement is required field for Judge Onboarding"
                });
            }
    
            const psExistenceCheck = await ps.findOne({name : data.ps});
            if(!psExistenceCheck) {
                return res.status(404).json({
                    "success" : false ,
                    "message" : "Problem Statement Not found"
                });
            }

            const judgePSCheck = await judge.findOne({ps : psExistenceCheck._id});
            if(judgePSCheck) {
                return res.status(409).json({
                    "success" : false ,
                    "message" : "Judge for same Problem Statement exists"
                });
            } 

            data.ps = psExistenceCheck._id;
        }
    

        const session = await mongoose.startSession();
        session.startTransaction();

        const newUser = await user.create({
            username ,
            email ,
            password,
            role
        });
    
        if(role === "TechSecy") {
            await techSecy.create({
                user : newUser._id , 
                hostelId : data.hostelId
            });
        }
    
        if(role === "Judge") {
            await judge.create({
                user : newUser._id , 
                ps : data.ps ,
                verified : false
            });
        }

        await session.commitTransaction();
        session.endSession();
        
    
        return res.status(201).json({
            "success" : true
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            "success" : false , 
            "message" : "Internal Server Error Occured"
        })
    }
}