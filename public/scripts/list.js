let directoryLinks = {}; // Initialize an empty object to hold the directory links

// Load the directoryLinks.json file asynchronously
fetch('/scripts/directoryLinks.json') // Adjust the path if necessary
  .then(response => response.json())
  .then(data => {
    directoryLinks = data; // Populate the directoryLinks object with the data from the JSON file
    if (currentSemester) {
      updatePageTitle();
      fetchDirectories(currentSemester, []);  // Start from the root directory of the semester
    }
  })
  .catch(error => {
    console.error('Error loading directory links:', error);
  });

let currentSemester = null;
let currentPath = [];
let currentPathStr = '';

// Fetch directories based on current semester and current path
function fetchDirectories(semester, path) {
  let url = `/api/directories?semester=${semester}`;
  if (path.length > 0) {
    url += `&directory=${path.join('/')}`; // Append the current path to the API call
  }

  // Show loading state while fetching directories
  const fileListDiv = document.getElementById('file-list');
  fileListDiv.innerHTML = '<div class="loading">Loading...</div>'; // Loading message

  console.log('Fetching directories for path:', path); // Log the current path

  fetch(url)
    .then(response => response.json())
    .then(directories => {
      console.log('API Response:', directories); // Log the response from the API

      fileListDiv.innerHTML = ''; // Clear previous loading message

      if (directories && directories.length > 0) {
        directories.forEach(directory => {
          const directoryDiv = document.createElement('div');
          directoryDiv.classList.add('directory');
          directoryDiv.textContent = directory;

          // Add a pointer cursor for clickable directories
          directoryDiv.style.cursor = 'pointer';

          // Highlight directories with subdirectories
          directoryDiv.classList.toggle('has-subdirectories', directory.includes('/')); // Example: if the directory name has a '/' (could be adjusted)

          // Add click event to navigate into the subdirectory
          directoryDiv.addEventListener('click', () => navigateToSubdirectory(directory));

          // Append the directory div to the fileListDiv
          fileListDiv.appendChild(directoryDiv);
        });

        // After the directories are appended, check for the link for this path
        currentPathStr = path.join('/');
        console.log('Checking for link at:', currentPathStr); // Log the current path being checked

        // Check if a link exists for the current directory path
        if (directoryLinks[currentPathStr]) {
          // If there are multiple links for this directory
          if (Array.isArray(directoryLinks[currentPathStr])) {
            directoryLinks[currentPathStr].forEach(linkInfo => {
              const linkDiv = document.createElement('div');
              linkDiv.classList.add('directory-link');

              const link = document.createElement('a');
              link.href = linkInfo.url;
              link.textContent = linkInfo.name; // Use custom name for the link
              link.target = '_blank'; // Open in a new tab

              linkDiv.appendChild(link);

              // Add the link below the directory structure
              fileListDiv.appendChild(linkDiv);
            });
          } else {
            // If there is just one link
            const linkDiv = document.createElement('div');
            linkDiv.classList.add('directory-link');

            const link = document.createElement('a');
            link.href = directoryLinks[currentPathStr].url;
            link.textContent = directoryLinks[currentPathStr].name; // Use custom name for the link
            link.target = '_blank'; // Open in a new tab

            linkDiv.appendChild(link);

            // Add the link below the directory structure
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
              link.textContent = linkInfo.name; // Use custom name for the link
              link.target = '_blank'; // Open in a new tab

              linkDiv.appendChild(link);

              // Add the link below the directory structure
              fileListDiv.appendChild(linkDiv);
            });
          } else {
            // If there is just one link
            const linkDiv = document.createElement('div');
            linkDiv.classList.add('directory-link');

            const link = document.createElement('a');
            link.href = directoryLinks[currentPathStr].url;
            link.textContent = directoryLinks[currentPathStr].name; // Use custom name for the link
            link.target = '_blank'; // Open in a new tab

            linkDiv.appendChild(link);

            // Add the link below the directory structure
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
	currentPath.push(subdirectory); // Add the subdirectory to the path
	fetchDirectories(currentSemester, currentPath); // Fetch subdirectories
  
	// Now, check for the link related to the subdirectory after navigation
	currentPathStr = currentPath.join('/');
	console.log('Checking for link at:', currentPathStr); // Log the current path being checked
  
	// Get the fileListDiv where the directories are listed
	const fileListDiv = document.getElementById('file-list');
  
	updatePageTitle(); // Update the title with the current path
  }
  
  // Go back to the previous directory in the path
  function goBack() {
	if (currentPath.length === 0) {
	  window.history.back();
	}
  
	currentPath.pop(); // Remove the last directory in the path
  
	// Temporarily display a loading state while fetching
	const fileListDiv = document.getElementById('file-list');
	fileListDiv.innerHTML = '<div class="loading">Loading...</div>';
  
	fetchDirectories(currentSemester, currentPath); // Fetch directories for the parent directory
	updatePageTitle(); // Update the page title
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
	fetchDirectories(currentSemester, []);  // Start from the root directory of the semester
  }
  
  // Back button handler
  document.getElementById('back-button').addEventListener('click', goBack);
  