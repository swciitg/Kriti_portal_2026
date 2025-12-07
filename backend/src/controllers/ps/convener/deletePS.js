import PS from "../../../model/ps.js";

export const deletePS = async (req, res) => {
  try {
    const deleted = await PS.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(400).json({ message: "PS not found" });
    }
    res.status(200).json({ message: "PS deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
