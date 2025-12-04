import user from "../../model/user.js";

export async function SignIn(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        "success": false,
        "message": "Username and password are required fields",
      });
    }

    const existingUser = await user.findOne({ username });
    if (!existingUser) {
      return res.status(404).json({
        "success": false,
        "message": "User not found",
      });
    }

    const isPasswordValid = await existingUser.isPasswordCorrect(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        "success": false,
        "message": "Invalid password",
      });
    }

    const token = existingUser.generateAccessToken();

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.PRODUCTION_MODE === "prod",
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return res.status(200).json({
      "success": true ,
      "accessToken" : token
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      "success": false,
      "message": "Internal Server Error Occured",
    });
  }
}
