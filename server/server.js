const fs = require('node:fs');
const express = require('express');
const path = require('path');

const app = express();

// Middleware to serve static files (like images, CSS, etc.)
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../assets')));


// Route to handle search queries
app.get('/home/search', (req, res) => {
  const searchQuery = req.query.item;
  console.log('User searched for:', searchQuery);

  if (searchQuery) {
    res.send(`You searched for: ${searchQuery}`);
	if(searchQuery == "test"){
		const fileName = "../assets/" + searchQuery + ".txt";
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

// Example fs operation: Check if '2.png' exists and log the result
fs.stat('../assets/test.txt', (err, stats) => {
	if (err) {
	  console.error(err);
	}
	if (stats) {
	  if (stats.isFile()) {
		console.log("test.txt is a file");
		console.log("File size:", stats.size);
	  }
	  if (stats.isDirectory()) {
		console.log("test.txt is a directory");
	  }
	  if (stats.isSymbolicLink()) {
		console.log("test.txt is a symbolic link");
	  }
	}
});

// Start the Express server
app.listen(8080, () => {
  console.log('Server is running on http://localhost:8080');
});