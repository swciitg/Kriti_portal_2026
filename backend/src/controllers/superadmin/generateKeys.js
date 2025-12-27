import crypto from "crypto";
import bcrypt from "bcrypt"
import SuperAdmin from "../../model/superAdmin.js";

export const GenerateSuperAdmin = async (req, res) => {
  try {
    const existing = await SuperAdmin.findOne({ username: "superadmin" });
    if (existing) {
      return res.render("superadmin/generateKeys", {
        error: "SuperAdmin already exists",
        publicKey: null,
        privateKey: null,
      });
    }

    const publicKey = crypto.randomBytes(16).toString("hex");
    const privateKey = crypto.randomBytes(16).toString("hex");

    const hashedPublicKey = await bcrypt.hash(publicKey, 10);
    const hashedPrivateKey = await bcrypt.hash(privateKey, 10);

    await SuperAdmin.create({
      username: "superadmin",
      publicKey : hashedPublicKey,
      privateKey : hashedPrivateKey,
    });

    res.render("superadmin/generateKeys", {
      error: null,
      publicKey,
      privateKey,
    });
  } catch {
    res.render("superadmin/generateKeys", {
      error: "Internal server error",
      publicKey: null,
      privateKey: null,
    });
  }
};
