const fs = require('fs');
const express = require('express');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../assets')));
// app.use(express.static(path.join(__dirname, '../resources')));

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

// Start the Express server
app.listen(6969, "0.0.0.0", () => {
  console.log('Server is running on http://localhost:6969');
});