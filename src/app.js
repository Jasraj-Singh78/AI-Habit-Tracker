const express = require("express");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");

const app = express();

// 🔹 Core Middleware
app.use(cors());
app.use(express.json());

// 🔹 Cookie + Session (MUST come BEFORE routes)
app.use(cookieParser());

app.use(session({
    secret: "mysecretkey",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// 🔹 Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const sessionAuthRoutes = require("./routes/sessionAuthRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/session-auth", sessionAuthRoutes);

// 🔹 Test Route
app.get("/", (req, res) => {
    res.send("AI Study Habit Tracker API Running");
});

module.exports = app;