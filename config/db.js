const mongoose = require("mongoose");
const colors = require("colors");

const connectDB = async() =>{
 try{
    const conn=await mongoose.connect(process.env.MONGO_URI,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    });
    console.log(colors.blue(`MongoDB Connected: ${conn.connection.host}`));
 }
 catch(error){
    console.log(colors.red(`Error: ${error.message}`))
    process.exit();
 }
}
module.exports = connectDB;