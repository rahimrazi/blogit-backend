const express = require("express")
const dotenv = require("dotenv")
const cors = require("cors")
dotenv.config();
const dbConnect = require("./config/db/dbConnect")


const userRoutes = require("./route/users/usersRoute");
const { errorHandler,notFound } = require("./middlewares/error/errorHandler");
const postRoute = require("./route/posts/postRoute");
const commentRoutes = require("./route/comments/commentRoute");
const categoryRoute = require("./route/category/categoryRoute");
const chats = require("./chats.js");
const  chatRoutes  = require("./route/chat/chatRoute");
const  messageRoutes  = require("./route/message/messageRoutes")





const app = express();
//DB
dbConnect();




//Middleware
app.use(express.json())
//cors
app.use(cors())
app.get("/",(req,res)=>{
  console.log("heloo blogit server")
  res.send("hello blogit server")
})
//Users route

app.use('/api/users',userRoutes)
//Posts route
app.use('/api/posts',postRoute)
//Comments route
app.use('/api/comments',commentRoutes)
//Category route
app.use('/api/category',categoryRoute)
//Chat routes
app.use('/api/chat',chatRoutes)
//Message routes
app.use('/api/message',messageRoutes)


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
const server  = app.listen(PORT,console.log(`server is running on port ${PORT}`))
const io = require("socket.io")(server,{
    pingTimeout:60000,
    cors:{
        origin:["https://blogit.pizahub.online","http://localhost:3000"],
    }
})

io.on("connection", (socket) => {
    console.log("Connected to socket.io");
    socket.on("setup", (userData) => {
      socket.join(userData._id);
      socket.emit("connected");
    });
  
    socket.on("join chat", (room) => {
      socket.join(room);
      console.log("User Joined Room: " + room);
    });
    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));
  
    socket.on("new message", (newMessageRecieved) => {
        console.log(newMessageRecieved);
        
      var chat = newMessageRecieved.chat;
        
      if (!chat.users) return console.log("chat.users not defined");
  
      chat.users.forEach((user) => {
        if (user._id == newMessageRecieved.sender._id) {
            return;
        }else{
        socket.in(user._id).emit("message recieved", newMessageRecieved);
    }
      });
    });
    socket.off("setup", () => {
      console.log("USER DISCONNECTED");
      socket.leave(userData._id);
    });
})