// server.js (FINAL BACKEND)
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));

const userSchema = new mongoose.Schema({
phone:{type:String,unique:true},
visits:{type:Number,default:0},
reward:{type:Boolean,default:false}
},{timestamps:true});

const User = mongoose.model("User", userSchema);

// LOGIN
app.post("/login", async(req,res)=>{
try{
const {phone}=req.body;
let user=await User.findOne({phone});

if(!user){
user=await User.create({phone});
}

if(user.visits>=7){
user.reward=true;
await user.save();
}

res.json(user);
}catch{
res.status(500).json({error:"login failed"});
}
});

// ADD VISIT
app.post("/add-visit", async(req,res)=>{
try{
const {phone,amount}=req.body;
let user=await User.findOne({phone});

if(!user) return res.status(404).json({error:"not found"});

if(amount>=250){
if(user.visits<7) user.visits+=1;
if(user.visits>=7) user.reward=true;
await user.save();
}

res.json(user);
}catch{
res.status(500).json({error:"failed"});
}
});

// RESET
app.post("/reset", async(req,res)=>{
try{
const {phone}=req.body;
let user=await User.findOne({phone});
if(user){
user.visits=0;
user.reward=false;
await user.save();
}
res.json(user);
}catch{
res.status(500).json({error:"failed"});
}
});

// GET SINGLE USER
app.get("/user/:phone", async(req,res)=>{
const user=await User.findOne({phone:req.params.phone});
res.json(user||{});
});

// GET ALL USERS (ADMIN)
app.get("/users", async(req,res)=>{
const users=await User.find().sort({updatedAt:-1});
res.json(users);
});

app.get("/",(req,res)=>{
res.send("Boba Backend Live");
});

app.listen(process.env.PORT || 5000, ()=>{
console.log("Server running");
});