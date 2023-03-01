const User = require("../models/userModel");
const bcrypt = require('bcrypt');
const ErrorHandler = require("../utils/errorhandler");
const sendToken = require("../utils/jwtToken");
exports.registerUser = async (req,res,next)=> {

    try{const {name,email,password} = req.body;

    const user = await User.create({

        name,
        email,
        password
    })

    sendToken(user,201,res);}

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
        return sendToken(user,200,res);
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