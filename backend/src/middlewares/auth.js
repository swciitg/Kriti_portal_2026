import jwt from 'jsonwebtoken'
import User from '../model/user.js';

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
    
        const user = await User.findById(decodedToken?._id).select("-password");
        if(!user) {
            return res.status(404).json({
                "success" : false,
                "message" : "User not found"
            });
        }
    
        req.user = user;
        next();
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
    if(role === "Convenor") {
        const routesAllowedForConvenor = [
            "/convenor/create-user"
        ];
        if(!(routesAllowedForConvenor.includes(route))) {
            return res.status(403).json({
                "success" : false, 
                "message" : "Forbidden to access this endpoint"
            })
        }
    }

    // will do similar for other roles as well

    next();
}