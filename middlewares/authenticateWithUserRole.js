const {HttpError} = require("../helpers");
const jwt=require('jsonwebtoken')
const {SECRET_KEY}=process.env
const {User}=require('../models/user')


const authenticateWithUserRole = (role=["USER"])=>async (req, res, next) => {
    const {authorization=""} = req.headers;
    const [bearer,token] = authorization.split(' ');
    if(bearer !== "Bearer"){
        next( HttpError(401,`Authentication failed`));
    }

    try{
        const {id}=jwt.verify(token, SECRET_KEY);
        const user=await User.findById(id).select('-password -createdAt -updatedAt -isVerified').lean();
        //const user=await User.findById(id)
        if(!user || !user.token || user.token !== token){
            next( HttpError(401,`Authentication failed`));
        }

        if (!role.includes(user.userRole)) {
            next(HttpError(403))
        }
            req.user=user;
        next()
    }catch(error){
        next( HttpError(401,`Authentication failed`));
    }

}

module.exports=authenticateWithUserRole;