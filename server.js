const express = require("express")
const dotenv = require("dotenv")
dotenv.config();
const dbConnect = require("./config/db/dbConnect")

const userRoutes = require("./route/users/usersRoute");
const { errorHandler,notFound } = require("./middlewares/error/errorHandler");



const app = express();
//DB
dbConnect();

//Middleware
app.use(express.json())
//Users route
app.use('/api/users',userRoutes)


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

