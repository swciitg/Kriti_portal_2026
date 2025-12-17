import jwt from "jsonwebtoken";
import superAdmin from "../model/superAdmin.js";
import User from "../model/user.js";
import Judge from "../model/judge.js";
import Company from "../model/company.js";

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

      // Check if user is a verified judge
      if (user.role === "Judge") {
        const judgeDoc = await Judge.findOne({ user: user._id });
        if (judgeDoc && judgeDoc.verified) {
          // Allow access to specific endpoints for requesting access again
          const allowedVerifiedRoutes = [
            "/api/v1/judge/status",
            "/api/v1/judge/request-access",
            "/api/v1/auth/logout",
          ];
          if (!allowedVerifiedRoutes.includes(req.originalUrl)) {
            return res.status(403).json({
              success: false,
              message: "Your marks have been verified. You can no longer access the system.",
              verified: true,
              accessRequestPending: judgeDoc.accessRequestPending || false,
            });
          }
        }
      }

      // Check if user is a verified company POC
      if (user.role === "Company") {
        const companyDoc = await Company.findOne({ user: user._id });
        if (companyDoc && companyDoc.verified) {
          // Allow access to specific endpoints for requesting access again
          const allowedVerifiedRoutes = [
            "/api/v1/company/status",
            "/api/v1/company/request-access",
            "/api/v1/auth/logout",
          ];
          if (!allowedVerifiedRoutes.includes(req.originalUrl)) {
            return res.status(403).json({
              success: false,
              message: "Your marks have been verified. You can no longer access the system.",
              verified: true,
              accessRequestPending: companyDoc.accessRequestPending || false,
            });
          }
        }
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
      "/api/v1/convener/get-pending-requests",
      "/api/v1/convener/get-company-pending-requests",
      "/api/v1/convener/get-access-requests",
      "/api/v1/convener/get-company-access-requests",
    ];
    const startsWithAllowed = [
      "/api/v1/convener/update-ps/",
      "/api/v1/convener/delete-ps/",
      "/api/v1/convener/verify-judge/",
      "/api/v1/convener/verify-company/",
      "/api/v1/convener/grant-access/",
      "/api/v1/convener/grant-company-access/",
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
    const startsWithAllowed = ["/api/v1/techsecy/register-team/"];
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
          "/api/v1/company/submit-marks-request",
          "/api/v1/company/status",
          "/api/v1/company/request-access",
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

  if (role === "Judge") {
    const allowed = [
      "/api/v1/judge/get-ps",
      "/api/v1/judge/save-ppt-scores",
      "/api/v1/judge/submit-marks-request",
      "/api/v1/judge/status",
      "/api/v1/judge/request-access",
    ];
    if (!allowed.includes(route)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden to access this route",
      });
    }
  }

    // will do similar for other roles as well
  

  next();
}
