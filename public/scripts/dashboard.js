const updateQueryParam = function(key, value) {
    const url = new URL(window.location);
    url.searchParams.set(key, value);
    window.history.pushState({}, '', url); 
}

axios.get('/get-email')
.then(res => updateQueryParam('email', res.data.email))
.then( () => {
const URLParams = new URLSearchParams(window.location.search)
const email = URLParams.get('email');

if (email) {
    document.querySelectorAll('.menus a').forEach(function(link) {
        let url = new URL(link.href);
        url.searchParams.set('email', email); 
        link.href = url; 
    });

    const endIndex = email.search(/\d|@/)
    let name = email.slice(0, endIndex)
    name = (name.charAt(0).toUpperCase() + name.slice(1));
    document.querySelector('.main-section-1').textContent = `Welcome ${name}`
}
})
.catch(err => console.log(err))

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

const logout = document.querySelector(".logout-button")
logout.addEventListener("click", () => {
    axios.delete('/token/logout')
    .then(res => window.location.href = res.data.redirectUrl)
    .catch(error => console.error("There was an error with the request:", error));
})