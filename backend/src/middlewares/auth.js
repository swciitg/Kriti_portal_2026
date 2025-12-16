import jwt from "jsonwebtoken";
import superAdmin from "../model/superAdmin.js";
import User from "../model/user.js";

export async function verifyJWT(req, res, next) {
  try {
    let token = null;

    // Prefer Authorization header: "Bearer <token>"
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7); // remove "Bearer "
    } else if (req.cookies?.accessToken) {
      // Fallback to cookie
      token = req.cookies.accessToken;
    }

    if (!token || token === "null" || token === "undefined") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized Access",
      });
    }

    // IMPORTANT: use the same secret as in generateAccessToken
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (
      !["SuperAdmin", "Convener", "TechSecy", "Judge", "Company"].includes(
        decodedToken?.role
      )
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden to access without defined roles",
      });
    }

    if (decodedToken?.role === "SuperAdmin") {
      const superadmin = await superAdmin.findOne({ username: "superadmin" });
      if (!superadmin) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
      req.user = superadmin;
      return next();
    } else {
      // token was created with { id: this.id, ... }
      const user = await User.findById(decodedToken?._id).select("-password");
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      req.user = user;
      return next();
    }
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      success: false,
      message: "Invalid or malformed token",
    });
  }
}


export function handleRouteAccess(req, res, next) {
  const route = req.originalUrl;
  const user = req.user;

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const role = user.role;

  if (role === "Convener") {
    const allowed = [
      "/api/v1/convener/create-user",
      "/api/v1/convener/create-ps",
      "/api/v1/convener/get-requests",
    ];
    const startsWithAllowed = [
      "/api/v1/convener/update-ps/",
      "/api/v1/convener/delete-ps/",
      "/api/v1/convener/get-requests/",
      "/api/v1/convener/update-status/",
    ];
    if (
      !allowed.includes(route) &&
      !startsWithAllowed.some((p) => route.startsWith(p))
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden to access this route",
      });
    }
  }

  if (role === "SuperAdmin") {
    if (req.method !== "GET") {
      return res.status(403).json({
        success: false,
        message: "Forbidden to access this endpoint",
      });
    }

        const allowed = [
            "/api/v1/superadmin/get-info",
            "/api/v1/superadmin/get-points"
        ];

    const startsWithAllowed = [
      "/api/v1/submission/get-all/",
      "/api/v1/teams/get-all/",
    ];

    const isAllowed =
      allowed.includes(route) ||
      startsWithAllowed.some((prefix) => route.startsWith(prefix));

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: "Forbidden to access this endpoint",
      });
    }
  }

  if (role === "TechSecy") {
    const allowed = [];
    const startsWithAllowed = [
      "/api/v1/techsecy/register-team/",
      "/api/v1/techsecy/get-team/",
      "/api/v1/techsecy/edit-registered-team/",
      "/api/v1/techsecy/update-registered-team/",
      "/api/v1/techsecy/delete/",
    ];
    if (
      !allowed.includes(route) &&
      !startsWithAllowed.some((p) => route.startsWith(p))
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden to access this route",
      });
    }
  }

  if(role === "Company") {
        const allowed = [
            "/api/v1/company/get-sub",
            "/api/v1/company/save-sub",
        ];
        if (
          !allowed.includes(route)
        ) {
          return res
            .status(403)
            .json({
              success: false,
              message: "Forbidden to access this route",
            });
        }
    }

    // will do similar for other roles as well
  

  next();
}
