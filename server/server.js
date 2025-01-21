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
  const basePath = path.join(__dirname, '../resources/'); // Adjust based on your directory structure
  const targetPath = path.join(basePath, searchQuery);

  console.log('User searched for:', searchQuery);

  if (searchQuery) {
    if (fs.existsSync(targetPath)) {
      if (fs.lstatSync(targetPath).isDirectory()) {
        // Return the directory contents
        const files = fs.readdirSync(targetPath).map((file) => {
          const fullPath = path.join(targetPath, file);
          return {
            name: file,
            isDirectory: fs.lstatSync(fullPath).isDirectory(),
          };
        });
        return res.json({ type: 'directory', files });
      } else {
        // Handle case if the search query is a file
        res.send(`The query '${searchQuery}' is not a directory.`);
      }
    } else {
      res.status(404).send('Directory not found.');
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