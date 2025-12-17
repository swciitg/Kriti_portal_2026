import Request from "../../model/request.js";

export async function GetRequestById(req, res) {
  try {
    const { psId } = req.params;
    const reqData = await Request.findOne({
      psId: psId,
      from: req.user._id,
      requestType: "EDIT_TEAM",
    });
    if (!reqData) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }
    return res.status(200).json({ success: "true", data: reqData });
  } catch (err) {
    return res
      .status(500)
      .json({ success: "false", message: "internal server error" });
  }
}
