const Errorhandler = require('../utils/errorhandler');
const Blog = require('../models/blogModel');

exports.createBlog = async function(req,res,next){

    try{

        req.body.user = req.user.id;
        
        const blog = await Blog.create(req.body);

        res.status(201).json({
            success:true,
            blog
        });
    }

    catch(error){

        console.log("error is ",error);
    }

}

// GET BLOG DETAILS
exports.getblogDetails = async (req,res,next) => {

    const blog = await Blog.findById(req.params.id);

    if(!blog)
     {
        return next(new Errorhandler("blog not found",404));
     }
    
    res.status(200).json({
        success:true,
        blog,
        //productCount
    });
};

//UPDATE BLOG

exports.updateBlog = async (req,res,next) => {

    let ID = req.user.id;
    let blog = await Blog.findById(req.params.id);

    if(!blog)
     {
        return next(new Errorhandler("blog not found",404));
     }
    
     if(blog.user != ID)
    {
        return next(new Errorhandler("you can't update this blog",404));
    }

    blog = await Blog.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    });

    res.status(200).json({
        success:true,
        blog
    });
};

//DELETE BLOG

exports.deleteBlog = async (req,res,next) => {

    let ID = req.user.id;
    const blog = await Blog.findById(req.params.id);

    if(!blog)
     {
        return next(new Errorhandler("blog not found",404));
     }
    
     if(blog.user != ID)
     {
         return next(new Errorhandler("you can't delete this blog",404));
     }
    
    await blog.remove(req.params.id);

    res.status(200).json({
        success:true,
        message:"blog deleted successfully"
    });
};

//GET ALL BLOG
exports.getAllBlog = async (req, res) => {
    let user = req.query.user;
    let blogs;
    try {
        if (user)
            blogs = await Blog.find({ user: user });

        else
            blogs = await Blog.find({});
        res.status(200).json(blogs);
    } catch (error) {
        res.status(500).json(error)
    }
}

