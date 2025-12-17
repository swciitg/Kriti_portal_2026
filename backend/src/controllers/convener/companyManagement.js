import Company from "../../model/company.js";
import User from "../../model/user.js";
import PS from "../../model/ps.js";

// Get pending verification requests from companies
export const getCompanyPendingRequests = async (req, res) => {
  try {
    // Find all companies with pending requests
    const pendingCompanies = await Company.find({ 
      submitMarkRequestPending: true 
    })
    .populate('user', 'username email')
    .populate('ps', 'name');

    if (!pendingCompanies || pendingCompanies.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No pending requests",
        requests: []
      });
    }

    // Format the response data
    const formattedRequests = pendingCompanies.map(company => ({
      companyId: company._id,
      companyName: company.user?.username || "Unknown",
      companyEmail: company.user?.email || "Unknown",
      psName: company.ps?.name || "Unknown",
      psId: company.ps?._id || null,
      verified: company.verified
    }));

    res.status(200).json({
      success: true,
      requests: formattedRequests
    });
  } catch (error) {
    console.error("Error in getCompanyPendingRequests:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// Get access requests from verified companies
export const getCompanyAccessRequests = async (req, res) => {
  try {
    const accessRequests = await Company.find({
      verified: true,
      accessRequestPending: true,
    })
      .populate("user", "username email")
      .populate("ps", "name");

    return res.status(200).json({
      success: true,
      requests: accessRequests,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// Verify a company's mark submission request
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
        message: "Company not found"
      });
    }

    // Check if there's a pending request
    if (!companyDoc.submitMarkRequestPending) {
      return res.status(400).json({
        success: false,
        message: "No pending request found for this company"
      });
    }

    // Check if already verified
    if (companyDoc.verified) {
      return res.status(400).json({
        success: false,
        message: "Company is already verified"
      });
    }

    // Update the company: set verified to true and clear pending request
    companyDoc.verified = true;
    companyDoc.submitMarkRequestPending = false;
    await companyDoc.save();

    res.status(200).json({
      success: true,
      message: "Company verified successfully. They will no longer be able to login."
    });
  } catch (error) {
    console.error("Error in verifyCompanyRequest:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

// Grant access to a verified company
export const grantCompanyAccess = async (req, res) => {
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
};