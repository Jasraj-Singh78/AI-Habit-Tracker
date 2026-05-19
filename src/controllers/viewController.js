const User = require("../models/User");
const bcrypt = require("bcryptjs");
const sessionService = require("../services/sessionService");

exports.loginPage = (req, res) => res.render("login");
exports.signupPage = (req, res) => res.render("signup");

exports.registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hash });
    res.redirect("/login");
};

exports.loginUser = async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.send("User not found");

    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) return res.send("Wrong password");

    req.session.user = { id: user._id, name: user.name };
    res.redirect("/dashboard");
};

exports.dashboardPage = async (req, res) => {
    const sessions = await sessionService.getUserSessions(req.session.user.id);

    const total = sessions.reduce((s, x) => s + x.duration, 0);

    res.render("dashboard", {
        user: req.session.user,
        sessions,
        totalTime: total,
        sessionsCount: sessions.length,
        recommendation: total < 60 ? "Increase study time" : "Good progress"
    });
};

exports.analyticsPage = async (req, res) => {
    const sessions = await sessionService.getUserSessions(req.session.user.id);
    res.render("analytics", { sessions });
};

exports.historyPage = async (req, res) => {
    const sessions = await sessionService.getUserSessions(req.session.user.id);
    res.render("history", { sessions });
};

exports.profilePage = (req, res) => {
    res.render("profile", { user: req.session.user });
};

exports.addSession = async (req, res) => {
    await sessionService.createSession({
        user: req.session.user.id,
        subject: req.body.subject,
        duration: Number(req.body.duration)
    });

    global.io.emit("sessionAdded", { msg: "New session added" });

    res.redirect("/dashboard");
};

exports.logoutUser = (req, res) => {
    req.session.destroy(() => res.redirect("/login"));
};