const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    subject: String,
    duration: Number, // in minutes
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Session", sessionSchema);