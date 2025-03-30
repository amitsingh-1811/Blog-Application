const ErrorHandler = require("../utils/errorhandler");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel")

exports.isAuthenticatedUser =  async function(req,res,next){

    try{

        const {token} = req.cookies;
        
        if(!token){

            return next(new ErrorHandler("please login to access this resource",401));
        }

        const decodedData =  jwt.verify(token,process.env.JWT_SECRET);
        req.user = await User.findById(decodedData.id);
        next();
    }

    catch(error){
        console.log("error is ",error);
    }

};

exports.emailVerification = async function(req, res, next){
    try{
        const {token} = req.query;

        if(!token){
            return res.status(400).send("Invalid verification link.");
        }

        console.log("token=> ",token)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("decodeId=> ",decoded.id)
        req.id = decoded.id

        console.log("id=> ",req.id)
        next()
    }

    catch(error){
        res.status(400).send(`some error occured. error is ${error}`)
    }
}
