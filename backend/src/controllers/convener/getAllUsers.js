import Judge from "../../model/judge.js";
import TechSecy from "../../model/techSecy.js";
import Company from "../../model/company.js";

export const getAllUsers = async (req, res) => {
  try {
    const judges = await Judge.find()
      .populate({ path: "user", select: "-password" })
      .populate("ps");

    const techSecys = await TechSecy.find()
      .populate({ path: "user", select: "-password" });

    const companies = await Company.find()
      .populate({ path: "user", select: "-password" })
      .populate("ps");

    res.status(200).json({
        success : true ,
        judges,
        techSecys,
        companies
    });
  } catch (err) {
    res.status(500).json({ 
        success : false ,
        message : "Some internal server error occured"
     });
  }
};
