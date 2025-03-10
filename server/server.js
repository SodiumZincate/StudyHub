const fs = require('fs');
const express = require('express');
const cookieParser = require('cookie-parser')
const path = require('path');

const app = express();

app.use('/styles', express.static(path.join(__dirname, '../public/styles')));
app.use('/scripts', express.static(path.join(__dirname, '../public/scripts')));;
app.use('/images', express.static(path.join(__dirname, '../images')));
// app.use(express.static(path.join(__dirname, '../resources')));

app.use(express.json());
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())

// Route to handle search queries
app.get('/home/search', (req, res) => {
	const searchQuery = req.query.item;
	const basePath = path.join(__dirname, '../resources/');
  
	console.log('User searched for:', searchQuery);
  
	if (!searchQuery) {
	  return res.send('Please provide a search query.');
	}
  
	const findTarget = (dir, query) => {
	  const items = fs.readdirSync(dir);
  
	  for (const item of items) {
		const fullPath = path.join(dir, item);
		const isDirectory = fs.lstatSync(fullPath).isDirectory();
  
		if (item.toLowerCase() === query.toLowerCase()) {
		  return fullPath
		}
  
		// recursion
		if (isDirectory) {
		  const match = findTarget(fullPath, query);
		  if (match) return match;
		}
	  }
  
	  return null;
	};
  
	const match = findTarget(basePath, searchQuery);
  
	if (match) {
	  const relativePath = path.relative(basePath, match).replace(/\\/g, '/');
	  return res.redirect(`/list.html?semester=${relativePath}`);
	} else {
	  return res.status(404).send('Directory not found.');
	}
  });

// for opening files
app.get('/openfile/:department/:semester/:subject/*', (req, res) => {
    const department = req.params.department;
    const semester = req.params.semester;
    const subject = req.params.subject;
    const item = req.params[0];

    const pdfPath = path.join(__dirname, `../resources/${department}/${semester}/${subject}/${decodeURIComponent(item)}`);
    console.log(`Requested path: ${pdfPath}`);

    fs.stat(pdfPath, (err, stats) => {
        if (err) {
            console.error('Path not found:', pdfPath);
            return res.status(404).send('File or directory not found.');
        }

        if (stats.isDirectory()) {
            fs.readdir(pdfPath, (dirErr, files) => {
                if (dirErr) {
                    console.error('Error reading directory:', dirErr.message);
                    return res.status(500).send('Error reading directory.');
                }
                res.json({
                    type: 'directory',
                    contents: files,
                });
            });
        } else if (stats.isFile()) {
            const pdfStream = fs.createReadStream(pdfPath);
            res.setHeader('Content-Type', 'application/pdf');
            pdfStream.pipe(res);

            pdfStream.on('error', (streamErr) => {
                console.error('Error reading file:', streamErr.message);
                res.status(500).send('Error reading file.');
            });
        } else {
            res.status(400).send('Unsupported file type.');
        }
    });
});

// for list.js
app.get('/resources/:department/:semester*', (req, res) => {
	const department = req.params.department;
    const semester = req.params.semester;
    const dirPath = req.params[0] || '';
	
	const resourcesPath = path.join(__dirname, `../resources/${department}/`);
    const fullPath = path.join(resourcesPath, semester, dirPath);

    fs.readdir(fullPath, { withFileTypes: true }, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Unable to read directory' });
        }

        const filesList = files.map(file => ({
            name: file.name,
            isDirectory: file.isDirectory()
        }));

        res.json(filesList);
    });
});

//default route
const def = require('./default-route')
app.use('/', def)

//login route
const login = require('./login-route')
app.use('/login', login)

//token route
const token = require('./token-route')
app.use('/token', token)

//home route
const home = require('./home-route')
app.use('/home', home)

//discussion route
const discussion = require('./discussion-route')
app.use('/discussion', discussion)

//logout route
const logout = require('./logout-route')
app.use('/logout', logout)

const connectDB = require('../db/connect') 
require('dotenv').config() 

//First connecting with DB, then starting the Express server
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI) 
    app.listen(5000, () => {
      console.log('Server is running on http://localhost:5000')
    })
  } catch (err) {
    console.log(err)
  }
}
start()