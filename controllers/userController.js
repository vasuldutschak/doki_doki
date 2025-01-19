const {ctrlWrapper, HttpError, createHash} = require("../helpers");
const {User}=require('./../models/user')
const {DEFAULT_AVATAR}=process.env

const updateVerify = async (req,res,next) => {
    const {id} = req.params;
    const {isVerified} = req.body;
    const user=await User.findByIdAndUpdate(id,{isVerified},{new:true})
    if(!user){
        throw HttpError(404,`User does not exists with id ${id}`)
    }
    res.status(200).json({user})
}

const getAll=async (req,res,next) => {
    const users=await User.find().select('-password')
    res.status(200).json(users)
}

const removeById=async (req,res,next) => {
    const {id} = req.params;
    const user = await User.findByIdAndDelete(id).select('-password');

    if (!user) {
        throw HttpError(404, `User with id ${id} not found`);
    }

    res.status(200).json({ message: "User deleted successfully", user });
}

const update=async (req,res,next) => {
    const { id } = req.params; // The ID of the user to update
    const { userRole, _id: requesterId } = req.user; // Role and ID of the logged-in user
    const updates = req.body; // The fields to update

    // Check if the user is trying to update themselves or is an admin
    if (requesterId.toString() !== id && userRole !== 'ADMIN') {
        throw HttpError(403, 'You are not authorized to update this user');
    }

    // Perform the update
    const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });

    // Check if the user exists
    if (!updatedUser) {
        throw HttpError(404, `User with id ${id} not found`);
    }

    // Respond with the updated user details
    res.status(200).json(updatedUser);

}

const createUserAccount=async (req,res,next) => {
    const {email,password} = req.body

    const user=await User.findOne({email})

    if(user){
        throw HttpError(409,`User already exists with email: ${email}`)
    }

    const hashPassword=await createHash(password)


    const newUser=await User.create({...req.body,password:hashPassword,avatar:DEFAULT_AVATAR})

    res.status(201).json({
        email:newUser.email,
        name:newUser.name,
    })
}

const getUserById=async (req,res,next) => {
    const {id} = req.params;

    if (req.user.userRole !== 'ADMIN' && req.user._id.toString() !== id) {
        throw HttpError(403, `Access denied. You do not have permission to access user with id ${id}`);
    }

    const user=await User.findById(id,"-password -isVerified -verificationCode -createdAt -updatedAt")

    if(!user){
        throw HttpError(403,`User with id ${id} not found`);
    }
    res.status(200).json(user)
}

module.exports={
    updateVerify:ctrlWrapper(updateVerify),
    getAll:ctrlWrapper(getAll),
    removeById:ctrlWrapper(removeById),
    update:ctrlWrapper(update),
    createUserAccount:ctrlWrapper(createUserAccount),
    getUserById:ctrlWrapper(getUserById)
}
