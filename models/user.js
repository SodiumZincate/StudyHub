const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        maxlength: [25, 'Name cannot be more than 20 characters']
    },
    email: {
        type: String,
        required: [true, 'Must provide an email'],
        trim: true
    },
    questions: Array,
    answers: Array
})

const questionSchema = new mongoose.Schema({
    value: String,
    answers: Array
})

const answerSchema = new mongoose.Schema({
    value: String,
    question: String
})

module.exports = mongoose.model('user', userSchema)
module.exports = mongoose.model('question', questionSchema)