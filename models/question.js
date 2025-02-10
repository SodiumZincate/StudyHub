const mongoose = require('mongoose')

const questionSchema = new mongoose.Schema({
    value: String,
    answers: Array
})

module.exports = mongoose.model('Question', questionSchema)
