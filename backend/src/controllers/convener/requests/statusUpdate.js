import Request from "../../../model/request.js";

export async function statusUpdate(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    /**
     * added by srinjoy on 04-01-2026 from tb_needs to fix the edit request bug
     */
    if(status === "rejected") {
      await Request.findByIdAndDelete(id);
      return res.status(200).json({
        success : true , 
        message : "status updated successfully" ,
        newStatus : "rejected"
      })
    }

    if (status === "approved" || status === "rejected") {
      const updatedRequest = await Request.findByIdAndUpdate(
        id,
        {
          status: status,
        },
        { new: true }
      );
      return res
        .status(200)
        .json({ success: "true", message: "status updated successfully", newStatus: updatedRequest.status, });
    } else {
      return res
        .status(400)
        .json({ success: "false", message: "invalid status value" });
    }
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: "false", message: "internal server error" });
  }
}
