let directoryLinks = {};

// Load directory links from MongoDB
fetch('/api/fetch/resources')
  .then(response => response.json())
  .then(data => {
    directoryLinks = data;
	if (Array.isArray(directoryLinks)) {
		console.log("directoryLinks is an array! Converting...");
		
		// Convert array into an object where keys are the paths
		directoryLinks = directoryLinks[0];
	}		
  })
  .catch(error => {
    console.error('Error loading directory links from MongoDB:', error);
  });

let currentSemester = null;
let currentPath = [];
let currentPathStr = '';

// Fetch directories based on current semester and current path
function fetchDirectories(semester, path) {
	let url = `/api/directories?semester=${semester}`;
	if (path.length > 0) {
	  url += `&directory=${path.join('/')}`;
	}
  
	// Show loading state while fetching directories
	const fileListDiv = document.getElementById('file-list');
	fileListDiv.innerHTML = '<div class="loading">Loading...</div>';
    
	fetch(url)
	  .then(response => response.json())
	  .then(directories => {
  
		fileListDiv.innerHTML = '';
  
		if (directories && directories.length > 0) {
		  directories.forEach(directory => {
			const directoryDiv = document.createElement('div');
			directoryDiv.classList.add('directory');
			directoryDiv.textContent = directory;
			directoryDiv.style.cursor = 'pointer';
			directoryDiv.classList.toggle('has-subdirectories', directory.includes('/'));
			directoryDiv.addEventListener('click', () => navigateToSubdirectory(directory));
  
			fileListDiv.appendChild(directoryDiv);
		  });
  
		  currentPathStr = path.join('/');
  
		  // Check if a link exists for the current directory path
		  if (directoryLinks[currentPathStr]) {
			// If there are multiple links for this directory
			if (Array.isArray(directoryLinks[currentPathStr])) {
			  directoryLinks[currentPathStr].forEach(linkInfo => {
				const linkDiv = document.createElement('div');
				linkDiv.classList.add('directory-link');
  
				const link = document.createElement('a');
				link.href = linkInfo.url;
				link.textContent = linkInfo.name; // custom name
				link.target = '_blank';
  
				linkDiv.appendChild(link);
  
				fileListDiv.appendChild(linkDiv);
			  });
			} else {
			  // If there is just one link
			  const linkDiv = document.createElement('div');
			  linkDiv.classList.add('directory-link');
  
			  const link = document.createElement('a');
			  link.href = directoryLinks[currentPathStr].url;
			  link.textContent = directoryLinks[currentPathStr].name; // custom name
			  link.target = '_blank';
  
			  linkDiv.appendChild(link);
  
			  fileListDiv.appendChild(linkDiv);
			}
		  }
		} else {
		  // If no subdirectories are found, check if a link exists for this path
		  if (directoryLinks[currentPathStr]) {
			// If there are multiple links for this directory
			if (Array.isArray(directoryLinks[currentPathStr])) {
			  directoryLinks[currentPathStr].forEach(linkInfo => {
				const linkDiv = document.createElement('div');
				linkDiv.classList.add('directory-link');
  
				const link = document.createElement('a');
				link.href = linkInfo.url;
				link.textContent = linkInfo.name; // custom name
				link.target = '_blank';
  
				linkDiv.appendChild(link);
  
				fileListDiv.appendChild(linkDiv);
			  });
			} else {
			  // If there is just one link
			  const linkDiv = document.createElement('div');
			  linkDiv.classList.add('directory-link');
  
			  const link = document.createElement('a');
			  link.href = directoryLinks[currentPathStr].url;
			  link.textContent = directoryLinks[currentPathStr].name; // custom name
			  link.target = '_blank';
  
			  linkDiv.appendChild(link);
  
			  fileListDiv.appendChild(linkDiv);
			}
		  } else {
			fileListDiv.innerHTML = 'No directories found, and no link available.';
		  }
		}
	  })
	  .catch(error => {
		console.error('Error fetching directories:', error);
		fileListDiv.innerHTML = 'Failed to load directories.';
	  });
  }

// Navigate to a subdirectory by adding it to the current path
function navigateToSubdirectory(subdirectory) {
  currentPath.push(subdirectory);
  fetchDirectories(currentSemester, currentPath);

  // Now, check for the link related to the subdirectory after navigation
  currentPathStr = currentPath.join('/');

  const fileListDiv = document.getElementById('file-list');

  updatePageTitle();
}

// Go back to the previous directory in the path
function goBack() {
  if (currentPath.length === 0) {
    window.history.back();
  }

  currentPath.pop();

  // Temporarily display a loading state while fetching
  const fileListDiv = document.getElementById('file-list');
  fileListDiv.innerHTML = '<div class="loading">Loading...</div>';

  fetchDirectories(currentSemester, currentPath);
  updatePageTitle();
}

// Update the page title to show the current path
function updatePageTitle() {
  const subjectNameDiv = document.getElementById('subject-name');
  if (currentPath.length > 0) {
    subjectNameDiv.textContent = `${currentSemester} > ${currentPath.join(' > ')}`;
  } else {
    subjectNameDiv.textContent = currentSemester;
  }
}

if (currentSemester) {
  updatePageTitle();
  fetchDirectories(currentSemester, []);
}
