import jwt from 'jsonwebtoken'
import User from '../model/user.js';
import superAdmin from '../model/superAdmin.js';

export async function verifyJWT(req, res, next) {
    try {
        const token = req.cookies?.accessToken || req.headers["authorization"]?.replace("Bearer " , "");
        if(!token) {
            return res.status(401).json({
                "success" : false,
                "message" : "Unauthorized Access"
            });
        }
    
        const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET);

        if(!(["SuperAdmin", "Convener", "TechSecy", "Judge", "Company"].includes(decodedToken?.role))) {
            return res.status(403).json({
                "success" : false,
                "message" : "Forbidden to access without defined roles"
            });
        }
        
        if(decodedToken?.role === "SuperAdmin") {
            const superadmin = superAdmin.findOne({username : "superadmin"});
            if(!superadmin) {
                return res.status(404).json({
                    "success" : false,
                    "message" : "User not found"
                });
            }
            req.user = superAdmin;
            next();
        } else {
            const user = await User.findById(decodedToken?._id).select("-password");
            if(!user) {
                return res.status(404).json({
                    "success" : false,
                    "message" : "User not found"
                });
            }
        
            req.user = user;
            next();
        }      
    } catch (error) {
        console.log(error);
        res.status(500).json({
            "success" : false,
            "message" : "Some server error occured"
        })
    }
} 


export function handleRouteAccess(req, res, next) {
    const route = req.originalUrl;
    const user = req.user;

    if(!user) {
        return res.status(404).json({
            "success" : false,
            "message" : "User not found"
        });
    }

    const role = user.role;
    if(role === "Convener") {
        const allowed = [
            "/api/v1/convener/create-user",
            "/api/v1/convener/create-ps",
        ];
        const startsWithAllowed = [
            "/api/v1/convener/update-ps/",
            "/api/v1/convener/delete-ps/"
        ];
        if (
          !allowed.includes(route) &&
          !startsWithAllowed.some((p) => route.startsWith(p))
        ) {
          return res
            .status(403)
            .json({
              success: false,
              message: "Forbidden to access this route",
            });
        }
    }

    if(role === "SuperAdmin") {
        if(req.method !== "GET") {
            return res.status(403).json({
                "success": false, 
                "message": "Forbidden to access this endpoint"
            });
        }

        const allowed = [
            "/api/v1/superadmin/get-info"
        ];

        const startsWithAllowed = [
            "/api/v1/submission/get-all/",
            "/api/v1/teams/get-all/"
        ];
        
        const isAllowed = allowed.includes(route) || 
                        startsWithAllowed.some(prefix => route.startsWith(prefix));
        
        if(!isAllowed) {
            return res.status(403).json({
                "success": false, 
                "message": "Forbidden to access this endpoint"
            });
        }
    }

    // will do similar for other roles as well

    next();
}