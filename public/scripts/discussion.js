// JavaScript to manage question list and functionality
document.addEventListener("DOMContentLoaded", () => {
	const questionList = document.querySelector(".questionList");


	if (questionList) {
        questionList.addEventListener("click", buttonOperation);
    } else {
        console.error("questionList not found!");
    }


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
			<h3 class="questionText" onclick="answerPage()" style="cursor:pointer">${question.text}</h3>
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
  

  //functionality for delete and edit buttons
  function buttonOperation(event){
	const button=event.target; 	
	if(button.classList.contains("deleteButton")){
		button.parentElement.parentElement.parentElement.remove();
	}
	if(button.classList.contains("editButton")){
		const questionBox=button.parentElement.parentElement.children[0];
		const originalQuestionText=questionBox.innerText;
		questionBox.innerHTML=`<input class="editInput" type="text" value="${originalQuestionText}">`;
		const inputField=questionBox.querySelector('.editInput');

		inputField.focus();
		inputField.setSelectionRange(inputField.value.length, inputField.value.length);
		
		//edit Button conversion to Save Button
		button.innerText='Save';
		button.classList.remove('editButton');
		button.classList.add('addButton');//for reference

	}
  }

  //answerPage
function answerPage(){
	let newPageHTML=   `<!DOCTYPE html>
					<html>
					<head>
					<title>AnswerPage</title>
					</head>
					<body>
					</body>
					</html>`
	let newPage=window.open("","_blank");
	newPage.document.write(newPageHTML);
	newPage.document.close();
}