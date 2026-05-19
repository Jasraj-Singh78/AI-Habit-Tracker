const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true // minutes
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Session", sessionSchema);