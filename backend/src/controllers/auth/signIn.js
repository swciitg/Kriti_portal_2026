import user from "../../model/user.js";
import TechSecy from "../../model/techSecy.js";

export async function SignIn(req, res) {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await user.findOne({ username });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordValid = await existingUser.isPasswordCorrect(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    if (existingUser.role !== role) {
      return res.status(400).json({
        success: false,
        message: "Role does not match",
      });
    }

    const token = existingUser.generateAccessToken();

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.PRODUCTION_MODE === "prod",
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    const responseUser = existingUser.toObject();
    delete responseUser.password;

    if (existingUser.role === "TechSecy") {
      const techSecyProfile = await TechSecy.findOne({
        user: existingUser._id,
      });
      if (techSecyProfile) {
        responseUser.techSecyId = techSecyProfile._id;
      } else {
        responseUser.techSecyId = null;
      }
    }

    return res.status(200).json({
      success: true,
      user: responseUser,
      accessToken: token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error Occured",
    });
  }
}
