const express = require("express");
const router = express.Router();

const controller = require("../controllers/viewController");
const auth = require("../middleware/auth");

router.get("/", (req, res) => {
    if (req.session.user) return res.redirect("/dashboard");
    res.redirect("/login");
});

router.get("/login", controller.loginPage);
router.get("/signup", controller.signupPage);

router.get("/dashboard", auth, controller.dashboardPage);
router.get("/analytics", auth, controller.analyticsPage);
router.get("/history", auth, controller.historyPage);
router.get("/profile", auth, controller.profilePage);
router.get("/logout", controller.logoutUser);

router.post("/login", controller.loginUser);
router.post("/signup", controller.registerUser);
router.post("/add-session", controller.addSession);

module.exports = router;