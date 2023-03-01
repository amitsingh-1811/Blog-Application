const express = require('express');
const { createBlog, deleteBlog, getblogDetails, updateBlog, getAllBlog } = require('../controller/blogController');
const { isAuthenticatedUser } = require('../middleware/auth');
const router = express.Router();

router.get('/blog', getAllBlog);
router.route("/blog/new").post(isAuthenticatedUser,createBlog);
router.route("/blog/:id")
.put(isAuthenticatedUser,updateBlog)
.delete(isAuthenticatedUser,deleteBlog)
.get(getblogDetails);
module.exports = router;