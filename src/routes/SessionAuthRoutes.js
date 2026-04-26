const express = require("express");
const router = express.Router();

router.get("/dashboard", (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Not logged in" });
    }

    res.json({
        message: "Welcome to dashboard",
        user: req.session.user
    });
});

module.exports = router;