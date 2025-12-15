import Company from "../../model/company.js";

export const submitMarksRequest = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find the company document for this user
    const companyDoc = await Company.findOne({ user: userId });

    if (!companyDoc) {
      return res.status(404).json({
        success: false,
        message: "Company POC assignment not found"
      });
    }

    // Check if company is already verified (shouldn't be able to submit if verified)
    if (companyDoc.verified) {
      return res.status(400).json({
        success: false,
        message: "You have already been verified and cannot submit new requests"
      });
    }

    // Check if there's already a pending request
    if (companyDoc.submitMarkRequestPending) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending request. Please wait for convener approval."
      });
    }

    // Update the company document to mark request as pending
    companyDoc.submitMarkRequestPending = true;
    await companyDoc.save();

    res.status(200).json({
      success: true,
      message: "Marks submission request sent to convener successfully"
    });
  } catch (error) {
    console.error("Error in submitMarksRequest:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};