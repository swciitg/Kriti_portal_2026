import Request from "../../../model/request.js";

export async function GetRequestById(req, res) {
  try {
    const { id } = req.params;
    const reqData = await Request.findOne({
      _id: id,
    });
    return res
      .status(200)
      .json({ success: "true", data: reqData});
  } catch (err) {
    return res
      .send(500)
      .json({ success: "false", message: "internal server error" });
  }
}
