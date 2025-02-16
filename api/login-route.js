const nodemailer = require('nodemailer');
const User = require('./login/models/user');  
const cookie = require('cookie');

const connectDB = require('./login/connect');
require('dotenv').config(); 

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit OTP
};

const sendOTPEmail = async (email, res) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            secure: true,
            port: 465,
            auth: {
                user: "studyhub552@gmail.com",
                pass: "ntbo yxbk tsyu hzqq"
            },
        });

        const otp = generateOTP();
        const mailOptions = {
            from: "studyhub552@gmail.com",
            to: email,
            subject: "StudyHub Login OTP",
            text: `Your login OTP for StudyHub is ${otp}. \nIf you did not attempt to sign in, you can safely ignore this email.`,
        };

        await transporter.sendMail(mailOptions);

        // Store OTP in HTTP-only cookie (expires in 5 minutes)
        res.setHeader('Set-Cookie', cookie.serialize('otp', otp, {
            httpOnly: true,
            secure: false,
            maxAge: 300, // 5 minutes
            sameSite: 'strict',
            path: '/'
        }));

        console.log(`OTP sent to ${email}: ${otp}`);

    } catch (error) {
        console.error("Error sending OTP email:", error);
        throw new Error('Failed to send OTP email');
    }
};

// MongoDB connection inside async function
const connectToDatabase = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed", error);
        process.exit(1); // Exit the process on failure
    }
};

module.exports = async (req, res) => {
	// Establish MongoDB connection when the function is invoked
	await connectToDatabase();

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
            // Clear OTP cookie after successful verification
            const user = await User.findOne({ email });
			
            if (!user) {
				console.log("User not found, redirecting to new account creation.");
                return res.status(200).redirect(`/new-account.html?email=${email}`);
            } else {
				console.log("User found, redirecting to verification success.");
                return res.status(200).redirect(`/verification-success.html?email=${email}`);
            }
        } else {
			console.log("Incorrect OTP entered.");
            return res.status(200).redirect(`/login.html?verification=fail`);
        }
    } 
	else if (req.method === 'GET' && req.url === '/api/login/create') {
		const { email } = req.body;

		try {
			const user = await User.create({ email });
			return res.status(200).redirect(`/verification-success.html?email=${email}`);
		} catch (err) {
			console.error("Failed to create user:", err);
			return res.status(500).send({ error: 'Failed to create user' });
		}
	}
    else if (req.method === 'GET') {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        try {
            await sendOTPEmail(email, res);
            return res.status(200).redirect(`/otp.html?email=${email}`);
        } catch (error) {
            console.error("Failed to send OTP:", error);
            return res.status(500).json({ error: 'Failed to send OTP' });
        }
    } 
	else {
		return res.status(405).json({ error: 'Method Not Allowed' });
	}
};