import crypto from "crypto";
import user from "../../model/user.js";
import bcrypt from "bcrypt";
import { mailUtil } from "../../utils/mail.js";

const FRONTEND_URL = "http://localhost:5173"; 
const TOKEN_EXPIRY_MS = 5 * 60 * 1000;

// Store plain tokens mapped to email + expiry
const tokens = new Map();

function removeExpiredTokens() {
    const now = Date.now();
    for (const [token, data] of tokens.entries()) {
        if (data.expiresAt < now) {
            tokens.delete(token);
        }
    }
}

function hasActiveToken(email) {
    const now = Date.now();
    for (const [token, data] of tokens.entries()) {
        if (data.email === email && data.expiresAt > now) {
            return true;
        }
    }
    return false;
}

export async function RequestChange(req, res) {
    try {
        const { email } = req.body;
        
        if (email === undefined || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }
    
        removeExpiredTokens();
    
        if (hasActiveToken(email)) {
            return res.status(429).json({
                success: false,
                message: "Too many password change attempts! Try after 5 minutes"
            });
        }
    
        const emailCheck = await user.findOne({ email });
        
        if (!emailCheck) {
            const text = "SOMEONE TRIED TO CHANGE THE PASSWORD OF KRITI PORTAL ACCOUNT FOR THIS EMAIL. HOWEVER NO ACCOUNT EXISTS FOR THIS EMAIL. INCASE IT WAS YOU, PLEASE USE A VALID EMAIL-ID OR CONTACT KRITI CONVENER FOR CREATING AN ACCOUNT.\nThis is a system generated email. Do not reply to this.\nTHANK YOU";
            const mailSuccess = await mailUtil(email, text);
            if(!mailSuccess) {
                throw new Error("Mail not sent");
            }
        } else {
            const token = crypto.randomBytes(32).toString('hex');
            
            tokens.set(token, {
                email,
                expiresAt: Date.now() + TOKEN_EXPIRY_MS
            });
            
        
            const text = `Follow this link to reset your password. This link expires in 5 minutes:\n\n${FRONTEND_URL}/reset-password?token=${token}\n\nIf you didn't request this, please ignore this email.\n\nThis is a system generated email. Do not reply.`;
            const mailSuccess = await mailUtil(email, text);
            if(!mailSuccess) {
                tokens.delete(token);
                throw new Error("Mail not sent");
            }
        }
    
        return res.status(200).json({
            success: true,
            message: "If an account exists with this email, you will receive a password reset link"
        });
        
    } catch (error) {
        console.error("Password reset request error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

export async function ResetPassword(req, res) {
    try {
        
        const { newPassword, token } = req.body;
        
        if (newPassword === undefined || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Password must exists"
            });
        }
        
        if (token === undefined || !token) {
            return res.status(400).json({
                success: false,
                message: "Token is required"
            });
        }
        
        removeExpiredTokens();

        const tokenData = tokens.get(token);
        
        if (!tokenData) {
            return res.status(403).json({
                success: false,
                message: "Invalid or expired token"
            });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        tokens.delete(token);

        const updateCheck = await user.findOneAndUpdate(
            { 
                email: tokenData.email 
            }, { 
                $set: { 
                    password: hashedNewPassword 
                } 
            }, { 
                upsert: false , 
                returnDocument : "after"
            }
        );

        if (!updateCheck) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Password reset successfully"
        });
        
    } catch (error) {
        console.error("Password reset error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}