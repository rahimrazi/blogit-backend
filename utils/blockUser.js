const blockUser = (user) =>{
 if(user?.isBlocked){
    throw new Error(`Access Denied, user ${user?.firstName} is blocked`)
 }
}

module.exports = blockUser