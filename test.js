const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.send("Server is working");
});

app.get("/login", (req, res) => {
    res.send("Login route working");
});

app.listen(3001, () => {
    console.log("Test server running on 3001");
});