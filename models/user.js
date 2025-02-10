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

module.exports = mongoose.model('User', userSchema)