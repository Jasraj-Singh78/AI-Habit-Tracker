async function api(path, options = {}) {
    const res = await fetch(path, {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
        credentials: "same-origin",
        ...options,
    });

    if (!res.ok) {
        let msg = "Request failed";
        try {
            const data = await res.json();
            msg = data.error || msg;
        } catch {
            // ignore
        }
        throw new Error(msg);
    }

    const contentType = res.headers.get("Content-Type") || "";
    if (contentType.includes("application/json")) {
        return res.json();
    }
    return res.text();
}

function showView(viewId) {
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("active-view"));
    const el = document.getElementById(viewId);
    if (el) el.classList.add("active-view");
}

function setCurrentUser(email) {
    const emailEl = document.getElementById("currentUserEmail");
    const logoutBtn = document.getElementById("logoutBtn");
    if (email) {
        emailEl.textContent = email;
        logoutBtn.classList.remove("hidden");
    } else {
        emailEl.textContent = "";
        logoutBtn.classList.add("hidden");
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const errorEl = document.getElementById("loginError");
    errorEl.textContent = "";

    try {
        const data = await api("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });
        setCurrentUser(data.email);
        showView("dashboardView");
        await loadDashboard();
    } catch (err) {
        errorEl.textContent = err.message;
    }
}

async function handleSignup(event) {
    event.preventDefault();
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    const errorEl = document.getElementById("signupError");
    errorEl.textContent = "";

    try {
        const data = await api("/api/auth/signup", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });
        setCurrentUser(data.email);
        showView("dashboardView");
        await loadDashboard();
    } catch (err) {
        errorEl.textContent = err.message;
    }
}

async function handleLogout() {
    try {
        await fetch("/api/auth/logout", { method: "POST" });
    } catch {
        // ignore
    }
    setCurrentUser(null);
    showView("authView");
}

async function handleSessionSubmit(event) {
    event.preventDefault();
    const subject = document.getElementById("sessionSubject").value;
    const durationMinutes = Number(document.getElementById("sessionDuration").value);
    const mood = document.getElementById("sessionMood").value;
    const date = document.getElementById("sessionDate").value || undefined;
    const errorEl = document.getElementById("sessionError");
    errorEl.textContent = "";

    try {
        await api("/api/sessions", {
            method: "POST",
            body: JSON.stringify({ subject, durationMinutes, mood, date }),
        });

        // clear duration and mood, keep subject
        document.getElementById("sessionDuration").value = "";
        document.getElementById("sessionMood").value = "";

        await loadDashboard();
    } catch (err) {
        errorEl.textContent = err.message;
    }
}

async function loadDashboard() {
    await Promise.all([loadSummary(), loadHistory()]);
}

async function loadSummary() {
    try {
        const summary = await api("/api/sessions/summary", { method: "GET" });
        document.getElementById("totalHours").textContent = `${summary.totalHours} h`;
        document.getElementById("totalMinutes").textContent = `${summary.totalMinutes} minutes`;
        document.getElementById("todayMinutes").textContent = `${summary.todayMinutes} min`;
        document.getElementById("sessionsCount").textContent = `${summary.sessionsCount} sessions`;

        let topSubject = "–";
        let topMinutes = 0;
        Object.entries(summary.bySubject || {}).forEach(([subject, minutes]) => {
            if (minutes > topMinutes) {
                topMinutes = minutes;
                topSubject = subject;
            }
        });
        document.getElementById("topSubject").textContent = topSubject;
        document.getElementById("topSubjectMinutes").textContent = topMinutes
            ? `${topMinutes} min`
            : "";

        renderChart(summary);
    } catch {
        // ignore for now
    }
}

async function loadHistory() {
    try {
        const sessions = await api("/api/sessions", { method: "GET" });
        const tbody = document.getElementById("historyBody");
        tbody.innerHTML = "";
        sessions
            .slice()
            .reverse()
            .forEach((s) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${s.date}</td>
                    <td>${s.subject}</td>
                    <td>${s.durationMinutes} min</td>
                    <td>${s.mood || ""}</td>
                `;
                tbody.appendChild(tr);
            });
    } catch {
        // ignore
    }
}

function renderChart(summary) {
    const chartEl = document.getElementById("chartContainer");
    chartEl.innerHTML = "";

    const entries = Object.entries(summary.bySubject || {});
    if (entries.length === 0) {
        chartEl.innerHTML = "<p style=\"font-size:12px;color:#9ca3af;\">No study data yet. Log a session to see your focus chart.</p>";
        return;
    }

    const topFive = entries.sort((a, b) => b[1] - a[1]).slice(0, 5);
    const maxMinutes = topFive[0][1] || 1;

    topFive.forEach(([subject, minutes]) => {
        const bar = document.createElement("div");
        bar.className = "chart-bar";

        const valueEl = document.createElement("div");
        valueEl.className = "chart-bar-value";
        valueEl.textContent = `${minutes}m`;

        const barInner = document.createElement("div");
        barInner.className = "chart-bar-inner";
        const height = Math.max(0.12, minutes / maxMinutes);
        requestAnimationFrame(() => {
            barInner.style.transform = `scaleY(${height})`;
        });

        const label = document.createElement("div");
        label.className = "chart-bar-label";
        label.textContent = subject;

        bar.appendChild(valueEl);
        bar.appendChild(barInner);
        bar.appendChild(label);
        chartEl.appendChild(bar);
    });
}

function initDate() {
    const input = document.getElementById("sessionDate");
    const today = new Date().toISOString().slice(0, 10);
    input.value = today;
}

async function bootstrap() {
    document.getElementById("loginForm").addEventListener("submit", handleLogin);
    document.getElementById("signupForm").addEventListener("submit", handleSignup);
    document.getElementById("logoutBtn").addEventListener("click", handleLogout);
    document.getElementById("sessionForm").addEventListener("submit", handleSessionSubmit);
    document
        .getElementById("downloadReportBtn")
        .addEventListener("click", () => (window.location.href = "/api/sessions/report"));

    initDate();

    // Try to restore session
    try {
        const me = await api("/api/auth/me", { method: "GET" });
        setCurrentUser(me.email);
        showView("dashboardView");
        await loadDashboard();
    } catch {
        setCurrentUser(null);
        showView("authView");
    }
}

document.addEventListener("DOMContentLoaded", bootstrap);
