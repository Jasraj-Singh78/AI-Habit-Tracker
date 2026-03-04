const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(express.static("public"));

/* ==============================
   1️⃣ Handling Request & Response
============================== */

app.get("/", (req, res) => {
    res.send("Server is running successfully!");
});

app.post("/hello", (req, res) => {
    const name = req.body.name;
    res.json({ message: `Hello ${name}` });
});


/* ==============================
   2️⃣ File Module Operations
============================== */

// Write to file
app.post("/write", (req, res) => {
    const content = req.body.content;

    fs.writeFile("data.txt", content, (err) => {
        if (err) return res.status(500).send("Error writing file");
        res.send("File written successfully");
    });
});

// Read file
app.get("/read", (req, res) => {
    fs.readFile("data.txt", "utf8", (err, data) => {
        if (err) return res.status(500).send("Error reading file");
        res.send(data);
    });
});

// Append to file
app.post("/append", (req, res) => {
    const content = req.body.content;

    fs.appendFile("data.txt", content, (err) => {
        if (err) return res.status(500).send("Error appending file");
        res.send("Content appended successfully");
    });
});

// Delete file
app.delete("/delete", (req, res) => {
    fs.unlink("data.txt", (err) => {
        if (err) return res.status(500).send("Error deleting file");
        res.send("File deleted successfully");
    });
});


/* ==============================
   3️⃣ File Streams
============================== */

app.get("/stream", (req, res) => {
    const readStream = fs.createReadStream("data.txt", "utf8");
    readStream.pipe(res);
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});