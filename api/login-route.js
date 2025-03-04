const path = require('path');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const User = require('./login/models/user');
const connectDB = require('./login/connect');
require('dotenv').config();

let otp; // Store OTP temporarily for `/verify`
let otpTimer; // For periodic OTP refresh

// Function to generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000);

// Function to send OTP email
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
    otpTimer = setInterval(() => {
        otp = generateOTP();
    }, 60000); // OTP rotates every 60 seconds

    const mailOptions = {
        from: "studyhub552@gmail.com",
        to: email,
        subject: "StudyHub Login OTP",
        text: `Your login OTP for StudyHub is ${otp}. \nIf you did not attempt to sign in, you can safely ignore this email.`,
    };

    await transporter.sendMail(mailOptions);
    res.setHeader('Set-Cookie', cookie.serialize('otp', otp, {
        httpOnly: true,
        secure: false,
        maxAge: 300,
        sameSite: 'strict',
        path: '/'
    }));
};

// JWT token verification (used for protected routes like `/new-account`)
const authenticateToken = (req) => {
    const cookies = cookie.parse(req.headers.cookie || '');
    const verifiedToken = cookies.verifiedToken;

    if (!verifiedToken) {
        return { error: 'Access Denied' };
    }

    try {
        jwt.verify(verifiedToken, process.env.VERIFIED_TOKEN_SECRET);
        return { verified: true };
    } catch (err) {
        return { error: 'Invalid token', details: err.message };
    }
};

// Connect to MongoDB
const connectToDatabase = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed", error);
        process.exit(1);
    }
};

module.exports = async (req, res) => {
    // Establish MongoDB connection when the function is invoked
    await connectToDatabase();

    // Handle different HTTP methods
    if (req.method === 'GET' && req.url.startsWith('/api/login/verify')) {
        const { otp: enteredOtp, email } = req.query;
        const cookies = cookie.parse(req.headers.cookie || '');
        const storedOtp = cookies.otp;

        console.log(`Verifying OTP for ${email}. Entered: ${enteredOtp}, Stored: ${storedOtp}`);

        res.setHeader('Set-Cookie', cookie.serialize('otp', '', {
            httpOnly: true,
            secure: false,
            maxAge: 0, 
            sameSite: 'strict',
            path: '/'
        }));
        
        if (enteredOtp === storedOtp) {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(200).redirect(`/login/new-account?email=${email}`);
            } else {
                return res.status(200).redirect(`/login/verification-success?email=${email}`);
            }
        } else {
            return res.status(200).redirect(`/login/login?verification=fail`);
        }
    } 
    else if (req.method === 'GET' && req.url.startsWith('/api/login/create')) {
        const { email } = req.query;

        try {
            const user = await User.create({ email });
            return res.status(200).redirect(`/login/verification-success?email=${email}`);
        } catch (err) {
            console.error("Failed to create user:", err);
            return res.status(500).send({ error: 'Failed to create user' });
        }
    }
    else if (req.method === 'GET' && req.url.startsWith('/api/login/sendmail')) {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        try {
            await sendOTPEmail(email, res);
            return res.status(200).redirect(`/login/otp?email=${email}`);
        } catch (error) {
            return res.status(500).json({ error: 'Failed to send OTP' });
        }
    } 
    else if (req.method === 'GET' && req.url.startsWith('/api/login/otp')) {
        // Serve OTP HTML page
        return res.status(200).sendFile(path.join(__dirname, '../public/otp.html'));
    }
    else if (req.method === 'GET' && req.url.startsWith('/api/login/new-account')) {
        // Serve new-account HTML page (only accessible with authenticated token)
        const authResult = authenticateToken(req);
        if (authResult.error) {
            return res.status(403).json({ error: 'Access Denied' });
        }
        return res.status(200).sendFile(path.join(__dirname, '../public/new-account.html'));
    }
    else if (req.method === 'GET' && req.url.startsWith('/api/login/verification-success')) {
        // Serve verification-success HTML page (only accessible with authenticated token)
        const authResult = authenticateToken(req);
        if (authResult.error) {
            return res.status(403).json({ error: 'Access Denied' });
        }
        return res.status(200).sendFile(path.join(__dirname, '../public/verification-success.html'));
    }
    else if (req.method === 'POST' && req.url.startsWith('/api/login/create')) {
        // Create user via POST request (authenticated)
        const authResult = authenticateToken(req);
        if (authResult.error) {
            return res.status(403).json({ error: 'Access Denied' });
        }

        try {
            const email = req.body.email;
            const newUser = await User.create({ email: email });
            return res.status(200).redirect(`/login/verification-success?email=${email}`);
        } catch (err) {
            console.log(err);
            return res.status(500).send(err);
        }
    }
    else {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
};
