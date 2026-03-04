const express = require("express");
const fs = require("fs");
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 5000;

const USERS_FILE = path.join(__dirname, "users.json");
const SESSIONS_FILE = path.join(__dirname, "sessions.json");

app.use(express.json());
app.use(
    session({
        secret: "change-this-secret-key",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24, // 1 day
        },
    })
);
app.use(express.static("public"));

function readJson(filePath, defaultValue) {
    try {
        if (!fs.existsSync(filePath)) {
            return defaultValue;
        }
        const raw = fs.readFileSync(filePath, "utf8");
        if (!raw.trim()) return defaultValue;
        return JSON.parse(raw);
    } catch {
        return defaultValue;
    }
}

function writeJson(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

function requireAuth(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    next();
}


/* ==============================
   0️⃣ Auth APIs
============================== */

app.post("/api/auth/signup", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password || password.length < 6) {
        return res.status(400).json({ error: "Email and password (min 6 chars) are required" });
    }

    const users = readJson(USERS_FILE, []);
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
        return res.status(409).json({ error: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
        id: Date.now().toString(),
        email,
        passwordHash,
    };

    users.push(user);
    writeJson(USERS_FILE, users);

    req.session.userId = user.id;
    req.session.email = user.email;

    res.status(201).json({ email: user.email });
});

app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    const users = readJson(USERS_FILE, []);
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    req.session.userId = user.id;
    req.session.email = user.email;

    res.json({ email: user.email });
});

app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
        res.clearCookie("connect.sid");
        res.status(204).end();
    });
});

app.get("/api/auth/me", (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
    }
    res.json({ email: req.session.email });
});

/* ==============================
   1️⃣ Handling Request & Response (basic demo)
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
   2️⃣ File Module Operations (legacy demo)
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
   3️⃣ Study Session APIs
============================== */

app.post("/api/sessions", requireAuth, (req, res) => {
    const { subject, durationMinutes, mood, date } = req.body;
    const numericDuration = Number(durationMinutes);

    if (!subject || subject.toString().trim().length === 0 || Number.isNaN(numericDuration)) {
        return res.status(400).json({ error: "subject and a valid numeric durationMinutes are required" });
    }

    const sessions = readJson(SESSIONS_FILE, []);
    const sessionEntry = {
        id: Date.now().toString(),
        userId: req.session.userId,
        subject: subject.toString(),
        durationMinutes: numericDuration,
        mood: mood || "",
        date: date || new Date().toISOString().slice(0, 10),
        createdAt: new Date().toISOString(),
    };

    sessions.push(sessionEntry);
    writeJson(SESSIONS_FILE, sessions);

    res.status(201).json(sessionEntry);
});

app.get("/api/sessions", requireAuth, (req, res) => {
    const sessions = readJson(SESSIONS_FILE, []);
    const userSessions = sessions.filter((s) => s.userId === req.session.userId);
    res.json(userSessions);
});

app.get("/api/sessions/summary", requireAuth, (req, res) => {
    const sessions = readJson(SESSIONS_FILE, []);
    const userSessions = sessions.filter((s) => s.userId === req.session.userId);

    const today = new Date().toISOString().slice(0, 10);
    let totalMinutes = 0;
    let todayMinutes = 0;
    const bySubject = {};

    for (const s of userSessions) {
        totalMinutes += s.durationMinutes;
        if (s.date === today) {
            todayMinutes += s.durationMinutes;
        }
        const key = s.subject;
        bySubject[key] = (bySubject[key] || 0) + s.durationMinutes;
    }

    res.json({
        totalMinutes,
        totalHours: +(totalMinutes / 60).toFixed(1),
        todayMinutes,
        sessionsCount: userSessions.length,
        bySubject,
    });
});

app.get("/api/sessions/report", requireAuth, (req, res) => {
    const sessions = readJson(SESSIONS_FILE, []);
    const userSessions = sessions.filter((s) => s.userId === req.session.userId);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="study-report.csv"');

    const header = "Date,Subject,DurationMinutes,Mood\n";
    const lines = userSessions.map(
        (s) =>
            `${s.date},${JSON.stringify(s.subject)},${s.durationMinutes},${JSON.stringify(
                s.mood || ""
            )}`
    );

    res.send(header + lines.join("\n"));
});


/* ==============================
   4️⃣ Serving Static Files & File Streams (legacy demos)
============================== */

app.get("/stream", (req, res) => {
    const readStream = fs.createReadStream("data.txt", "utf8");
    readStream.on("error", (err) => {
        if (!res.headersSent) {
            if (err.code === "ENOENT") {
                return res.status(404).send("No study log found to stream");
            }
            return res.status(500).send("Error streaming file");
        }
        // If headers are already sent, just terminate the connection
        res.destroy();
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

        readStream.on("error", (err) => {
            if (!res.headersSent) {
                return res.status(500).send("Error downloading report");
            }
            res.destroy(err);
        });

        readStream.pipe(res);
    });
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});