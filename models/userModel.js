const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({

    name:{
        type:String,
        required:[true,"please enter your name"],
        length:[30,"name cannot exceed 30 character"],
        minLength:[4,"name cannot less than 4 character"]
    },

    email:{
        type:String,
        required:[true,"please enter your email"],
        unique:true,
        validator:[validator.isEmail,"please enter valid email"]
    },

    password:{
        type:String,
        required:[true,"please enter valid password"],
        minLength:[8,"password should be greater than 8 character"],
        select:false
    },

    isVerified: {
        type: Boolean,
        default: false
    }
})

userSchema.pre('save',async function(next){

    if(!this.isModified())
     next();

    this.password = await bcrypt.hash(this.password,10);
})

//JWT Token
userSchema.methods.getJWTToken = function () {
    
    const val = process.env.JWT_SECRET;
    
    return jwt.sign({id: this._id}, val, {
        expiresIn: process.env.JWT_EXPIRE,
    });
},

//compare password
userSchema.methods.comparePassword = async function(enteredPassword,comparablePassword){

    console.log("entered in compare box.====>>>");
    return await bcrypt.compare(enteredPassword,comparablePassword);
}

module.exports = mongoose.model("user",userSchema);