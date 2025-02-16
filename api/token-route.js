const jwt = require('jsonwebtoken');
const User = require('./login/models/user');

const connectDB = require('./login/connect');
require('dotenv').config();
console.log(process.env); // This will log all the environment variables loaded from .env

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

const setCookie = (res, name, value, options = {}) => {
    const cookie = `${name}=${value}; Path=/; HttpOnly; SameSite=Strict; ${options.maxAge ? `Max-Age=${options.maxAge}` : ''}`;
    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Set-Cookie', cookie + '; Secure');
    } else {
        res.setHeader('Set-Cookie', cookie);
    }
};

module.exports = async (req, res) => {
    // Handle DB connection
	await connectToDatabase();

	console.log('ACCESS_TOKEN_SECRET:', process.env.ACCESS_TOKEN_SECRET);
	console.log('REFRESH_TOKEN_SECRET:', process.env.REFRESH_TOKEN_SECRET);

    // GET /create (Handle JWT creation and sending them via cookies)
    if (req.method === 'GET' && req.url.startsWith('/api/token/create')) {
        try {
            const { email } = req.query;
            const user = await User.findOne({ email });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Create the payload for JWT tokens
            const userPayload = { email: user.email, __id: user.__id };

            // Generate access and refresh tokens
            const accessToken = jwt.sign(userPayload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '20s' });
            const refreshToken = jwt.sign(userPayload, process.env.REFRESH_TOKEN_SECRET);

            // Set cookies with JWT tokens
            setCookie(res, 'accessToken', accessToken, { maxAge: 20 * 1000 });
            setCookie(res, 'refreshToken', refreshToken, { maxAge: 7 * 24 * 60 * 60 * 1000 });

            // Redirect or respond with success
            // After successfully generating tokens
			return res.redirect(`/index.html?email=${user.email}`);
        } catch (err) {
            console.error('Error in /create route:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    // POST /refresh (Handle refresh token and access token refresh)
    else if (req.method === 'POST' && req.url === '/api/token/refresh') {
        try {
            const { token: refreshToken } = req.body;
            if (!refreshToken) return res.sendStatus(401);

            // Verify the refresh token
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
                if (err) return res.sendStatus(403);

                const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '20s' });

                res.cookie('accessToken', accessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'development',
                    sameSite: 'strict',
                    maxAge: 20 * 1000,
                });

                return res.status(200).send('Access token refreshed successfully');
            });
        } catch (err) {
            console.error('Error in /refresh route:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Handle unsupported HTTP methods
    else {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
};
