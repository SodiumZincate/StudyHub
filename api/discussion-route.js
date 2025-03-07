const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const path = require('path')
const fs = require('fs')
const connectDB = require('./login/connect');
require('dotenv').config()

const User = require('./login/models/user')
const Question = require('./login/models/question')
const Answer = require('./login/models/answer')

// MongoDB connection function
const connectToDatabase = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        console.log("MongoDB connected successfully (Discussion Routes)");
    } catch (error) {
        console.error("MongoDB connection failed in home-route:", error);
        process.exit(1); // Exit if DB fails
    }
};

// Helper to parse cookies manually (Vercel doesn't have cookie-parser)
function parseCookies(req) {
    const cookies = {}
    if (req.headers.cookie) {
        req.headers.cookie.split(';').forEach(cookie => {
            const [name, value] = cookie.trim().split('=')
            cookies[name] = value
        })
    }
    return cookies
}

// Authentication middleware for Vercel
async function authenticateToken(req) {
    const cookies = parseCookies(req)
    const accessToken = cookies.accessToken
    if (!accessToken) return { error: 'Access Denied - No Token' }

    try {
        const user = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
        req.email = user.email
        return null // No error, valid token
    } catch (err) {
        return { error: 'Invalid Token' }
    }
}

function RandomString() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 16; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
}

// Helper to serve static HTML file
function serveHtmlFile(res, filePath) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error("Failed to read discussion.html:", err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: "Failed to load page" }));
            return;
        }
        res.setHeader('Content-Type', 'text/html');
        res.end(data);
    });
}

// Handler functions
const getQuestions = async (req) => {
    const page = parseInt(req.query.page) || 1
    const limit = 10
    const skip = (page - 1) * 10

    const questions = await Question.find().sort({ created: -1 }).skip(skip).limit(limit)
    return { status: 200, data: questions }
}

const getYourQuestions = async (req) => {
    const page = parseInt(req.query.page) || 1
    const limit = 10
    const skip = (page - 1) * 10

    const user = await User.findOne({ email: req.email })
    if (!user?.questions?.length) return { status: 200, data: [] }

    const questionIDs = user.questions
    const questions = await Promise.all(questionIDs.map(id => Question.findOne({ id })))
    questions.sort((a, b) => new Date(b.created) - new Date(a.created))
    return { status: 200, data: questions.slice(skip, skip + limit) }
}

const addQuestion = async (req) => {
    const body = req.body
    const questionID = RandomString()

    const question = await Question.create({
        title: body.title,
        value: body.value,
        id: questionID,
        poster: req.email
    })
    await User.findOneAndUpdate({ email: req.email }, { $push: { questions: questionID } })

    return { status: 201, data: { question } }
}

const addAnswer = async (req) => {
    const body = req.body
    const answerID = RandomString()

    const answer = await Answer.create({
        value: body.value,
        id: answerID,
        poster: req.email,
        question: body.questionID
    })

    await Question.findOneAndUpdate({ id: body.questionID }, { $push: { answers: answerID } })
    await User.findOneAndUpdate({ email: req.email }, { $push: { answers: answerID } })

    return { status: 201, data: { answer } }
}

const getAnswersForQuestion = async (req) => {
    const question = await Question.findOne({ id: req.query.questionID })
    if (!question?.answers?.length) return { status: 200, data: [] }

    const answers = await Promise.all(question.answers.map(id => Answer.findOne({ id })))
    answers.sort((a, b) => new Date(b.created) - new Date(a.created))
    return { status: 200, data: answers.slice(0, 10) }
}

const deleteQuestion = async (req) => {
    const question = await Question.findOneAndDelete({ id: req.query.questionID })
    if (!question) return { status: 404, data: { msg: 'Question not found' } }

    await User.findOneAndUpdate({ email: question.poster }, { $pull: { questions: question.id } })
    const answers = await Answer.find({ question: question.id })
    await Answer.deleteMany({ question: question.id })

    await Promise.all(answers.map(answer =>
        User.findOneAndUpdate({ email: answer.poster }, { $pull: { answers: answer.id } })
    ))

    return { status: 200, data: { deleted: true } }
}

const searchQuestions = async (req) => {
    const questions = await Question.find({ title: { $regex: req.query.item, $options: 'i' } })
    questions.sort((a, b) => new Date(b.created) - new Date(a.created))
    return { status: 200, data: questions.slice(0, 30) }
}

// Main handler for Vercel
module.exports = async (req, res) => {
    // Connect to the database
    await connectToDatabase();

    const { pathname, searchParams } = new URL(req.url, `http://${req.headers.host}`);
	req.query = Object.fromEntries(searchParams);

	// Special case to serve discussion.html for /api/discussion
	if (pathname === '/api/discussion' && req.method === 'GET') {
		const authError = await authenticateToken(req);
		if (authError) {
			res.statusCode = 403;
			return res.end(JSON.stringify(authError));
		}

		const filePath = path.join(__dirname, '../public/discussion.html');
		return serveHtmlFile(res, filePath);
	}
	if (pathname === '/api/discussion/answer' && req.method === 'GET') {
		const authError = await authenticateToken(req);
		if (authError) {
			res.statusCode = 403;
			return res.end(JSON.stringify(authError));
		}

		const filePath = path.join(__dirname, '../public/discussion.html');
		return serveHtmlFile(res, filePath);
	}
	if (pathname === '/api/discussion/ask' && req.method === 'GET') {
		const authError = await authenticateToken(req);
		if (authError) {
			res.statusCode = 403;
			return res.end(JSON.stringify(authError));
		}

		const filePath = path.join(__dirname, '../public/ask.html');
		return serveHtmlFile(res, filePath);
	}

	// Auth check for protected API routes
	const protectedRoutes = [
		'/api/discussion/get-questions',
		'/api/discussion/get-your-questions',
		'/api/discussion/add-question',
		'/api/discussion/add-answer',
		'/api/discussion/get-a-for-q',
		'/api/discussion/delete-question',
		'/api/discussion/search'
	];

	// Use `some()` to allow for query params and flexible matching
	if (protectedRoutes.some(route => pathname.startsWith(route))) {
		const authError = await authenticateToken(req);
		if (authError) {
			res.statusCode = 403;
			return res.end(JSON.stringify(authError));
		}
	}

	try {
		let response = {};

		if (pathname.startsWith('/api/discussion/get-questions') && req.method === 'GET') {
			response = await getQuestions(req);
		} else if (pathname.startsWith('/api/discussion/get-your-questions') && req.method === 'GET') {
			response = await getYourQuestions(req);
		} else if (pathname.startsWith('/api/discussion/add-question') && req.method === 'POST') {
			response = await addQuestion(req);
		} else if (pathname.startsWith('/api/discussion/add-answer') && req.method === 'POST') {
			response = await addAnswer(req);
		} else if (pathname.startsWith('/api/discussion/get-a-for-q') && req.method === 'GET') {
			response = await getAnswersForQuestion(req);
		} else if (pathname.startsWith('/api/discussion/delete-question') && req.method === 'DELETE') {
			response = await deleteQuestion(req);
		} else if (pathname.startsWith('/api/discussion/search') && req.method === 'GET') {
			response = await searchQuestions(req);
		} else {
			res.statusCode = 404;
			return res.end(JSON.stringify({ error: 'Route not found' }));
		}
		res.statusCode = response.status;
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify(response.data));
	} catch (err) {
		console.error(err);
		res.statusCode = 500;
		res.end(JSON.stringify({ error: 'Internal Server Error' }));
	}
};