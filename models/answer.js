const mongoose = require('mongoose')

const answerSchema = new mongoose.Schema({
    value: String,
    question: String
})

module.exports = mongoose.model('Answer', answerSchema)