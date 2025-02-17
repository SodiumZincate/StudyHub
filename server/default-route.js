const path = require('path');
const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
require('dotenv').config()

const authenticateToken = function(req, res, next) {
    setTimeout(() => {
        const refreshToken = req.cookies.refreshToken
        if (!refreshToken) return res.status(200).redirect('/login');
        else {
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
                if (err) return res.status(403).json(err)
                req.user = user
                next()
            })
        }
    }, 0)
}

router.get('/', authenticateToken, (req, res) => {
    res.status(200).redirect(`/dashboard?email=${req.user.email}`);
})

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
})

router.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/dashboard.html'));
})

module.exports = router