document.querySelector(".login-form").addEventListener("submit", function (event) 
{
    event.preventDefault();
    document.querySelector(".login-message").textContent = "";
    
    const email = document.querySelector(".login-input").value;
    if (!(validateEmail(email))) {
        document.querySelector(".login-message").textContent = "Please enter a valid KU email."
    }
    else {
        event.target.submit();
    }
})

function validateEmail(email) 
{
    return (/^[a-z]+[0-9]+@student.ku.edu.np$/.test(email));
}