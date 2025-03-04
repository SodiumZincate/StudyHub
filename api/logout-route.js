const cookie = require('cookie');
require('dotenv').config();

module.exports = async (req, res) => {
    if (req.method === 'DELETE') {
        // Extract accessToken and refreshToken from cookies
        const cookies = cookie.parse(req.headers.cookie || '');
        const accessToken = cookies.accessToken;
        const refreshToken = cookies.refreshToken;

        // Check if both tokens exist
        if (!accessToken || !refreshToken) {
            return res.status(400).json({ msg: "Token(s) missing" });
        }

        // Clear the cookies by setting the expiration date to the past
        res.setHeader('Set-Cookie', [
            cookie.serialize('accessToken', '', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                expires: new Date(0)
            }),
            cookie.serialize('refreshToken', '', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                expires: new Date(0)
            })
        ]);

        // Respond with a success message and redirect URL
        return res.status(200).json({ redirectUrl: `/api/login` });
    }

    // Handle unsupported methods (only DELETE is allowed)
    return res.status(405).json({ error: 'Method Not Allowed' });
};
