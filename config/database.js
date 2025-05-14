const mongoose = require("mongoose");

const DB_URI = process.env.DB_URI

const connectDatabase = () => {

       mongoose.connect(DB_URI,{useNewUrlParser:true,useUnifiedTopology:true}).then((data) => {

        console.log(`mongoDB connect with server${data.connection.host}`);
    }).catch(err => console.error('MongoDB connection error:', err));
};

module.exports = connectDatabase;