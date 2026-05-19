require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./src/config/db");

const http = require("http");
const { Server } = require("socket.io");

// CONNECT DATABASE
connectDB();

// CREATE SERVER
const server = http.createServer(app);

// SOCKET.IO SETUP
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

global.io = io;

// SOCKET CONNECTION
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

// IMPORTANT FOR DEPLOYMENT
const PORT = process.env.PORT || 3001;

// START SERVER
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});