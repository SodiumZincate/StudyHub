//selectors
const todoInput = document.querySelector('.todo-input');
const todoButton = document.querySelector('.add-button');
const todoList = document.querySelector('.todo-list');

//event listeners
todoButton.addEventListener('click', addTodo);
todoInput.addEventListener('keydown', handleKeyDown);
todoList.addEventListener('click', buttonOperation);

//retrieving from local storage
showTask();

//functions
function handleKeyDown(event) {
    if (event.key === 'Enter') {
        addTodo(event);
    }
}

function addTodo(event) {
    event.preventDefault(); //prevents form from submitting
    const todoDiv = document.createElement('div');
    todoDiv.classList.add('todo');
    const newTodo = document.createElement('li');
    newTodo.classList.add('todo-item');

    //buttons
    const completedButton = document.createElement('button');
    completedButton.innerHTML = '<i class="fa-solid fa-check"></i>';
    completedButton.classList.add('complete-btn');

    const trashButton = document.createElement('button');
    trashButton.innerHTML = '<i class="fa-solid fa-trash"></i>';
    trashButton.classList.add('trash-button');

    //validation and adding task
    if (todoInput.value.trim() === '') {
        alert('No task detected');
        todoInput.value = '';
    } else {
        newTodo.innerText = todoInput.value;
        todoDiv.appendChild(completedButton);
        todoDiv.appendChild(newTodo);
        todoDiv.appendChild(trashButton);
        todoList.appendChild(todoDiv);

        // Save data after adding the task
        saveData();

        todoInput.value = '';
    }
}

function buttonOperation(event) {
    const button = event.target;

    if (button.classList[0] === 'trash-button') {
        button.parentElement.remove();
        saveData();
    } else if (button.classList[0] === 'complete-btn') {
        button.classList.toggle('complete-btn-checked');
        button.parentElement.children[1].classList.toggle('cross-text');
        button.parentElement.classList.toggle('illuminate-div');
        saveData();
    }
}

function saveData() {
    const todos = [];
    // Collect all todo items
    const todoItems = document.querySelectorAll('.todo');
    todoItems.forEach(todo => {
        const text = todo.querySelector('.todo-item').innerText;
        const completed = todo.querySelector('.complete-btn').classList.contains('complete-btn-checked');
        todos.push({ text, completed });
    });

    // Save the todos array in localStorage
    localStorage.setItem("todo-tasks", JSON.stringify(todos));
}

function showTask() {
    const savedTasks = JSON.parse(localStorage.getItem('todo-tasks'));

    if (savedTasks) {
        savedTasks.forEach(task => {
            const todoDiv = document.createElement('div');
            todoDiv.classList.add('todo');
            const newTodo = document.createElement('li');
            newTodo.classList.add('todo-item');
            newTodo.innerText = task.text;

            //buttons
            const completedButton = document.createElement('button');
            completedButton.innerHTML = '<i class="fa-solid fa-check"></i>';
            completedButton.classList.add('complete-btn');
            if (task.completed) {
                completedButton.classList.add('complete-btn-checked');
                newTodo.classList.add('cross-text');
            }

            const trashButton = document.createElement('button');
            trashButton.innerHTML = '<i class="fa-solid fa-trash"></i>';
            trashButton.classList.add('trash-button');

            todoDiv.appendChild(completedButton);
            todoDiv.appendChild(newTodo);
            todoDiv.appendChild(trashButton);
            todoList.appendChild(todoDiv);
        });
    }
}
