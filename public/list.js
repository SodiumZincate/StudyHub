let currentSemester = null;
let currentPath = []; // This will store the current path for navigation

// Fetch directories based on current semester and current path
function fetchDirectories(semester, path) {
  let url = `/api/directories?semester=${semester}`;
  if (path.length > 0) {
    url += `&directory=${path.join('/')}`; // Append the current path to the API call
  }

  // Show loading state while fetching directories
  const fileListDiv = document.getElementById('file-list');
  fileListDiv.innerHTML = '<div class="loading">Loading...</div>'; // Loading message
  
  fetch(url)
    .then(response => response.json())
    .then(directories => {
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
          fileListDiv.appendChild(directoryDiv);
        });
      } else {
        fileListDiv.innerHTML = 'No directories found.';
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
  updatePageTitle(); // Update the title with the current path
}

// Go back to the previous directory in the path
function goBack() {
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
  // Set the initial title to the semester
  updatePageTitle();

  // Fetch and display the directories for the semester
  fetchDirectories(currentSemester, []);  // Start from the root directory of the semester
}

// Back button handler
document.getElementById('back-button').addEventListener('click', goBack);
