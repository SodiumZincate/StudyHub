const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  const semester = new URLSearchParams(req.url.split('?')[1]).get('semester');
  const directory = new URLSearchParams(req.url.split('?')[1]).get('directory');
  
  if (req.url.startsWith("/api/directories")) {
    if (!semester) {
      return res.status(400).json({ error: 'Semester parameter is required' });
    }

    const semesterPath = path.join(__dirname, 'files', semester);

    // If there's a specific directory, fetch that
    const directoryPath = directory ? path.join(semesterPath, directory) : semesterPath;

    fs.readdir(directoryPath, { withFileTypes: true }, (err, files) => {
      if (err) {
        console.error('Error reading directories:', err);
        return res.status(500).json({ error: 'Failed to read directories' });
      }

      // Filter and return only directories
      const directories = files.filter(file => file.isDirectory()).map(dir => dir.name);
      res.status(200).json(directories);
    });
  } 
  // Return 404 for other routes
  else {
    res.status(404).json({ error: "Not Found" });
  }
};
