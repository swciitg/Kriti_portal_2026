import nodemailer from "nodemailer" ;

let transporter = null;

export function mailInit() {
    transporter = nodemailer.createTransport({
        service : "outlook",
        auth: {
            user: process.env.MAIL_USER, // your Outlook email
            pass: process.env.MAIL_PASSWORD, // your Outlook password
        },
    });
}


export const mailUtil = async (email , text, html)=>{
    if(transporter === undefined || !transporter) {
        return false;
    }

    let mailInfo = {
        from:process.env.MAIL_USER, 
        to:email,
        subject:"noreply from Kriti 2026",
        text:text,
        html: html
    };
    
    try {
        await transporter.sendMail(mailInfo);
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}