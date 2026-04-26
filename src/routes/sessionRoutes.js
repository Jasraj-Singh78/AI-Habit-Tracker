const express = require("express");
const router = express.Router();

const { 
  createSession, 
  getSessions, 
  getAnalytics, 
  getStreak, 
  getRecommendation 
} = require("../controllers/sessionController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createSession);
router.get("/", authMiddleware, getSessions);

module.exports = router;
router.get("/analytics", authMiddleware, getAnalytics);
router.get("/streak", authMiddleware, getStreak);
router.get("/recommendation", authMiddleware, getRecommendation);