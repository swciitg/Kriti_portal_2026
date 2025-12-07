import PS from "../../../model/ps.js";
export const getPS = async (req, res) => {
    try {
        const psList = await PS.find();
        res.status(200).json({message: "PS fetched successfully", ps: psList});
    } catch (error) {
        res.status(500).json({message: "Server error", error});
    }
}