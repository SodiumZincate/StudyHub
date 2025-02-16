// JavaScript to manage question list and functionality
document.addEventListener("DOMContentLoaded", () => {
	const questionList = document.querySelector(".questionList");
	const addQuestionButton = document.querySelector(".addButton");
	const newQuestionInput = document.querySelector(".input");
	const paginationPrevButton = document.querySelector(".pageButton.prev");
	const paginationNextButton = document.querySelector(".pageButton.next");
	
	let questions = JSON.parse(localStorage.getItem('questions')) || [];
	let currentPage = 1;
	const questionsPerPage = 10;
  
	// Load questions onto the page
	const renderQuestions = () => {
	  questionList.innerHTML = "";
	  const displayedQuestions = questions.slice((currentPage - 1) * questionsPerPage, currentPage * questionsPerPage);
	  displayedQuestions.forEach(question => {
		const questionItem = document.createElement("div");
		questionItem.classList.add("questionItem");
		questionItem.innerHTML = `
		  <div class="questionContent">
			<h3 class="questionText">${question.text}</h3>
			<p class="questionInfo">Asked by <span class="userEmail">${question.userEmail}</span> on <span class="date">${question.date}</span></p>
			<div class="actionButtons">
			  <button class="editButton">Edit</button>
			  <button class="deleteButton">Delete</button>
			</div>
		  </div>
		`;
		questionList.appendChild(questionItem);
	  });
	};
  
	// Add new question
	const handleAddQuestion = () => {
	  const newQuestionText = newQuestionInput.value.trim();
	  if (!newQuestionText) return;
  
	  const newQuestion = {
		id: Date.now(),
		text: newQuestionText,
		date: new Date().toLocaleString(),
		userEmail: 'user@example.com',
	  };
	  
	  questions.unshift(newQuestion);
	  localStorage.setItem('questions', JSON.stringify(questions));
	  newQuestionInput.value = "";
	  renderQuestions();
	};
  
	// Pagination controls
	const handlePagination = () => {
	  paginationPrevButton.disabled = currentPage === 1;
	  paginationNextButton.disabled = currentPage * questionsPerPage >= questions.length;
	};
  
	paginationPrevButton.addEventListener('click', () => {
	  if (currentPage > 1) currentPage--;
	  handlePagination();
	  renderQuestions();
	});
  
	paginationNextButton.addEventListener('click', () => {
	  if (currentPage * questionsPerPage < questions.length) currentPage++;
	  handlePagination();
	  renderQuestions();
	});
  
	addQuestionButton.addEventListener("click", handleAddQuestion);
  
	// Initial render
	renderQuestions();
	handlePagination();
  });
  