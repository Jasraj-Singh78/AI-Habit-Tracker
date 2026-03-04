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

// Small feature: summarize a study session from request body
app.post("/session-summary", (req, res) => {
    const { subject, durationMinutes, mood } = req.body;
    const numericDuration = Number(durationMinutes);

    if (!subject || subject.toString().trim().length === 0 || Number.isNaN(numericDuration)) {
        return res.status(400).json({ error: "subject and a valid numeric durationMinutes are required (0 is allowed)" });
    }

    res
        .status(201)
        .set("X-Study-Tracker", "SessionSummary")
        .json({
            summary: `You studied ${subject} for ${numericDuration} minutes.`,
            mood: mood || "not provided",
        });
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
        if (err) {
            if (err.code === "ENOENT") {
                return res.send("No study log found. Start by writing a note.");
            }
            return res.status(500).send("Error reading file");
        }
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
        if (err) {
            if (err.code === "ENOENT") {
                return res.send("No study log file to delete");
            }
            return res.status(500).send("Error deleting file");
        }
        res.send("File deleted successfully");
    });
});

// Small feature: get number of study log entries (lines) in the file
app.get("/log/count", (req, res) => {
    fs.readFile("data.txt", "utf8", (err, data) => {
        if (err) {
            if (err.code === "ENOENT") {
                return res.json({ entryCount: 0 });
            }
            return res.status(500).json({ error: "Error reading file to count entries" });
        }

        const lines = data.split("\n").filter((line) => line.trim().length > 0);
        res.json({ entryCount: lines.length });
    });
});


/* ==============================
   3️⃣ Serving Static Files
============================== */

// Small feature: serve the main study dashboard explicitly
app.get("/study-dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});


/* ==============================
   4️⃣ File Streams
============================== */

app.get("/stream", (req, res) => {
    const readStream = fs.createReadStream("data.txt", "utf8");
    readStream.on("error", (err) => {
        if (err.code === "ENOENT") {
            return res.status(404).send("No study log found to stream");
        }
        res.status(500).send("Error streaming file");
    });
    readStream.pipe(res);
});

// Small feature: download the study log as a streamed file
app.get("/download-report", (req, res) => {
    const filePath = path.join(__dirname, "data.txt");

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            if (err.code === "ENOENT") {
                return res.status(404).send("No study log found to download");
            }
            return res.status(500).send("Error checking report file");
        }

        res.setHeader("Content-Disposition", 'attachment; filename="study-log.txt"');
        const readStream = fs.createReadStream(filePath);

        readStream.on("error", () => {
            res.status(500).send("Error downloading report");
        });

        readStream.pipe(res);
    });
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});