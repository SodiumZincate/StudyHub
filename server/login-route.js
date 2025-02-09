const express = require('express')
const router = express.Router()

const nodemailer = require('nodemailer')

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

router.get('/verify', (req, res) => {
    if (req.query.otp == otp) {
        res.status(200).send('success')
    }
    else {
        otp = generateOTP()
        res.status(200).send('fail')
    }
})

const generateOTP = function() { return Math.floor(Math.random() * 1000000) }

module.exports = router