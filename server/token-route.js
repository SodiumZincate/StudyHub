const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
require('dotenv').config()
const User = require('../models/user')

let refreshTokens = []

router.get('/create', async (req, res) => {
    const user = await User.findOne({email: req.query.email})
    //here, we create two jwts and send it to the client

    const userPayload = {
        email: user.email,
        __id: user.__id
    }
    const accessToken = jwt.sign(userPayload, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '20s'})
    const refreshToken = jwt.sign(userPayload, process.env.REFRESH_TOKEN_SECRET)
    refreshTokens.push(refreshToken)

    //res.json({accessToken: accessToken, refreshToken: refreshToken})

    res.cookie('accessToken', accessToken, {
        httpOnly: true, //cookie is only accessible by the server
        secure: process.env.NODE_ENV === 'production', //cookie is only sent over HTTPS in production environments
        sameSite: 'strict', //cookie will be sent only with requests originating from the same domain as the one that set the cookie.
        maxAge: 20 * 1000 //lifetime of cookie
    })

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(200).redirect(`/index.html`)
})

module.exports = router