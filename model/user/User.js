const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');



//create a new schema

const userSchema =  new mongoose.Schema({
    
    firstName:{
        required:[true,'First Name is required'],
        type:String,

    },
    lastName:{
        required:[true,'Last Name is required'],
        type:String,

    },
    
        profilePhoto:{
            type:String,
            default:'https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_960_720.png'
        
    },
    email:{
        required:[true,'Email is required'],
        type:String
    },
    bio:{
        
        type:String
    },
    password:{
        required:[true,'Password is required'],
        type:String
    },
    postCount:{
        type:Number,
        default:0
    },
    isBlocked:{
        type:Boolean,
        default:false,
    },
    isAdmin:{
        type:Boolean,
        default:false,
    },
    role:{
        type:String,
        enum:['Admin', 'Guest','Blogger']
    },
    isFollowing:{
        type:Boolean,
        default:false
    },
    isUnFollowing:{
        type:Boolean,
        default:false
    },
    isAccountVerified:{
        type:Boolean,
        default:false
    },
    accountVerificationToken: String,
    accountVerificationTokenExpires: Date,


    viewedBy:{
        type:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:'User'
            }
        ],//all the userIDs who viewed is referenced to this array
        

    },

    followers:{
        type:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:'User'
            }
        ]
    
    },
    following:{
        type:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:'User'
            }
        ]
    
    },
    passwordChangeAt:Date,
    passwordResetToken:String,
    passwordResetTokenExpires:Date,

    active:{
        type:Boolean,
        default:false
    }

},{
    toJSON:{
        virtuals:true
    },
    toObject:{
        virtuals:true
    },
    timestamps:true
}
)

//virtual method to populate created post

userSchema.virtual('posts',{
    ref:'Post',
    foreignField:'user',
    localField:'_id'
})

// Account Type
userSchema.virtual('accountType').get(function(){
    const totalFollowers = this.followers?.length;
    return totalFollowers >= 0 ? "Pro Account":"Starter Account"
})



//hashing the password before saving it to the database
 userSchema.pre("save",async function (next) {
    
    if(!this.isModified('password'))  {
        next()

    }
    //hash passworrd
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt)
    next();
 })

 // matching password while Login
 userSchema.methods.isPasswordMatched = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };
  
//Verify account
userSchema.methods.createAccountVerificationToken =async function(){

    //create a token
    const verificationToken = crypto.randomBytes(32).toString("hex")
    this.accountVerificationToken = crypto.createHash('sha256').update(verificationToken).digest("hex");
    //token expire after 10 minutes
    this.accountVerificationTokenExpires =Date.now()+30*60*1000

    return verificationToken;
}


//compile schema into model

const User = mongoose.model('User',userSchema);

module.exports = User;
