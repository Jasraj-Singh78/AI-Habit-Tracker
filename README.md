## AI Study Habit Tracker

Simple MERN-style project: Node.js/Express backend with MongoDB Atlas and a static HTML/CSS/JS frontend.

### Project structure

```text
ai-study-habit-tracker
├── backend
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── models
│   │   ├── routes
│   │   ├── middleware
│   │   ├── services
│   │   └── utils
│   ├── app.js
│   └── server.js
├── frontend
│   ├── index.html
│   ├── login.html
│   └── dashboard.html
├── .env
└── package.json
```

### Environment variables (`.env`)

```bash
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string_here
MONGO_DB_NAME=ai_study_habit_tracker
JWT_SECRET=supersecretjwtkey_change_me
JWT_EXPIRES_IN=7d
```

### Backend (local)

```bash
npm install
npm run dev
```

The API will run on `http://localhost:5000`.

### Frontend (local)

You can open the `frontend/index.html` file directly in the browser or serve the `frontend` folder with any static file server.

### Deployment overview

- **Backend**: Render / Railway (Node.js app)
  - Set `root` to repository root, start command `npm start`
  - Add environment variables from `.env`
  - Make sure MongoDB Atlas IP allow list allows your hosting provider
- **Frontend**: Vercel / Netlify
  - Deploy the `frontend` directory as a static site
  - Set the backend API URL as needed using environment variables and adjust `API_BASE` in the frontend if you move off same-origin
- **Database**: MongoDB Atlas
  - Create a free cluster, database `ai_study_habit_tracker`
  - Create a user and update `MONGO_URI` with the connection string

