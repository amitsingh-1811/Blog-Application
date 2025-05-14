const Errorhandler = require('../utils/errorhandler');
const Blog = require('../models/blogModel');
const {
    saveBlogToCache,
    getCachedBlogs,
    incrementBlogFrequency,
    getBlogFrequency,
    getBlogFromCache,
    deleteBlogFromCache
  } = require("../utils/cache");

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
exports.getblogDetails = async (req, res, next) => {
    const blogId = req.params.id;
    const cacheKey = `blog:${blogId}`;
  
    try {
      // 1. Check if the blog is cached in Redis
      const cachedBlog = await getBlogFromCache(blogId);
      console.log("cacheBlog=> ",cachedBlog)
      if (cachedBlog) {
        // Increase frequency for the cached blog
        await incrementBlogFrequency(blogId);
        return res.status(200).json({
          success: true,
          blog: cachedBlog,
          source: "cache"
        });
      }
  
      // 2. Blog is not in cache, fetch from MongoDB
      const blog = await Blog.findById(blogId);
      if (!blog) {
        return next(new Errorhandler("Blog not found", 404));
      }
  
      // 3. Increase frequency count (for tracking access frequency)
      await incrementBlogFrequency(blogId);
  
      // 4. Optionally, cache the blog if its access frequency is above a threshold.
      // For example, if accessed 5 or more times, then cache it.
      const blogFrequency = await getBlogFrequency(blogId);
      if (blogFrequency >= 5) {
        await saveBlogToCache(blog);
      }
  
      // 5. Return blog details from the database
      res.status(200).json({
        success: true,
        blog,
        source: "database"
      });
    } catch (error) {
      return next(new Errorhandler(error.message, 500));
    }
  };

//UPDATE BLOG

exports.updateBlog = async (req,res,next) => {

    const userID = req.user.id;
    const blogID = req.params.id;
    let blog = await Blog.findById(req.params.id);

    if(!blog)
     {
        return next(new Errorhandler("blog not found",404));
     }
    
     if(blog.user != userID)
    {
        return next(new Errorhandler("you can't update this blog",404));
    }

    // Call function to remove from cache
    await deleteBlogFromCache(blogID);

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

    try {
        const userID = req.user.id;
        const blogID = req.params.id;
        console.log("userId=> ",userID, " and ", "blogId=> ",blogID)
    
        // Fetch blog from DB
        const blog = await Blog.findById(blogID);
        if (!blog) {
          return next(new Errorhandler("Blog not found", 404));
        }
    
        // Validate user authorization
        if (blog.user != userID) {
          return next(new Errorhandler("You can't delete this blog", 403));
        }
    
        // Call function to remove from cache
        await deleteBlogFromCache(blogID);

        // Remove blog from DB
        await blog.deleteOne();
    
        res.status(200).json({
          success: true,
          message: "Blog deleted successfully",
        });
      } catch (error) {
        next(error);
      }
};

//GET ALL BLOG
exports.getAllBlog = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 9;
    const skip = (page - 1) * limit; // page 1 -> skip 0, page 2 -> skip 9, page 3 -> skip 18

    // Fetch blogs based on the page and skip/limit
    const blogs = await Blog.find().skip(skip).limit(limit);

    // Process each blog
    for (let blog of blogs) {
      const blogIdStr = blog._id.toString();

      // Increment frequency
      const freq = await incrementBlogFrequency(blogIdStr);
      console.log("Frequency of blog:", blogIdStr, "is", freq);

      // If frequency exceeds the threshold (e.g., 5), store it in cache
      if (freq >= 5) {
        await saveBlogToCache(blog); // Save blog to cache if threshold is met
        console.log(`Blog with ID ${blogIdStr} cached after crossing threshold.`);
      }
    }

    // Return the blogs
    res.status(200).json({ success: true, blogs, fromCache: false });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
