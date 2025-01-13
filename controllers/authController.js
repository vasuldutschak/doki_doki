const {User}=require('./../models/user')
const {ctrlWrapper, HttpError, createHash,sendEmail} = require("../helpers");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {SECRET_KEY}=process.env;
const {nanoid}=require('nanoid')
const {BASE_API_URL,PORT}=process.env;

const register=async (req,res,next)=>{
    const {email,password} = req.body

    const user=await User.findOne({email})

    if(user){
        throw HttpError(409,`User already exists with email: ${email}`)
    }

    const hashPassword=await createHash(password)
    const verificationCode=nanoid()

    const newUser=await User.create({...req.body,password:hashPassword,isVerified:false,userRole:"USER",verificationCode})

    const verifyEmail={
        to:email,
        subject:"Verification Code",
        html:`<a target="_blank" href="${BASE_API_URL}:${PORT}/api/v1/auth/verify/${verificationCode}">Click to verify your email</a>`
    }

    await sendEmail(verifyEmail)

    res.status(201).json({
        email:newUser.email,
        name:newUser.name,
    })
}

const login = async (req,res,next) => {
    const {email,password}=req.body

    const user=await User.findOne({email})

    if(!user){
        throw HttpError(401,`Email or password is incorrect`)
    }

    const comparePassword=await bcrypt.compare(password, user.password)

    if (!comparePassword){
        throw HttpError(401,`Email or password is incorrect`)
    }

    if (!user.isVerified){
        throw HttpError(401,"User not verified. Please verify your account.")
    }

    const token=jwt.sign({id:user._id},SECRET_KEY,{expiresIn:'23h'})

    await User.findByIdAndUpdate(user._id,{token})

    res.json({token})

}


const logout=async (req,res,next)=>{
    const {_id}=req.user
    await User.findByIdAndUpdate(_id,{token:""})
    res.json({message:'Logged Out Success'})
}

const getCurrent=async (req,res,next)=>{
    res.json(req.user)
}

const verify=async (req,res,next)=>{
    const {verificationCode}=req.params
    const user=await User.findOne({verificationCode})
    if(!user){
        throw HttpError(401,`User with verification code is incorrect`)
    }

    await User.findByIdAndUpdate(user._id,{isVerified: true,verificationCode: ""})

    res.status(200).json({message:"Verification Success"})
}

const resendVerificationCode=async (req,res,next)=>{
    const {email}=req.body
    const user=await User.findOne({email})

    if(!user){
        throw HttpError(404,`User with that email is incorrect`)
    }

    if (user.isVerified){
        throw HttpError(404,`User with that email already verified`)
    }

    const verifyEmail={
        to:email,
        subject:"Verification Code",
        html:`<a target="_blank" href="${BASE_API_URL}:${PORT}/api/v1/auth/verify/${user.verificationCode}">Click to verify your email</a>`
    }
    await sendEmail(verifyEmail)
    res.status(200).json({message:"Verification code was sent successfully"})
   // res.redirect('http://localhost:3000/api/v1/auth/login')
}

module.exports={
    register:ctrlWrapper(register),
    login:ctrlWrapper(login),
    logout:ctrlWrapper(logout),
    getCurrent:ctrlWrapper(getCurrent),
    verify:ctrlWrapper(verify),
    resendVerificationCode:ctrlWrapper(resendVerificationCode)
}
