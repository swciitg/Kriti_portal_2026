import Company from "../../model/company.js";

export const verifyCompanyRequest = async (req, res) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID is required"
      });
    }

    // Find the company document
    const companyDoc = await Company.findById(companyId);

    if (!companyDoc) {
      return res.status(404).json({
        success: false,
        message: "Company POC not found"
      });
    }

    // Check if there's a pending request
    if (!companyDoc.submitMarkRequestPending) {
      return res.status(400).json({
        success: false,
        message: "No pending request found for this company POC"
      });
    }

    // Check if already verified
    if (companyDoc.verified) {
      return res.status(400).json({
        success: false,
        message: "Company POC is already verified"
      });
    }

    // Update the company: set verified to true and clear pending request
    companyDoc.verified = true;
    companyDoc.submitMarkRequestPending = false;
    await companyDoc.save();

    res.status(200).json({
      success: true,
      message: "Company POC verified successfully. They will no longer be able to login."
    });
  } catch (error) {
    console.error("Error in verifyCompanyRequest:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};