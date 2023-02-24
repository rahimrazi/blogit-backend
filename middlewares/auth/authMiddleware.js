const expressAsyncHandler  = require('express-async-handler');


const jwt = require("jsonwebtoken");
const User = require('../../model/user/User');

const authMiddleware = expressAsyncHandler(async (req, res,next) => {
    let token;

    if(req?.headers?.authorization?.startsWith('Bearer')){
        try {
            token = req.headers.authorization.split(' ')[1];
            if(token){
                const decoded = jwt.verify(token, process.env.JWT_KEY);

            //find the user by id
            const user = await User.findById(decoded?.id).select('-password');
            //attach the user to the request object
            req.user = user;
            //check if blocked
            if(user?.isBlocked) throw new Error ("access denied , you are blocked")

            next();

            }else{
                throw new Error('there is no token attached to the header')
            }
        } catch (error) {
            throw new Error('not authorized,token expired, login again');
            
            }
        

}else{
    throw new Error('no token attached to the header')
}
})


module.exports = authMiddleware;