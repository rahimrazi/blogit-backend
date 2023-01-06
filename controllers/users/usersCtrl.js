const expressAsyncHandler = require("express-Async-Handler");
const generateToken = require("../../config/token/generateToken");
const User = require("../../model/user/User");
const validateMongodbId = require("../../utils/validateMongodbId");

//----------------------------------------------------------------
//Register
//----------------------------------------------------------------
const userRegisterCtrl = expressAsyncHandler(async (req, res) => {
  //check if user Exist
  const userExists = await User.findOne({ email: req?.body?.email });
  if (userExists) throw new Error("User already Exist");
  //REgistr User

  try {
    const user = await User.create({
      firstName: req?.body?.firstName,
      lastName: req?.body?.lastName,
      email: req?.body?.email,
      password: req?.body?.password,
    });
    res.json(user);
  } catch (error) {
    res.json(error);
  }
});

//----------------------------------------------------------------
// User Login

const loginUserCtrl = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  //check if user Exists
  const userFound = await User.findOne({ email });
  //Check if password is matching
  if (userFound && (await userFound.isPasswordMatched(password))) {
    res.json({
      _id: userFound?._id,
      firstName: userFound?.firstName,
      lastName: userFound?.lastName,
      email: userFound?.email,
      profilePhoto: userFound?.profilePhoto,
      isAdmin: userFound?.isAdmin,
      token: generateToken(userFound?._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Login Credentials");
  }
  // if(!user) throw new Error(`Invalid Login Credentials`)
  // else res.json("user login")
  //check password
});
//----------------------------------------------------------------
// Users
//----------------------------------------------------------------
const fetchUsersCtrl = expressAsyncHandler(async (req, res) => {
    console.log(req.headers)
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.json(error);
  }
});

//----------------------------------------------------------------
// Delete a user
//----------------------------------------------------------------

const deleteUsersCtrl = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  //check if user id is valid

  validateMongodbId(id);
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    res.json(deletedUser);
  } catch (error) {
    res.json(error);
  }
});
//----------------------------------------------------------------
//  Single User Details
//----------------------------------------------------------------

const fetchUserDetailsCtrl = expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    //check if user id is valid
    validateMongodbId(id);
    try {
      const user = await User.findById(id);
      res.json(user);
    } catch (error) {
      res.json(error);
}
})

//----------
//User profile
//----------

const userProfileCtrl = expressAsyncHandler(async(req,res)=>{
  const {id} = req.params;
  validateMongodbId(id);
  try {
    const myProfile = await User.findById(id)
    res.json(myProfile);
    
  } catch (error) {
    res.json(error);

    
  }
})

//-----------------------------------------
//Update user profile
//-----------------------------------------


const updateUserCtrl = expressAsyncHandler(async(req,res)=>{
  const {_id} = req?.user;
  console.log(_id)
  validateMongodbId(_id)

  const user = await User.findByIdAndUpdate(_id,{
    
      firstName: req?.body?.firstName,
      lastName: req?.body?.lastName,
      email: req?.body?.email,
      bio:req?.body?.bio,
  },{
    new: true,
    runValidators: true,
  })
  
  res.json(user)
})

//-----------------------
//Update password
//-----------------------

const updatePasswordCtrl = expressAsyncHandler(async(req,res)=>{
  //destructure the login user
  const {_id} = req?.user;
  const {password} = req.body
  
  validateMongodbId(_id)
  //Find the user by Id
  const user = await User.findById(_id)

  
  if(password){
    user.password = password;
    const updatedUser = await user.save();
    res.json(updatedUser)

  }else{
  res.json(user)
}


})


//exports
module.exports = {
  userRegisterCtrl,
  loginUserCtrl,
  fetchUsersCtrl,
  deleteUsersCtrl,
  fetchUserDetailsCtrl,
  userProfileCtrl,
  updateUserCtrl,
  updatePasswordCtrl

};