const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const path = require('path')
require('dotenv').config()
const User = require('../models/user')

router.post('/create', async (req, res) => {
    const verifiedToken = req.cookies.verifiedToken
    if (!verifiedToken) return res.status(200).json({msg: "Access Denied"});
    else {
        jwt.verify(verifiedToken, process.env.VERIFIED_TOKEN_SECRET, async (err, user) => {
            if (err) return res.status(403).json(err)
            const email = req.body.email
            const newUser = await User.findOne({email: email})
            //here, we create two jwts and send it to the client
        
            const userPayload = {
                email: email,
                id: user.id
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
            return res.status(200).redirect(`/dashboard?email=${email}`)
        })
    }
})

router.post('/refresh', (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken == null) return res.sendStatus(401)

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

router.delete('/logout', (req, res) => {
    const accessToken = req.cookies.accessToken
    const refreshToken = req.cookies.refreshToken

    if(!accessToken || !refreshToken) return res.status(400).json({msg: "Token(s) missing"})
    
    res.cookie('accessToken', '', {
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: new Date(0) 
    });
    res.cookie('refreshToken', '', {
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: new Date(0) 
    });
    return res.status(200).json({redirectUrl: `/login`})
})

module.exports = router