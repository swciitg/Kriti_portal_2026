import Company from "../../model/company.js";

export async function grantCompanyAccess(req, res) {
  try {
    const { companyId } = req.params;

    const companyDoc = await Company.findById(companyId);

    if (!companyDoc) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    if (!companyDoc.verified) {
      return res.status(400).json({
        success: false,
        message: "Company is not verified yet.",
      });
    }

    if (!companyDoc.accessRequestPending) {
      return res.status(400).json({
        success: false,
        message: "No pending access request for this company.",
      });
    }

    companyDoc.verified = false;
    companyDoc.accessRequestPending = false;
    await companyDoc.save();

    return res.status(200).json({
      success: true,
      message: "Access granted successfully. Company can now login and edit marks.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}