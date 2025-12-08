import PS from "../../../model/ps.js";

export const updatePS = async (req, res) => {
  try {
    const updates = req.body;
    const requiredFields = [
      "name",
      "registrationDeadline",
      "submissionDeadline",
      "prep",
      "pdf",
      "teamStrength",
    ];
    for(const field of requiredFields) {
      if(!updates[field]){
        return res.status(400).json({message: `${field} is required`});
      }
    }
    if (updates.midEvalExist === true && !updates.midEvalSubmissionDeadline) {
      return res
        .status(400)
        .json({ message: "Mid evaluation submission deadline is required" });
    }
      if (updates.pdf) {
        const urlRegex = /^https?:\/\/.+/;
        if (!urlRegex.test(updates.pdf)) {
          return res.status(400).json({ message: "Invalid PDF URL format" });
        }
      }
    const updatePS = await PS.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!updatePS) {
      return res.status(404).json({ message: "PS not found" });
    }
    res.status(200).json({ message: "PS updated successfully", ps: updatePS });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "PS with this name already exists" });
    }
    res.status(500).json({ message: "Server error", error });
  }
};
