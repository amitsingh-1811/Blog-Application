//const ErrorHandler = require("../utils/errorhandler");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel")

exports.isAuthenticatedUser =  async function(req,res,next){

    try{

        const {token} = req.cookies;
        
        if(!token){

            return next(new ErrorHandler("please login to access this resource",401));
        }

        const decodedData =  jwt.verify(token,process.env.JWT_SECRET);
        
        //console.log("decoded data => ",decodedData);
        req.user = await User.findById(decodedData.id);
        //console.log("req.user => ",req.user);

        next();
    }

    catch(error){
        console.log("error is ",error);
    }

};
