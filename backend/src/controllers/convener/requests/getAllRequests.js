import request from "../../../model/request.js";

export async function GetAllRequests(req, res) {
  try {
    const requests = await request.find();
    return res.status(200).json({ success: "true", data: requests });
  } catch (err) {
    return res
      .send(500)
      .json({ success: "false", message: "internal server error" });
  }
}
