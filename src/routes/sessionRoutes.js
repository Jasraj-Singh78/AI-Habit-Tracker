const express = require("express");
const router = express.Router();

const {
  createSession,
  getSessions,
  getAnalytics,
  getStreak,
  getRecommendation
} = require("../controllers/sessionController");
const path = require("path");

const sessionAuth = require(
    path.join(__dirname, "../middleware/sessionAuth.js")
);

// ROUTES (SESSION BASED)
router.post("/", sessionAuth, createSession);
router.get("/", sessionAuth, getSessions);
router.get("/analytics", sessionAuth, getAnalytics);
router.get("/streak", sessionAuth, getStreak);
router.get("/recommendation", sessionAuth, getRecommendation);

module.exports = router;