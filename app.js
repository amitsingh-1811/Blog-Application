const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
 app.use(express.json());
 app.use(cookieParser());

 const user = require("./routes/userRoute.js");
 const blog = require("./routes/blogRoute.js");
 app.use("/api",user);
 app.use("/api",blog);

module.exports = app;
