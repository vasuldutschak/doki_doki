const {User}=require('./../models/user')
const {ctrlWrapper, HttpError, createHash} = require("../helpers");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {SECRET_KEY}=process.env;

const register=async (req,res,next)=>{
    const {email,password} = req.body

    const user=await User.findOne({email})

    if(user){
        throw HttpError(409,`User already exists with email: ${email}`)
    }

    const hashPassword=await createHash(password)

    const newUser=await User.create({...req.body,password:hashPassword,isVerified:false,userRole:"USER"})

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

module.exports={
    register:ctrlWrapper(register),
    login:ctrlWrapper(login),
    logout:ctrlWrapper(logout),
    getCurrent:ctrlWrapper(getCurrent)
}
