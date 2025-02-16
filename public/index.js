const URLParams = new URLSearchParams(window.location.search)
const email = URLParams.get('email');

document.querySelectorAll('.menus a').forEach(function(link) {
    let url = new URL(link.href); 
    if (email) {
        url.searchParams.set('email', email); 
        link.href = url; 
    }
});

if (email) {
    const endIndex = email.search(/\d|@/)
    let name = email.slice(0, endIndex)
    name = (name.charAt(0).toUpperCase() + name.slice(1));
    document.querySelector('.main-section-1').textContent = `Welcome ${name}`
}

const user = document.querySelector(".user");
user.addEventListener("click", (event) => {
    document.querySelector(".nav-menu").classList.toggle("active");
    event.stopPropagation(); 
});

const navMenu = document.querySelector(".nav-menu");
document.addEventListener("click", (event) => {
    if (!navMenu.contains(event.target) && event.target !== user) {
        navMenu.classList.remove("active");
    }
});

const logoutButton = document.querySelector(".logout");
const logoutContainer = document.querySelector(".logout-container");
const cancelButton = document.querySelector(".cancel-button");

logoutButton.addEventListener("click", (event) => {
    event.preventDefault();  
    logoutContainer.classList.toggle("active");
});

document.addEventListener("click", (event) => {
    if (!logoutContainer.contains(event.target) && event.target !== logoutButton) {
        logoutContainer.classList.remove("active");
    }
});

cancelButton.addEventListener("click", (event) => {
    event.preventDefault();  
    logoutContainer.classList.remove("active");  
});
