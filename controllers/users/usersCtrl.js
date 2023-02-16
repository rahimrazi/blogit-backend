const expressAsyncHandler = require("express-Async-Handler");
const nodemailer = require("nodemailer");
const fs = require("fs");
const generateToken = require("../../config/token/generateToken");
const User = require("../../model/user/User");
const validateMongodbId = require("../../utils/validateMongodbId");
const crypto = require("crypto");
const cloudinaryUploadImg = require("../../utils/cloudinary");
const blockUser = require("../../utils/blockUser");

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
 
  //check if blocked
  if(userFound?.isBlocked) throw new Error ("access denied , you are blocked")
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
      isVerified: userFound?.isAccountVerified,
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
  console.log(req.headers);
  try {
    const users = await User.find({}).populate("posts");
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
});

//----------
//User profile
//----------
const userProfileCtrl = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongodbId(id);
  //who visited the profile
  //1. find the logged in user
  //2. check this particular user is already there in the array of viewed profile

  // getting the logged in User
  const loginUserId = req?.user?._id?.toString();

  try {
    const myProfile = await User.findById(id).populate("posts").populate("viewedBy");
    //checking already viewed
    const alreadyViewed = myProfile?.viewedBy?.find((user) => {
      return user?._id?.toString() === loginUserId;
    });
    if (alreadyViewed) {
      res.json(myProfile);
    }else{
      const profile = await User.findByIdAndUpdate(myProfile?._id,{
        $push:{viewedBy:loginUserId}
      })
      res.json(profile)
    }
  } catch (error) {
    res.json(error);
  }
});
//-----------------------------------------
//Update user profile
//-----------------------------------------

const updateUserCtrl = expressAsyncHandler(async (req, res) => {
  const { _id } = req?.user;
  blockUser(req?.user)
  console.log(_id);
  validateMongodbId(_id);

  const user = await User.findByIdAndUpdate(
    _id,
    {
      firstName: req?.body?.firstName,
      lastName: req?.body?.lastName,
      email: req?.body?.email,
      bio: req?.body?.bio,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.json(user);
});

//-----------------------
//Update password
//-----------------------

const updatePasswordCtrl = expressAsyncHandler(async (req, res) => {
  //destructure the login user
  const { _id } = req?.user;
  const { password } = req.body;
  validateMongodbId(_id);
  //Find the user by Id
  const user = await User.findById(_id);

  if (password) {
    user.password = password;
    const updatedUser = await user.save();
    res.json(updatedUser);
  } else {
    res.json(user);
  }
});
//------------------------
//FOLLOWING
//------------------------

const followingUserCtrl = expressAsyncHandler(async (req, res) => {
  const { followId } = req.body;
  const loginUserId = req.user.id;

  //find the target user and check if the login id exists
  const targetUser = await User.findById(followId);

  const alreadyFollowing = targetUser?.followers?.find(
    (user) => user?.toString() === loginUserId.toString()
  );
  if (alreadyFollowing) throw new Error("Already Followed this user");

  //1.find the user you want to follow and update its followers field
  await User.findByIdAndUpdate(
    followId,
    {
      $push: {
        followers: loginUserId,
      },
      isFollowing: true,
    },
    { new: true }
  );

  //2.update the logn user following field
  await User.findByIdAndUpdate(
    loginUserId,
    {
      $push: {
        following: followId,
      },
    },
    { new: true }
  );
  res.json("you have successfully followed user");
});
//--------------------------
//Unfolow
//-----------------------------------

const unfollowUserCtrl = expressAsyncHandler(async (req, res) => {
  //1.find the user you want to unfollow and update its following field
  const { unFollowId } = req.body;
  const loginUserId = req.user.id;

  await User.findByIdAndUpdate(
    unFollowId,
    {
      $pull: {
        followers: loginUserId,
      },
      isFollowing: false,
    },
    { new: true }
  );

  //2.update the logn user following field

  await User.findByIdAndUpdate(
    loginUserId,
    {
      $pull: {
        following: unFollowId,
      },
    },
    { new: true }
  );
  res.json("unfollowed this user successfully");
});
//---------------------
//Block user
//---------------------

const blockUserCtrl = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;

  validateMongodbId(id);
  const user = await User.findByIdAndUpdate(
    id,
    {
      isBlocked: true,
    },
    { new: true }
  );
  res.json(user);
  console.log(user);
});
//---------------------
//Un Block user
//---------------------

