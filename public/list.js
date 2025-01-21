function fetchFiles(path = '') {
	if (!path) {
        return;
    }
    // fetch the files based on current path
    fetch(`/resources/${path}`)
        .then(response => response.json())
        .then(files => {
			// store the response in a container
            const fileListContainer = document.getElementById('file-list');
            fileListContainer.innerHTML = '';

            // adding a ../ button to go back
            if (path) {
                const backButton = document.createElement('div');
                backButton.textContent = '../';
                backButton.style.cursor = 'pointer';
                backButton.style.color = 'blue';
                backButton.addEventListener('click', () => {
                    const pathParts = path.split('/').filter(Boolean);
                    pathParts.pop();
                    const newPath = pathParts.join('/');
					if(newPath != "ce" && newPath != "cs"){
                    	fetchFiles(newPath);
					}
					else{
						window.location.href = '/resources.html';
					}
                });
                fileListContainer.appendChild(backButton);
            }

            // iterate over files and folders
            files.forEach(file => {
                const div = document.createElement('div');
                div.classList.add(file.isDirectory ? 'folder' : 'file');
                div.textContent = file.name;

				// for directory
                if (file.isDirectory) {
                    div.addEventListener('click', () => {
                        fetchFiles(path + '/' + file.name);
                    });
                } else {
                    div.addEventListener('click', () => {
						// calls /openfile endpoint to show pdf
                        fetch(`/openfile/${path}/${file.name}`)
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error(`HTTP error! Status: ${response.status}`);
                                }
                                return response.blob();
                            })
                            .then(pdfBlob => {
                                const pdfUrl = URL.createObjectURL(pdfBlob);
                                window.open(pdfUrl, '_blank');
                            })
                            .catch(error => {
                                console.error('Error fetching PDF:', error);
                            });
                    });
                }

                // append the file or directory to the container
                fileListContainer.appendChild(div);
            });
        })
        .catch(error => console.error('Error fetching file list:', error));
}

// initial call for root path
fetchFiles();

const searchInput = document.getElementById('search-bar'); // Adjust to your search bar ID
const searchButton = document.getElementById('search-button'); // Adjust to your search button ID

searchButton.addEventListener('click', () => {
    const query = searchInput.value;
    fetch(`/home/search?item=${query}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.type === 'directory') {
                displayFiles(data.files, query);
            } else {
                alert(data);
            }
        })
        .catch(error => {
            console.error('Error fetching search results:', error);
        });
});