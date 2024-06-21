const mongoose=require("mongoose");

mongoose.connect("mongodb+srv://admin:9850196991@login.ovc0xx7.mongodb.net/");

const usermodel=new mongoose.Schema({
    username:String,
    email:String,
    password:String
})

module.exports=mongoose.model('authuser',usermodel);