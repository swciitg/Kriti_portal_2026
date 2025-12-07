import PS from "../../../model/ps.js";

export const getPSById = async (req, res) => {
  try {
    const ps = await PS.findById(req.params.id);
    if (!ps) {
      return res.status(404).json({ success: false, message: "PS not found" });
    }
    res.status(200).json({ success: true, ps });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
