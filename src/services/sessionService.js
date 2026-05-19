const Session = require("../models/Session");

exports.createSession = async (data) => {
    return await Session.create(data);
};

exports.getUserSessions = async (userId) => {
    return await Session.find({ user: userId });
};