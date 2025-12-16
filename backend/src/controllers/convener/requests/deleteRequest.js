import Request from "../../../model/request.js";

export async function DeleteRequest(req, res) {
  try {
    const { id } = req.params;
    await Request.deleteOne({ _id: id });
    return res
      .status(200)
      .json({ success: "true", message: "request deleted successfully" });
  } catch (err) {
    return res
      .status(500)
      .json({ success: "false", message: "internal server error" });
  }
}
