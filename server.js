const express = require("express")
const dotenv = require("dotenv")
const cors = require("cors")
dotenv.config();
const dbConnect = require("./config/db/dbConnect")


const userRoutes = require("./route/users/usersRoute");
const { errorHandler,notFound } = require("./middlewares/error/errorHandler");
const postRoute = require("./route/posts/postRoute");





const app = express();
//DB
dbConnect();

//Middleware
app.use(express.json())
//cors
app.use(cors())
//Users route
app.use('/api/users',userRoutes)
//Posts route
app.use('/api/posts',postRoute)


// //Login
// app.post("/api/users/login",(req,res)=>{
//     //business logic
//     res.json({user:"user login"})
// })

// //fetch all users
// app.get("/api/users/",(req,res)=>{
//     //business logic
//     res.json({user:'fetch all users'})
// })


// error handler
app.use(notFound)
app.use(errorHandler)




//server

const PORT = process.env.PORT || 5000
app.listen(PORT,console.log(`server is running on port ${PORT}`))

