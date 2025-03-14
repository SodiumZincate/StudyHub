const jwt = require('jsonwebtoken');
const User = require('./login/models/user');
const cookie = require('cookie');
const connectDB = require('./login/connect');
require('dotenv').config();

// Create User (POST)
const createUser = async (req, res) => {
    const cookies = cookie.parse(req.headers.cookie || '');
    const verifiedToken = cookies.verifiedToken;
    if (!verifiedToken) {
        return res.status(200).json({
            error: "Verification expired.",
            msg: "Verification expired. 10 seconds exceeded since last verified."
        });
    } else {
        jwt.verify(verifiedToken, process.env.VERIFIED_TOKEN_SECRET, async (err, user) => {
            if (err) return res.status(403).json(err);

            const email = req.body.email;
            const newUser = await User.findOne({ email: email });

            // Create two JWTs and send to the client
            const userPayload = { email: email, id: user.id };
            const accessToken = jwt.sign(userPayload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30s' });
            const refreshToken = jwt.sign(userPayload, process.env.REFRESH_TOKEN_SECRET);

            // Set cookies for the tokens using Set-Cookie header
            res.setHeader('Set-Cookie', [
                cookie.serialize('accessToken', accessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'Strict',
                    maxAge: 30 * 1000,
                    path: '/'
                }),
                cookie.serialize('refreshToken', refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'Strict',
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                    path: '/'
                })
            ]);

            return res.writeHead(302, { Location: '/api/home/home' }).end();
        });
    }
};

// Refresh access token (POST)
const refreshAccessToken = async (req, res) => {
    const cookies = cookie.parse(req.headers.cookie || '');
    const refreshToken = cookies.refreshToken;
    if (!refreshToken) return res.status(401);

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).json(err);

        const userPayload = { email: user.email, id: user.id };
        const accessToken = jwt.sign(userPayload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30s' });

        res.setHeader('Set-Cookie', cookie.serialize('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 30 * 1000,
            path: '/'
        }));

        res.status(200).send("Access token refreshed successfully");
    });
};

module.exports = async (req, res) => {
	await connectDB(process.env.MONGO_URI);

    if (req.method === 'POST' && req.url === '/api/token/create') {
        await createUser(req, res);
    } else if (req.method === 'POST' && req.url === '/api/token/refresh') {
        await refreshAccessToken(req, res);
    } else {
        res.status(405).send('Method Not Allowed');
    }
};
