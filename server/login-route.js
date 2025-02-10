const express = require('express')
const router = express.Router()

const nodemailer = require('nodemailer')

const User = require('../models/user')

let otp;

router.get('/', (req, res) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        secure: true,
        port: 465,
        auth: {
            user: "studyhub552@gmail.com",
            pass: "ntbo yxbk tsyu hzqq"
        }
    })

    otp = generateOTP()
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
            res.status(200).redirect(`/otp.html?email=${req.query.email}`)
        }
    })
})

const generateOTP = function() { return Math.floor(Math.random() * 1000000) }

router.get('/verify', async (req, res) => {
    if (req.query.otp == otp) {
        const user = await User.findOne({email: req.query.email})
        if(!user) {
            res.status(200).redirect(`/new-account.html?email=${req.query.email}`)
        }
        else {
            res.status(200).redirect(`/verification-success.html?email=${req.query.email}`)
        }
    }
    else {
        otp = generateOTP()
        res.status(200).redirect(`/login.html?verification=fail`)
    }
})

router.post('/create', async (req, res) => {
    try {
        const email = req.body.email
        const user = await User.create({email: email})
        res.status(200).json({user})
    }
    catch(err) {
        console.log(err)
        res.status(500).send(err)
    }
})

router.get('/fetch', async (req, res) => {
    const user = await User.findOne({email: req.query.email})
    res.status(200).redirect(`/index.html?email=${req.query.email}`)
})

module.exports = router