// controllers/ps/convener/createPS.js
import PS from "../../../model/ps.js";

export const createPS = async (req, res) => {
  try {
    const {
      name,
      prep,
      startDate,
      submissionDeadline,
      registrationDeadline,
      midEvalExist,
      midEvalSubmissionDeadline,
      judge,
      companyPOC,
      pdf,
      submissionDeliverables,
      midEvalSubmissionDeliverables,
      submissionPointsDistribution,
      pptPointsDistribution,
      midEvalPointsDistribution,
      points,
      overallPointsDistribution,
      teamStrength,
      pptSchedule,
    } = req.body;

    if (
      !name ||
      !prep ||
      !startDate ||
      !submissionDeadline ||
      !pdf ||
      points == null ||
      teamStrength == null
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const urlRegex = /^https?:\/\/.+/;
    if (!urlRegex.test(pdf)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid PDF URL" });
    }

    if (pptSchedule && !urlRegex.test(pptSchedule)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid PPT schedule URL" });
    }

    if (midEvalExist && !midEvalSubmissionDeadline) {
      return res.status(400).json({
        success: false,
        message: "Mid evaluation submission deadline is required",
      });
    }

    const judgeFinal =
      judge && typeof judge === "string" && judge.trim() !== ""
        ? judge
        : null;
    const companyPOCFinal =
      companyPOC && typeof companyPOC === "string" && companyPOC.trim() !== ""
        ? companyPOC
        : null;

    const pptScheduleFinal =
      pptSchedule && pptSchedule.trim() !== "" ? pptSchedule : undefined;

    const newPS = new PS({
      name: name.trim(),
      prep,
      startDate,
      submissionDeadline,
      registrationDeadline,
      midEvalExist,
      midEvalSubmissionDeadline: midEvalExist
        ? midEvalSubmissionDeadline
        : undefined,
      judge: judgeFinal,
      companyPOC: companyPOCFinal,
      pdf,
      submissionDeliverables: submissionDeliverables || [],
      midEvalSubmissionDeliverables: midEvalExist
        ? midEvalSubmissionDeliverables || []
        : [],
      submissionPointsDistribution: submissionPointsDistribution || [],
      pptPointsDistribution: pptPointsDistribution || [],
      midEvalPointsDistribution: midEvalExist
        ? midEvalPointsDistribution || []
        : [],
      overallPointsDistribution: overallPointsDistribution || [],
      points,
      teamStrength,
      // pptSchedule: pptScheduleFinal, commented out as per model change
    });

    await newPS.save();

    res.status(201).json({
      success: true,
      message: "Problem statement created successfully",
      ps: newPS,
    });
  } catch (error) {
    console.error("Error creating PS:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "PS with this name already exists",
      });
    }
    res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};
