const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
require('dotenv').config()
const User = require('../models/user')

router.post('/create', async (req, res) => {
    const email = req.body.email
    const user = await User.findOne({email: email})
    //here, we create two jwts and send it to the client

    const userPayload = {
        email: user.email,
        __id: user.__id
    }
    const accessToken = jwt.sign(userPayload, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '20s'})
    const refreshToken = jwt.sign(userPayload, process.env.REFRESH_TOKEN_SECRET)

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
    return res.status(200).json({ redirectUrl: `/index.html?email=${user.email}` });
})

router.post('/refresh', (req, res) => {
    const refreshToken = req.body.token
    if (refreshToken == null) return res.sendStatus(401)
    if (! refreshTokens.includes(refreshToken)) return res.sendStatus(403)

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if(err) return res.sendStatus(403)
        const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '20s'}) 
        res.cookie('accessToken', accessToken, {
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict', 
            maxAge: 20 * 1000 
        })
        res.status(200).send("Access token refreshed successfully");
    })
})

module.exports = router