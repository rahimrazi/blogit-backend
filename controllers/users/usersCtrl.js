const expressAsyncHandler = require('express-Async-Handler');
const generateToken = require('../../config/token/generateToken');
const User = require("../../model/user/User")


//----------------------------------------------------------------
//Register
//----------------------------------------------------------------
const userRegisterCtrl= expressAsyncHandler(async (req,res)=>{
    //check if user Exist
    const userExists = await User.findOne({email:req?.body?.email})
    if(userExists) throw new Error("User already Exist")
    //REgistr User
    console.log(req.body)
    try {
        const user = await User.create({
            firstName: req?.body?.firstName,
            lastName: req?.body?.lastName,
            email: req?.body?.email,
            password: req?.body?.password
        })
        res.json(user)
        
    } catch (error) {
        
        res.json(error)
    }
})

//----------------------------------------------------------------
// User Login

const loginUserCtrl= expressAsyncHandler(async (req,res)=>{
    const { email, password } = req.body;
    //check if user Exists
    const userFound = await User.findOne({ email });
    //Check if password is matching
    if(userFound && (await userFound.isPasswordMatched(password))){
        res.json({
            _id:userFound?._id,
            firstName:userFound?.firstName,
            lastName:userFound?.lastName,
            email:userFound?.email,
            profilePhoto:userFound?.profilePhoto,
            isAdmin:userFound?.isAdmin,
            token:generateToken(userFound?._id)
        })
    }
    else{
        res.status(401)
        throw new Error("Invalid Login Credentials")
        
    }
    // if(!user) throw new Error(`Invalid Login Credentials`)
    // else res.json("user login")
    //check password
})
//----------------------------------------------------------------
// Users
//----------------------------------------------------------------
const fetchUsersCtrl = expressAsyncHandler(async(req,res)=>{
    try {
        const users = await User.find({})
        res.json(users)
        
    } catch (error) {
        res.json(error)
    }

})

module.exports ={userRegisterCtrl, loginUserCtrl,fetchUsersCtrl}