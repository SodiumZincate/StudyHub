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
  console.log('User searched for:', searchQuery);

  if (searchQuery) {
    res.send(`You searched for: ${searchQuery}`);
	if(searchQuery == "test"){
		const fileName = "../public/" + searchQuery + ".txt";
		const data = fs.readFileSync(fileName, 'utf8');
		console.log(data);

		fs.readFile(fileName, 'utf8', (err, data) => {
			if (err) {
			  console.error('Error reading file:', err);
			  return;
			}
			console.log(data);
		  });
	}
  } else {
    res.send('Please provide a search query.');
  }
});

// for opening files
app.get('/openfile/:department/:semester/:subject/:item', (req, res) => {
	const department = req.params.department;  // Get the department from the URL
	const semester = req.params.semester;  // Get the semester from the URL
	const subject = req.params.subject;  // Get the subject from the URL
	const item = req.params.item;  // Get the item from the URL

    const pdfPath = path.join(__dirname, `../resources/${department}/${semester}/${subject}/${item}`); // Path to your PDF
    const pdfStream = fs.createReadStream(pdfPath);

    res.setHeader('Content-Type', 'application/pdf');
    pdfStream.pipe(res); // Stream the PDF file to the client
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