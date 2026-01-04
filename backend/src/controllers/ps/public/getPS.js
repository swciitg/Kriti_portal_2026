import PS from "../../../model/ps.js";
import TechSecy from "../../../model/techSecy.js";
import Team from "../../../model/team.js";

export const getPS = async (req, res) => {
  try {
    const startedPS = await PS.find({
      startDate: { $lte: new Date() }
    }).select("_id name startDate prep midEvalExist pdf points teamStrength registrationDeadline");

    let psList = [];
    let hostelId = null;

    // If user is authenticated and TechSecy, get their hostel info
    if (req.user && req.user.role === "TechSecy") {
      const techSecyData = await TechSecy.findOne({ user: req.user._id });
      if (techSecyData) {
        hostelId = techSecyData.hostelId;
      }
    } 

    // For each PS, check if team exists for this hostel
    psList = await Promise.all(startedPS.map(async (ps) => {
      let teamRegistered = false;

      if (hostelId) {
        const teamExists = await Team.findOne({
          ps: ps._id,
          hostelId: hostelId
        });
        teamRegistered = !!teamExists;
      }

      const psObj = ps.toObject ? ps.toObject() : JSON.parse(JSON.stringify(ps));
      return {
        ...psObj,
        teamRegistered: teamRegistered
      };
    }));

    res.status(200).json({ message: "PS fetched successfully", ps: psList });

  } catch (error) {
    console.error("Error in getPS:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


export const getPSforConvener = async (req, res) => {
    try {
        const psList = await PS.find();
        res.status(200).json({message: "PS fetched successfully", ps: psList});
    } catch (error) {
        res.status(500).json({message: "Server error", error});
    }
}
