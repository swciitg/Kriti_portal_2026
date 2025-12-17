import Company from "../../model/company.js";

export async function getCompanyAccessRequests(req, res) {
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
}