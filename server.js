const express = require("express");
const dotenv = require("dotenv");
const { chats } = require("./data/data");
const connectDB = require("./config/db");
const colors = require("colors");
const userRoutes = require("./routes/userRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
// const {registerUser,authUser} = require("../controllers/userControllers");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const path  = require("path");
const __dirname1 = path.resolve();

const app = express();
dotenv.config();
connectDB();
app.use(express.json());
console.log(chats, "ddddcdc");


app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// --------------------Deployment------------------

// const __dirname1 = path.resolve();
if(process.env.NODE_ENV==="production"){
const staticPath = path.join(__dirname1,"public","build");
console.log(staticPath);
app.use(express.static(staticPath));

app.get('*',(req,res)=>{
    console.log(indexPath);
    res.sendFile(path.join(staticPath,"index.html"));
})
}
else{
    app.get("/", (req, res) => {
        res.send("API is running Succesfully");
      }); 
}

// --------------------Deployment------------------



app.use(notFound);
app.use(errorHandler);

// app.get("/api/chat",(req,res)=>{
//     res.send(chats);
// })

// app.get("/api/chat/:id",(req,res)=>{
//     const singleChat = chats.find((c)=>c._id===req.params.id);
//     res.send(singleChat);
// })

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(colors.yellow(`server is running on port ${PORT} `));
});
const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
    // credentials: true,
  },
});
io.on("connection", (socket) => {
  console.log("connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    console.log(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User joined room :" + room);
  });

  socket.on("typing",(room) => socket.in(room).emit("typing"));
  socket.on("stop typing",(room)=>socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;
    if (!chat.users) return console.log("chat.users not defined");
    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;
      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.off("setup",()=>{
    console.log('USER DISCONNECTED');
    socket.leave(userData._id);
  });
});
