const mongoose = require('mongoose')

const urlSchema = new mongoose.Schema({

    urlCode: {
        type: String,
        unique: true,
        trim: true
    },

    longUrl: {
        type: String,
        required: "Long URL is required",
        trim: true
    },

    shortUrl: {
        type: String,
        required: true,
        unique: true
    },

}, { timestamps: true })

module.exports = mongoose.model('url', urlSchema)