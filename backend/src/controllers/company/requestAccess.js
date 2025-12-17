import Company from "../../model/company.js";

export async function requestAccess(req, res) {
  try {
    const userId = req.user._id;

    const companyDoc = await Company.findOne({ user: userId });

    if (!companyDoc) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found",
      });
    }

    if (!companyDoc.verified) {
      return res.status(400).json({
        success: false,
        message: "You are not verified yet. No need to request access.",
      });
    }

    if (companyDoc.accessRequestPending) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending access request.",
      });
    }

    companyDoc.accessRequestPending = true;
    await companyDoc.save();

    return res.status(200).json({
      success: true,
      message: "Access request submitted successfully. Please wait for convener approval.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}