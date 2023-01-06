const mongoose = require('mongoose');


const validateMongodbId = id => {
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if(!isValid) throw new Error('User id is not found or invalid')
    //return mongoose.Types.ObjectId.isValid(id);
}

module.exports =  validateMongodbId 