const unBlockUserCtrl = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;

  validateMongodbId(id);
  const user = await User.findByIdAndUpdate(
    id,
    {
      isBlocked: false,
    },
    { new: true }
  );
  res.json(user);
  console.log(user);
});

//-------------------------
//account verification - send mail - generate email verificaiton token
//----------------------------

const generateVerificationTokenCtrl = expressAsyncHandler(async (req, res) => {
  const loginUserId = req.user.id;
  console.log(loginUserId);
  const user = await User.findById(loginUserId);
  console.log(user);

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });
  // const loginUserId = req.user.id;
  // const user = await User.findById(loginUserId);
  // console.log(user);
  try {
    //generate token
    const verificationToken = await user?.createAccountVerificationToken();
    //save the user
    await user.save();
    console.log(verificationToken, "generated token ");

    const resetURL = `if you are yet to verify your account,verify now within 10  minutes, otherwise ignore this message
     <a href="http://localhost:3000/verify-account/${verificationToken}"> click to verify</a>`;
    let mailOptions = {
      from: "12abdulrahim21@gmail.com",
      to: user?.email,
      // to: "devblog.info2022@gmail.com",
      subject: "blogit Verification",
      message: "verify your account now",
      html: resetURL,
    };
    transporter.sendMail(mailOptions, function (err, data) {
      if (err) {
        console.log("Error Occurs", err);
      } else {
        console.log("Email sent");
        res.json(resetURL);
      }
    });
  } catch (error) {
    res.json(error);
  }
});
//-------------------------
//account verification
//----------------------------

const accountVerificationCtrl = expressAsyncHandler(async (req, res) => {
  const { token } = req.body;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  console.log(hashedToken);

  //find this user by token
  const userFound = await User.findOne({
    accountVerificationToken: hashedToken,
    accountVerificationTokenExpires: { $gt: new Date() },
  });
  if (!userFound) throw new Error("token expired,try again");
  //update the property to true
  userFound.isAccountVerified = true;
  userFound.accountVerificationToken = undefined;
  userFound.accountVerificationTokenExpires = undefined;
  await userFound.save();
  res.json(userFound);
});
//-------------------------
//profile pic upload
//----------------------------
const profilePhotoUploadCtrl = expressAsyncHandler(async (req, res) => {
  //find the logged in user
  const { _id } = req.user;
  blockUser(req?.user)

  //1.get the path to image file
  const localPath = `public/images/profile/${req.file.filename}`;

  //2.upload to cloudinary
  const imgUploaded = await cloudinaryUploadImg(localPath);

  const foundUser = await User.findByIdAndUpdate(
    _id,
    {
      profilePhoto: imgUploaded?.url,
    },
    { new: true }
  );
  //  fs.unlinkSync(localPath);
  res.json(imgUploaded);
});


//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

//chat

//get all users

const allUsers= expressAsyncHandler(async(req,res)=>{
  const keyword = req?.query?.search ?{
    $or:[
      { name: {$regex:req?.query?.search, $options: "i"}},
      { email: {$regex:req?.query?.search, $options: "i"}}
    ]
  }:{};

  const users = await User.find(keyword).find({_id:{$ne:req?.user?._id}})
  res.send(users)

 
  
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
  updatePasswordCtrl,
  followingUserCtrl,
  unfollowUserCtrl,
  blockUserCtrl,
  unBlockUserCtrl,
  generateVerificationTokenCtrl,
  accountVerificationCtrl,
  profilePhotoUploadCtrl,

  allUsers
};
