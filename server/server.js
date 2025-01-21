const fs = require('fs');
const express = require('express');
const path = require('path');

const app = express();

// Middleware to serve static files (like images, CSS, etc.)
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../assets')));
app.use(express.static(path.join(__dirname, '../resources')));

// Route to handle search queries
app.get('/home/search', (req, res) => {
	const searchQuery = req.query.item;
	const basePath = path.join(__dirname, '../resources/'); // Root directory for search
  
	console.log('User searched for:', searchQuery);
  
	if (!searchQuery) {
	  return res.send('Please provide a search query.');
	}
  
	// Function to recursively search directories for a match
	const findTarget = (dir, query) => {
	  const items = fs.readdirSync(dir);
  
	  for (const item of items) {
		const fullPath = path.join(dir, item);
		const isDirectory = fs.lstatSync(fullPath).isDirectory();
  
		if (item.toLowerCase() === query.toLowerCase()) {
		  return fullPath; // Return the matching directory path
		}
  
		if (isDirectory) {
		  const match = findTarget(fullPath, query); // Search recursively
		  if (match) return match; // Return the first match
		}
	  }
  
	  return null; // No match found
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
    const department = req.params.department;  // Get the department from the URL
    const semester = req.params.semester;      // Get the semester from the URL
    const subject = req.params.subject;        // Get the subject from the URL
    const item = req.params[0];                // Get the wildcard part of the path (after :subject/)

    // Construct the full path to the file or directory
    const pdfPath = path.join(__dirname, `../resources/${department}/${semester}/${subject}/${decodeURIComponent(item)}`);
    console.log(`Requested path: ${pdfPath}`);

    // Check if the path exists
    fs.stat(pdfPath, (err, stats) => {
        if (err) {
            console.error('Path not found:', pdfPath);
            return res.status(404).send('File or directory not found.');
        }

        if (stats.isDirectory()) {
            // If the path is a directory, list its contents
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
            // If the path is a file, stream it
            const pdfStream = fs.createReadStream(pdfPath);
            res.setHeader('Content-Type', 'application/pdf');
            pdfStream.pipe(res);

            // Handle streaming errors
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
	const department = req.params.department; // Get the department from the URL
    const semester = req.params.semester; // Get the semester from the URL
    const dirPath = req.params[0] || ''; // Capture everything after "/:semester/"
	
    // Construct the full path using the semester and additional path segments
	const resourcesPath = path.join(__dirname, `../resources/${department}/`);
    const fullPath = path.join(resourcesPath, semester, dirPath);

    // Read the directory contents
    fs.readdir(fullPath, { withFileTypes: true }, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Unable to read directory' });
        }

        // Format the files and directories
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