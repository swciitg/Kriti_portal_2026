import PptSchedule from "../../model/pptSchedule.js";

export const getAllPptSchedules = async (req, res) => {
  try {
    const schedules = await PptSchedule.find()
    res.status(200).json({
        success : true ,
        schedules
    });
  } catch (error) {
    res.status(500).json({ 
        success : false ,
        message: "Internal Server Error Occured"
    });
  }
};
