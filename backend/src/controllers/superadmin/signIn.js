import superAdmin from "../../model/superAdmin.js";

export async function SignIn(req, res) {
    try {
        const {publicKey, privateKey} = req.body;
    
        if(!publicKey || !privateKey) {
            res.status(400).json({
                "success" : false , 
                "message" : "All fields are necessary"
            });
        }

        const SuperAdmin = await superAdmin.findOne({username : "superadmin"});
        const areKeyValid = await SuperAdmin.areKeyCorrect(publicKey , privateKey);
        if(!areKeyValid) {
            res.status(401).json({
                "success" : false ,
                "message" : "Key is incorrect"
            });
        }
    
        const token = SuperAdmin.generateAccessToken();
        res.cookie("accessToken", token, {
          httpOnly: true,
          secure: process.env.PRODUCTION_MODE === "prod",
          sameSite: "none",
          maxAge: 24 * 60 * 60 * 1000, // 1 day
        });
    
        const responseUser = SuperAdmin.toObject();
        delete responseUser.publicKey;
        delete responseUser.privateKey;
        responseUser.role = "SuperAdmin";

        return res.status(200).json({
          "success": true ,
          "user" : responseUser,
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