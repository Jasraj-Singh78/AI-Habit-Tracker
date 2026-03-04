# AI Study Habit Tracker (Backend Demo)

This project is a small backend built with **Express.js** that demonstrates core Node.js backend concepts using an AI Study Habit Tracker theme:

- **Handling request & response** with Express routes
- **File module operations** (read, write, append, delete) using the Node.js `fs` module
- **Serving static files** (HTML, CSS, JS) from the `public` folder
- **File streams** for efficiently sending large study log reports

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
npm start
```

3. Open the Study Dashboard in your browser:

- `http://localhost:5000/study-dashboard`

The dashboard lets you:

- Create a **study session summary**
- Check the **number of study log entries**
- Download a **study report** (streamed file)
- Directly interact with the study log file (write, append, read, delete, stream)

## Key endpoints

### 1. Handling Request & Response

- `POST /session-summary`
  - Body:
    ```json
    {
      "subject": "Math",
      "durationMinutes": 45,
      "mood": "focused"
    }
    ```
  - Response: JSON summary of the study session with a custom header `X-Study-Tracker: SessionSummary`.

### 2. File Module Operations

- `POST /write` – overwrite `data.txt` with content
- `POST /append` – append content to `data.txt`
- `GET /read` – read `data.txt`
- `DELETE /delete` – delete `data.txt`
- `GET /log/count` – return `{ "entryCount": number }` for non-empty lines in `data.txt`

### 3. Serving Static Files

- `GET /study-dashboard` – serves `public/index.html` (AI Study Habit Tracker UI)
- Static assets (CSS, JS) are served from `/public` via `express.static`.

### 4. File Streams

- `GET /stream` – stream the contents of `data.txt` to the client
- `GET /download-report` – stream `data.txt` as a downloadable file (`study-log.txt`)

## Sample data

The project ships with a small `data.txt` file containing example study sessions so that log-related endpoints work immediately. You can overwrite or append to this file via the UI or API.

# Eval-One