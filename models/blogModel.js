const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({

    title:{
        type:String,
        required:[true,"please write title of the blog"]
    },

    description:{
        type:String,
        required:[true,"please write blog here"]
    },

    user: {
        type: mongoose.Schema.Types.ObjectId, 
        required: true
    },

    createdAt:{
        type:Date,
        default:Date.now()
    }
});

module.exports = mongoose.model("blog",blogSchema);