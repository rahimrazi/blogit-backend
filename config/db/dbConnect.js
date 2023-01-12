const mongoose = require('mongoose');

const dbConnect = async() => {
    try{
        await mongoose.connect(process.env.MONGODB_URL,{
            useCreateIndex: true,
            useFindAndModify: false,
            useUnifiedTopology:true,
            useNewUrlParser:true
        })
        console.log("Connected to Db Successfully")
    }catch(error){
        console.log(`Db Error: ${error.message}`);
    }
}

module.exports = dbConnect;
