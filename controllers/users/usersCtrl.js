const User = require("../../model/user/User")


//----------------------------------------------------------------
//Register
//----------------------------------------------------------------
const userRegisterCtrl=async (req,res)=>{
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
}



// (req,res)=>{
//     //business logic
//     res.json({user:'user login'})
// }



module.exports ={userRegisterCtrl}