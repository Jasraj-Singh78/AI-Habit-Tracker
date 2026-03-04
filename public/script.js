async function writeNote() {
    const content = document.getElementById("noteInput").value;

    await fetch("/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
    });

    alert("Note written successfully");
}

async function appendNote() {
    const content = document.getElementById("noteInput").value;

    await fetch("/append", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
    });

    alert("Note appended successfully");
}

async function readNote() {
    const res = await fetch("/read");
    const data = await res.text();
    document.getElementById("output").innerText = data;
}

async function deleteNote() {
    await fetch("/delete", { method: "DELETE" });
    alert("File deleted");
}

async function streamNote() {
    const res = await fetch("/stream");
    const data = await res.text();
    document.getElementById("output").innerText = data;
}

// ---- AI Study Habit Tracker specific features ----

async function createSessionSummary() {
    const subject = document.getElementById("subjectInput").value;
    const durationMinutes = Number(document.getElementById("durationInput").value);
    const mood = document.getElementById("moodInput").value;

    const res = await fetch("/session-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, durationMinutes, mood }),
    });

    const data = await res.json();
    document.getElementById("output").innerText = JSON.stringify(data, null, 2);
}

async function getLogCount() {
    const res = await fetch("/log/count");
    const data = await res.json();
    document.getElementById("output").innerText = `Study log entries: ${data.entryCount}`;
}

function downloadReport() {
    window.location.href = "/download-report";
}
