import PS from "../../../model/ps.js";

export const createPS = async (req, res) => {
  try {
    const {
      name,
      registrationDeadline,
      submissionDeadline,
      judge,
      pdf,
      midEvalExist,
      midEvalSubmissionDeadline,
      prep,
      points,
      midEvalSubmissionDeliverables,
      submissionDeliverables,
      midEvalPointsDistribution,
      submissionPointsDistribution,
      pptPointsDistribution,
      pptSchedule,
      teamStrength,
      judgePointsDisribution,
      rankings,
    } = req.body;
    if (
      !name ||
      !registrationDeadline ||
      !submissionDeadline ||
      !pdf ||
      !prep ||
      !teamStrength
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if(midEvalExist===true && !midEvalSubmissionDeadline){
      return res
        .status(400)
        .json({ message: "Mid evaluation submission deadline is required" });
    }
    const urlRegex = /^https?:\/\/.+/;
    if (!urlRegex.test(pdf)) {
      return res.status(400).json({ message: "Invalid PDF URL" });
    }
    const judgeFinal = judge && judge.trim()!== "" ? judge : null;
    const newPS = new PS({
      name,
      registrationDeadline,
      submissionDeadline,
      judge: judgeFinal,
      pdf,
      midEvalExist,
      midEvalSubmissionDeadline,
      prep,
      points,
      midEvalSubmissionDeliverables,
      submissionDeliverables,
      midEvalPointsDistribution,
      submissionPointsDistribution,
      pptPointsDistribution,
      pptSchedule,
      teamStrength,
      judgePointsDisribution,
      rankings,
    });
    await newPS.save();
    res
      .status(201)
      .json({ message: "Problem statement created successfully", ps: newPS });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "PS with this name already exists" });
    }
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
