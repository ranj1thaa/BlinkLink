const tokens = require("../middleware/authMiddleware");
const User = require("../models/User");
const ExpressError = require("../utils/ExpressError");
const WrapAsync = require("../utils/WrapAsync");
const bcrypt=require('bcrypt')

const login=WrapAsync(async(req, res)=>{
  const {email, password}=req.body
  if (!email || !password) {
    throw new ExpressError(400, "Email & Password required");
  }
  const existing=await User.findOne({email})
  if(!existing){
    throw new ExpressError(404, "User Not Found");
  }
  const isMatch=await bcrypt.compare(password, existing.password)
  if(!isMatch){
    throw new ExpressError(404, "Invalid Password");
  }

  const token=tokens(existing)

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
res.cookie("token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 15 * 60 * 1000
});

  res.status(200).json({
    message:"Logged In",
    user: {
 id: existing._id,
 email: existing.email,
 username: existing.username,
 role: existing.role
}
  })

})


const signup=WrapAsync(async(req, res)=>{
  const {username, email, password}=req.body
  if (!username|| !email || !password) {
    throw new ExpressError(400, "Name, Email & Password required");
  }
  const existing=await User.findOne({email})
  if(existing){
    throw new ExpressError(409, "User already exists");
  }
  const hashedPwd= await bcrypt.hash(password, 10)

  const user=new User({
    username,
    email,
    password:hashedPwd,
  })

  await user.save()

  const token=tokens(user)
  if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
  }
res.cookie("token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 15 * 60 * 1000
});

  res.status(201).json({
    message: "Signup successful",

    user: {
 id: user._id,
 email: user.email,
 username: user.username,
 role: user.role
}
  });
})

const logout=WrapAsync(async(req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production"
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
});
module.exports={login, signup, logout}