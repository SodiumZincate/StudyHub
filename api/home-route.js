const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');
require('dotenv').config();
const User = require('./login/models/user');
const connectDB = require('./login/connect');

// MongoDB connection function
const connectToDatabase = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        console.log("MongoDB connected successfully (Home Routes)");
    } catch (error) {
        console.error("MongoDB connection failed in home-route:", error);
        process.exit(1); // Exit if DB fails
    }
};

// Middleware for authentication using accessToken cookie
const authenticateToken = (req, res, next) => {
    const cookies = cookie.parse(req.headers.cookie || '');
    const accessToken = cookies.accessToken;

    if (!accessToken) {
        return res.status(403).json({ error: "Access Denied", msg: "Access Token not found" });
    }

    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            console.error("JWT verification failed:", err);
            return res.status(403).json({ error: "Invalid Token", details: err.message });
        }
        req.email = user.email;
        next();
    });
};

// Function to serve HTML files by reading them from the filesystem
const serveHtmlFile = (res, filePath) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading file:", err);
            return res.status(500).json({ error: "Failed to read HTML file" });
        }
        res.setHeader('Content-Type', 'text/html');
        res.send(data);
    });
};

// Handlers for each route
const personalDetailsForm = async (req, res) => {
    const filePath = path.join(__dirname, '../public/user-details.html');
    serveHtmlFile(res, filePath);
};

const updatePersonalDetails = async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { email: req.email },
            {
                $set: {
                    f_name: req.body.fname,
                    l_name: req.body.lname,
                    course: req.body.course,
                    batch: req.body.batch
                }
            },
            { new: true }
        );
        console.log(`User data updated successfully for ${req.email}`, user);
        res.json(user);
    } catch (err) {
        console.error("Failed to update user data:", err);
        res.status(500).json({ error: "Failed to update user data" });
    }
};

const getUserData = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.email });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({
            fname: user.f_name,
            lname: user.l_name,
            course: user.course,
            batch: user.batch
        });
    } catch (err) {
        console.error("Failed to fetch user data:", err);
        res.status(500).json({ error: "Failed to fetch user data" });
    }
};

const todoListPage = async (req, res) => {
    const filePath = path.join(__dirname, '../public/todo.html');
    serveHtmlFile(res, filePath);
};

const discussionPage = async (req, res) => {
    const filePath = path.join(__dirname, '../public/discussion.html');
    serveHtmlFile(res, filePath);
};

const homePage = async (req, res) => {
    const filePath = path.join(__dirname, '../public/index.html');
    serveHtmlFile(res, filePath);
};

const resourcesPage = async (req, res) => {
    const filePath = path.join(__dirname, '../public/resources.html');
    serveHtmlFile(res, filePath);
};

const noticesPage = async (req, res) => {
    const filePath = path.join(__dirname, '../public/notices.html');
    serveHtmlFile(res, filePath);
};

const facultiesPage = async (req, res) => {
    const filePath = path.join(__dirname, '../public/faculties.html');
    serveHtmlFile(res, filePath);
};

const contactPage = async (req, res) => {
    const filePath = path.join(__dirname, '../public/contact.html');
    serveHtmlFile(res, filePath);
};

// Main handler function for Vercel (serverless function)
module.exports = async (req, res) => {
    // Connect to the database
    await connectToDatabase();

    // Route handling
    if (req.method === 'GET') {
        switch (req.url) {
            case '/api/home/personal-details':
                return personalDetailsForm(req, res);
            case '/api/home/user-data':
                return getUserData(req, res);
            case '/api/home/todo-list':
                return todoListPage(req, res);
            case '/api/home/discussion':
                return discussionPage(req, res);
            case '/api/home/home':
                return homePage(req, res);
            case '/api/home/resources':
                return resourcesPage(req, res);
            case '/api/home/notices':
                return noticesPage(req, res);
            case '/api/home/faculties':
                return facultiesPage(req, res);
            case '/api/home/contact':
                return contactPage(req, res);
            default:
                return res.status(404).send('Route not found');
        }
    } else if (req.method === 'POST') {
        switch (req.url) {
            case '/api/home/personal-details':
                return updatePersonalDetails(req, res);
            default:
                return res.status(404).send('Route not found');
        }
    } else {
        return res.status(405).send('Method Not Allowed');
    }
};
