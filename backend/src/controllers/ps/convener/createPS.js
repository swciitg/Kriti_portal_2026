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
      MidEvalSubmissionDeadline,
      prep,
      points,
      midEvalSubmissionDeliverables,
      submissionDeliverables,
      midEvalPointsDistribution,
      submissionPointsDistribution,
      pptPointsDistibution,
      pptSchedule,
      rankings,
    } = req.body;
    if (
      !name ||
      !registrationDeadline ||
      !submissionDeadline ||
      !pdf ||
      !prep
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const urlRegex = /^https?:\/\/.+/;
    if (!urlRegex.test(pdf)) {
      return res.status(400).json({ message: "Invalid PDF URL" });
    }
    const newPS = new PS({
      name,
      registrationDeadline,
      submissionDeadline,
      judge,
      pdf,
      midEvalExist,
      MidEvalSubmissionDeadline,
      prep,
      points,
      midEvalSubmissionDeliverables,
      submissionDeliverables,
      midEvalPointsDistribution,
      submissionPointsDistribution,
      pptPointsDistibution,
      pptSchedule,
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
