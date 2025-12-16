import Request from "../../../model/request.js";
import TechSecy from "../../../model/techSecy.js";

export async function GetRequestById(req, res) {
  try {
    const { id } = req.params;
    const reqData = await Request.findOne({
      _id: id,
    });
    const hostelId = await TechSecy.findOne({ user: reqData.from }).select(
      "hostelId"
    );
    if (!hostelId) {
      return res
        .status(404)
        .json({ success: "false", message: "TechSecy not found" });
    }
    return res
      .status(200)
      .json({ success: "true", hostelId: hostelId.hostelId, requestType: reqData.requestType});
  } catch (err) {
    return res
      .send(500)
      .json({ success: "false", message: "internal server error" });
  }
}
