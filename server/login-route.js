const express = require('express')
const router = express.Router()
const path = require('path')
const nodemailer = require('nodemailer')
const User = require('../models/user')

let otp;

router.get('/sendmail', (req, res) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        secure: true,
        port: 465,
        auth: {
            user: "studyhub552@gmail.com",
            pass: "qdwt cnwi badi pjok"
        }
    })

    otp = generateOTP()
    setInterval(() => {otp = generateOTP()}, 60000)
    const mailOptions = {
        from: "studyhub552@gmail.com",
        to: req.query.email,
        subject: "StudyHub login OTP",
        text:  `Your login OTP for StudyHub is ${otp} \nIf you did not attempt to sign in, you can safely ignore this email.`
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if(error) {
            console.log(error)
            return res.status(500).send({error})
        }
        else {
            res.redirect(`/login/otp?email=${req.query.email}`)
        }
    })
})

router.get('/otp', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/otp.html'));
})

const generateOTP = function() { return Math.floor(Math.random() * 1000000) }

router.get('/verify', async (req, res) => {
    if (req.query.otp == otp) {
        const user = await User.findOne({email: req.query.email})
        if(!user) {
            res.status(200).redirect(`/login/new-account?email=${req.query.email}`)
        }
        else {
            res.status(200).redirect(`/login/verification-success?email=${req.query.email}`)
        }
    }
    else {
        res.status(200).redirect(`/login/login?verification=fail`)
    }
})

router.get('/new-account', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/new-account.html'));
})

router.get('/verification-success', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/verification-success.html'));
})

router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
})

router.post('/create', async (req, res) => {
    try {
        const email = req.body.email
        const user = await User.create({email: email})
        res.status(200).redirect(`/login/verification-success?email=${email}`)
    }
    catch(err) {
        console.log(err)
        res.status(500).send(err)
    }
})

module.exports = router