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