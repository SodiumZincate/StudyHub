const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
require('dotenv').config()

const authenticateToken = function(req, res, next) {
    setTimeout(() => {
        const accessToken = req.cookies.accessToken
        if (!accessToken) return res.status(200).redirect('/login.html');
        
    }, 100)
}

router.get('/', authenticateToken, (req, res) => {
    
})

module.exports = router