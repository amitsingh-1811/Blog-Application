const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
app.use(cookieParser());
 app.use(express.json());

 const user = require("./routes/userRoute.js");
 const blog = require("./routes/blogRoute.js");
 app.use("/api",user);
 app.use("/api",blog);

module.exports = app;
