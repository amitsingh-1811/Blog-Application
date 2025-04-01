const User = require("../models/userModel");
const bcrypt = require('bcrypt');
const ErrorHandler = require("../utils/errorhandler");
const sendToken = require("../utils/jwtToken");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const { clearRedisSet } = require("../utils/cache");

exports.registerUser = async (req,res,next)=> {

    try{const {name,email,password} = req.body;

    const user = await User.create({

        name,
        email,
        password
    })

    sendToken(user,201,res);
    console.log("user=> ",user, "token=> ",req.cookies.token);
    const verificationLink = `http://localhost:4000/verify-email?token=${req.cookies.token}`
    sentEmail(email, verificationLink)
}

    catch(error){
        console.log("error is ",error);
    }
}

exports.loginUser = async function(req,res,next) {
    
    console.log("inside login box");
    try{

        const {email,password} = req.body;
    
        if(!email || !password)
        {
            return next(new ErrorHandler("please enter email and password both",400));
        }

        const user = await User.findOne({email}).select("+password");
        
        if(!user)
        return next(new ErrorHandler("invalid email or password",400));

        const isPasswordMatched = await bcrypt.compare(password,user.password);

         if(!isPasswordMatched)
         return next(new ErrorHandler("invalid email or password",401));

        if(isPasswordMatched)
        {
            if(user.isVerified){
                clearRedisSet()
                return sendToken(user,201,res);
            }

            else{
                sendToken(user,200,res);
                const verificationLink = `http://localhost:4000/verify-email?token=${req.cookies.token}`
                sentEmail(email, verificationLink)
                res.json({
                    success:true,
                    message: "verify your email."
                })
            }
        }
    }

    catch(error){
        console.log("error is ",error);
    }
}

exports.logoutUser = async function(req,res){

    try{
            res.cookie("token",null,{
                expires: new Date(Date.now()),
                httpOnly:true
            })
        
            res.status(200).json({
                success:true,
                message:"Logged out"
            })
    }
    catch(error){
        console.log("error is ",error);
    }
}

exports.verifyEmail = async (req, res) => {
    try {
        const user = await User.findById(req.id);
        console.log("user=> ",user, "id=> ",req.id);
        const result = await User.updateOne({ email: user?.email }, { $set: { isVerified: true } });
        console.log("result=> ",result)
        return res.send("Email verified successfully!");
    } catch (error) {
        return res.status(400).send("Invalid or expired token.");
    }
}

const sentEmail = function (email, verificationLink){
    console.log("email => ", email, "sendingEmail=> ",process.env.MAIL_USERNAME, "password=> ",process.env.MAIL_PASSWORD);
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD
        }
    })
 
    let mailOptions = {
        from: process.env.MAIL_USERNAME,
        to: email,
        subject: 'Email verification',
        text: `Hello,\n\nPlease verify your email by clicking the link: ${verificationLink}\n\nThank you!`
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if(error){
            console.error("error=> ",error);
        } else{
            console.log("verification email sent: ", info.response)
        }
    });
}