//selectors
const todoInput=document.querySelector('.todo-input');
const todoButton=document.querySelector('.add-button');
const todoList=document.querySelector('.todo-list');


//event listeners
todoButton.addEventListener('click', addTodo);
todoInput.addEventListener('keydown',handleKeyDown);
todoList.addEventListener('click',buttonOperation);

//retriving from local storage
showTask();


//functions
function handleKeyDown(event){
    if(event.key==='Enter'){
        addTodo(event);
    }
}

function addTodo(event){
    event.preventDefault();//prevents form from submitting
    const todoDiv=document.createElement('div');
    todoDiv.classList.add('todo');
    const newTodo=document.createElement('li');
    let todoInput=document.querySelector('.todo-input');
    
    
    newTodo.classList.add('todo-item');
    //buttons
    const completedButton=document.createElement('button');
    completedButton.innerHTML='<i class="fa-solid fa-check"></i>';
    completedButton.classList.add('complete-btn');

    const trashButton=document.createElement('button');
    trashButton.innerHTML='<i class="fa-solid fa-trash"></i>';
    trashButton.classList.add('trash-button');

    //appending to parent div
    
    if(todoInput.value.trim()===''){
        alert('no task detected');
        
        todoInput.value='';
        saveData();
        
    }
    else{
        newTodo.innerText=todoInput.value;
        todoDiv.appendChild(completedButton);
        todoDiv.appendChild(newTodo);
        todoDiv.appendChild(trashButton);
        todoList.appendChild(todoDiv);  
        
        saveData();

        todoInput.value='';
    }
      
}

function buttonOperation(event){

    const button=event.target;

    if(button.classList[0]==='trash-button'){
        button.parentElement.remove();
        saveData();
    }
    else if(button.classList[0]==='complete-btn'){
        button.classList.toggle('complete-btn-checked');
        button.parentElement.children[1].classList.toggle('cross-text');
        button.parentElement.classList.toggle('illuminate-div');
        saveData();        
    }
}

function saveData(){
    localStorage.setItem("todo-task",JSON.stringify(todoList.innerHTML));
}
function showTask(){
    todoList.innerHTML=JSON.parse(localStorage.getItem('todo-task'));
}
