import Request from "../../model/request.js";
import TechSecy from "../../model/techSecy.js";
import PS from "../../model/ps.js";
import User from "../../model/user.js";

export async function editRegisteredTeam(req, res) {
  try {
    const { psId } = req.params;
    const techSecy = await TechSecy.findOne({ user: req.user._id });
    if (!techSecy) {
      return res
        .status(404)
        .json({ success: "false", message: "Tech secy not found" });
    }
    const ps = await PS.findById(psId);
    if (!ps) {
      return res
        .status(404)
        .json({ success: "false", message: "PS not found" });
    }
    const convener = await User.findOne({ role: "Convener" });
    if (!convener) {
      return res
        .status(404)
        .json({ success: "false", message: "Convener not found" });
    }

    const existingRequest = await Request.findOne({
      from: req.user._id,
      psId,
      requestType: "EDIT_TEAM",
      status: "pending",
    });
    if (existingRequest) {
      return res
        .status(400)
        .json({ success: "false", message: "edit request already sent" });
    }

    const newRequest = await Request.create({
      from: req.user._id,
      to: convener._id,
      psId,
      requestType: "EDIT_TEAM",
    });
    return res.status(201).json({
      success: "true",
      message: "Edit request sent successfully",
      newRequest,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: "false", message: "Server error", err });
  }
}
