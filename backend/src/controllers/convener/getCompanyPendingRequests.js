import Company from "../../model/company.js";
import User from "../../model/user.js";
import PS from "../../model/ps.js";

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