const path = require('path');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');
require('dotenv').config();

// Authentication function
const authenticateToken = (req) => {
    const cookies = cookie.parse(req.headers.cookie || '');
    const refreshToken = cookies.refreshToken;

    if (!refreshToken) {
        return { error: 'No token', redirect: '/api/login' };
    }

    try {
        const user = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        return { user };
    } catch (err) {
        return { error: 'Invalid token', details: err.message };
    }
};

// Serve HTML files dynamically based on the route
const serveHtml = (res, filePath) => {
    return res.status(200).sendFile(path.join(__dirname, filePath));
};

module.exports = async (req, res) => {
    const { method, url } = req;

    // Check for authentication
    const authResult = authenticateToken(req);
    const isAuthenticated = !authResult.error;
    const user = authResult.user;

    // Redirect to login if not authenticated
    if (!isAuthenticated && url !== '/api/login') {
        return res.status(200).redirect(authResult.redirect); // Redirect to login page
    }

    // Handle specific routes
    if (method === 'GET' && url === '/') {
        // Redirect to index if authenticated, else to login
        if (isAuthenticated) {
            return res.status(200).redirect('/api/home/home'); // Redirect to home page if authenticated
        } else {
            return serveHtml(res, '/public/login.html'); // Serve login page if not authenticated
        }
    }

    if (method === 'GET' && url === '/api/login') {
        return serveHtml(res, '/public/login.html'); // Serve login page
    }

    if (method === 'GET' && url === '/index') {
        return serveHtml(res, '/public/index.html'); // Serve index page
    }

    if (method === 'GET' && url === '/get-email') {
        if (isAuthenticated) {
            return res.status(200).json({ email: user.email }); // Return email if authenticated
        } else {
            return res.status(403).json({ error: 'Unauthorized' }); // Return error if not authenticated
        }
    }

    return res.status(404).json({ error: 'Not Found' });  // Handle unknown routes
};
