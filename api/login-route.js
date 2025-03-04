const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const User = require('./login/models/user');
const connectDB = require('./login/connect');
require('dotenv').config();

let otp;
let otpTimer;

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000);

// Send OTP email and set cookie
const sendOTPEmail = async (email, res) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        secure: true,
        port: 465,
        auth: {
			user: "studyhub552@gmail.com",
            pass: "qdwt cnwi badi pjok"
        },
    });

    otp = generateOTP();
    if (otpTimer) clearInterval(otpTimer);
    otpTimer = setInterval(() => { otp = generateOTP(); }, 60000);

    const mailOptions = {
        from: "studyhub552@gmail.com",
		to: email,
        subject: "StudyHub Login OTP",
        text: `Your OTP for StudyHub login is ${otp}.`,
    };

    await transporter.sendMail(mailOptions);

    res.setHeader('Set-Cookie', cookie.serialize('otp', otp, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60,
        sameSite: 'strict',
        path: '/',
    }));
};

// Verify token middleware
const authenticateToken = (req, res, next) => {
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.verifiedToken;

    if (!token) return res.status(403).json({ error: 'Access Denied' });

    jwt.verify(token, process.env.VERIFIED_TOKEN_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = decoded;
        next();
    });
};

// Serve static HTML file
const serveHtmlFile = (res, filePath) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Failed to load page' });
        res.setHeader('Content-Type', 'text/html');
        res.end(data);
    });
};

module.exports = async (req, res) => {
    await connectDB(process.env.MONGO_URI);

    if (req.method === 'GET' && req.url.startsWith('/api/login/verify')) {
        const { otp: enteredOtp, email } = req.query;
        const cookies = cookie.parse(req.headers.cookie || '');
        const storedOtp = cookies.otp;

        res.setHeader('Set-Cookie', cookie.serialize('otp', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 0,
            sameSite: 'strict',
            path: '/',
        }));

        if (enteredOtp === storedOtp) {
            const token = jwt.sign({ verified: true }, process.env.VERIFIED_TOKEN_SECRET, { expiresIn: '10s' });

            res.setHeader('Set-Cookie', cookie.serialize('verifiedToken', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 10,
                path: '/',
            }));

            const user = await User.findOne({ email });
            if (user) {
                return res.writeHead(302, { Location: `/api/login/verification-success?email=${email}` }).end();
            } else {
                return res.writeHead(302, { Location: `/api/login/new-account?email=${email}` }).end();
            }
        } else {
            return res.writeHead(302, { Location: `/api/login/login?verification=fail` }).end();
        }
    }

    if (req.method === 'GET' && req.url.startsWith('/api/login/sendmail')) {
        const { email } = req.query;
        if (!email) return res.status(400).json({ error: 'Email required' });

        try {
            await sendOTPEmail(email, res);
            return res.writeHead(302, { Location: `/api/login/otp?email=${email}` }).end();
        } catch (error) {
            return res.status(500).json({ error: 'Failed to send OTP' });
        }
    }

    if (req.method === 'GET' && req.url.startsWith('/api/login/otp')) {
        return serveHtmlFile(res, path.join(__dirname, '../public/otp.html'));
    }

    if (req.method === 'GET' && req.url.startsWith('/api/login/new-account')) {
        return authenticateToken(req, res, () => {
            serveHtmlFile(res, path.join(__dirname, '../public/new-account.html'));
        });
    }

    if (req.method === 'GET' && req.url.startsWith('/api/login/verification-success')) {
        return authenticateToken(req, res, () => {
            serveHtmlFile(res, path.join(__dirname, '../public/verification-success.html'));
        });
    }

    if (req.method === 'POST' && req.url.startsWith('/api/login/create')) {
        return authenticateToken(req, res, async () => {
            try {
                const { email } = req.body;
                await User.create({ email });
                return res.writeHead(302, { Location: `/api/login/verification-success?email=${email}` }).end();
            } catch (err) {
                return res.status(500).json({ error: 'Failed to create user' });
            }
        });
    }

    if (req.method === 'GET' && req.url.startsWith('/api/login')) {
        return serveHtmlFile(res, path.join(__dirname, '../public/login.html'));
    }

    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
};
