const path = require('path');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');
require('dotenv').config();

module.exports = async (req, res) => {
    const { method, url } = req;

    // Route to check authentication and redirect to dashboard or login page
    if (method === 'GET' && url === '/') {
        const cookies = cookie.parse(req.headers.cookie || '');
        const refreshToken = cookies.refreshToken;

        if (!refreshToken) {
            return res.status(200).redirect('/api/login');
        }

        try {
            const user = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            return res.status(200).redirect('/api/home/home');
        } catch (err) {
            return res.status(403).json(err);
        }
    }

    // Route to serve the login page
    if (method === 'GET' && url === '/api/login') {
        return res.status(200).sendFile(path.join(__dirname, '../public/login.html'));
    }

    // Route to serve the dashboard page if authenticated
    if (method === 'GET' && url === '/api/home/home') {
        const cookies = cookie.parse(req.headers.cookie || '');
        const refreshToken = cookies.refreshToken;

        if (!refreshToken) {
            return res.status(200).redirect('/api/login');
        }

        try {
            const user = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            return res.status(200).sendFile(path.join(__dirname, '../public/dashboard.html'));
        } catch (err) {
            return res.status(403).json(err);
        }
    }

    // Route to get the user's email if authenticated
    if (method === 'GET' && url === '/api/default/get-email') {
        const cookies = cookie.parse(req.headers.cookie || '');
        const refreshToken = cookies.refreshToken;

        if (!refreshToken) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        try {
            const user = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            return res.status(200).json({ email: user.email });
        } catch (err) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
    }

    // Fallback for unmatched routes
    return res.status(404).json({ error: 'Not Found' });
};
