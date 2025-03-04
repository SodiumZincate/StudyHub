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
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Answer Page</title>
    <link rel="stylesheet" href="/styles/answer.css">
</head>
<body>
    <div class="container">
        <div id="question-container">
            <h1 id="question-text"></h1>
            <button id="edit-question-btn">Edit Question</button>
            <div id="edit-question-container" style="display: none;">
                <textarea id="edited-question-text"></textarea>
                <button id="save-question-btn">Save</button>
                <button id="cancel-question-btn">Cancel</button>
            </div>
            <p id="question-details"></p>
        </div>

        <div id="answers-container">
            <h3>Answers</h3>
            <p id="no-answers-message">No answers yet. Be the first to answer!</p>
            <ul id="answers-list"></ul>
        </div>

        <div class="add-answer-container">
            <input type="text" id="new-answer" placeholder="Add your answer">
            <button id="add-answer-btn">Add Answer</button>
        </div>

        <button id="back-btn">Back to Questions</button>
    </div>

    <script src="answers.js"></script>
</body>
</html>
`
	let newPage=window.open("","_self");
	newPage.document.write(newPageHTML);
	newPage.document.close();
}