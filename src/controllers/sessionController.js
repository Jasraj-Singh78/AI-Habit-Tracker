const Session = require("../models/Session");

// CREATE SESSION
exports.createSession = async (req, res) => {
    try {
        const { subject, duration } = req.body;

        const session = await Session.create({
            user: req.user.id,
            subject,
            duration
        });

        res.status(201).json(session);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET USER SESSIONS
exports.getSessions = async (req, res) => {
    try {
        const sessions = await Session.find({ user: req.user.id });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};  
exports.getAnalytics = async (req, res) => {
    try {
        const sessions = await Session.find({ user: req.user.id });

        const totalSessions = sessions.length;

        const totalDuration = sessions.reduce((sum, session) => {
            return sum + session.duration;
        }, 0);

        res.json({
            totalSessions,
            totalDuration
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getStreak = async (req, res) => {
    try {
        const sessions = await Session.find({ user: req.user.id }).sort({ date: -1 });

        if (sessions.length === 0) {
            return res.json({ streak: 0 });
        }

        let streak = 1;

        for (let i = 0; i < sessions.length - 1; i++) {
            const current = new Date(sessions[i].date);
            const next = new Date(sessions[i + 1].date);

            const diff = Math.floor((current - next) / (1000 * 60 * 60 * 24));

            if (diff === 1) {
                streak++;
            } else if (diff > 1) {
                break;
            }
        }

        res.json({ streak });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getRecommendation = async (req, res) => {
    try {
        const sessions = await Session.find({ user: req.user.id });

        const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);

        const streakData = sessions.sort((a, b) => new Date(b.date) - new Date(a.date));

        let streak = 1;
        for (let i = 0; i < streakData.length - 1; i++) {
            const diff = Math.floor(
                (new Date(streakData[i].date) - new Date(streakData[i + 1].date)) 
                / (1000 * 60 * 60 * 24)
            );

            if (diff === 1) streak++;
            else break;
        }

        let message = "";

        if (totalDuration < 60) {
            message = "You should increase your daily study time.";
        } else if (streak < 2) {
            message = "Try to maintain consistency in your study routine.";
        } else if (totalDuration > 120) {
            message = "Great job! You are highly productive.";
        } else {
            message = "Your study habits look balanced. Keep going!";
        }

        res.json({
            totalDuration,
            streak,
            recommendation: message
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};