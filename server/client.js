const express = require('express');
const app = express();

app.get('/home/search', (req, res) => {
	const searchQuery = req.query.item;
	console.log('User searched for:', searchQuery);
  
	res.send(`You searched for: ${searchQuery}`);
});

app.listen(5500, () => {
	console.log('Server is running on http://localhost:5500');
});