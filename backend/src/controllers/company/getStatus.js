import Company from "../../model/company.js";

export async function getCompanyStatus(req, res) {
  try {
    const userId = req.user._id;

    const companyDoc = await Company.findOne({ user: userId });

    if (!companyDoc) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      verified: companyDoc.verified,
      submitMarkRequestPending: companyDoc.submitMarkRequestPending,
      accessRequestPending: companyDoc.accessRequestPending,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}