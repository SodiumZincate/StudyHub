const updateQueryParam = function(key, value) {
    const url = new URL(window.location);
    url.searchParams.set(key, value);
    window.history.pushState({}, '', url); 
}

axios.get('/get-email')
.then( (res) => {
    localStorage.setItem('email', res.data.email);
    const email = localStorage.getItem('email');

    const endIndex = email.search(/\d|@/)
    let name = email.slice(0, endIndex)
    name = (name.charAt(0).toUpperCase() + name.slice(1));
    document.querySelector('.main-section-1').textContent = `Welcome ${name}`
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
    localStorage.removeItem("email");
    axios.delete('/logout')
    .then(res => window.location.href = res.data.redirectUrl)
    .catch(error => console.error("There was an error with the request:", error));
})

//theme
document.addEventListener("DOMContentLoaded", () => {
    const toggleButton = document.querySelector(".theme");
    const themeStylesheet1 = document.getElementById("themeStylesheet1");
    const themeStylesheet2 = document.getElementById("themeStylesheet2");
  
    // Check localStorage for theme preference
    const currentTheme = localStorage.getItem("theme") || "light";
    themeStylesheet1.href = currentTheme === "dark" ? "/styles/dashboard-dark.css" : "/styles/dashboard.css";
    themeStylesheet2.href = currentTheme === "dark" ? "/styles/common-dark.css" : "/styles/common.css"
  
    // Toggle theme on button click
    toggleButton.addEventListener("click", () => {
      if (themeStylesheet1.href.includes("/styles/dashboard.css")) {
        themeStylesheet1.href = "/styles/dashboard-dark.css";
        themeStylesheet2.href = "/styles/common-dark.css";
        localStorage.setItem("theme", "dark");
      } else {
        themeStylesheet1.href = "/styles/dashboard.css";
        themeStylesheet2.href = "/styles/common.css";
        localStorage.setItem("theme", "light");
      }
    });
  });

  //user options
  //user details
  const userDetails = document.querySelector("#user-details")
  userDetails.addEventListener("click", (event) => {
    event.preventDefault();
    try {
        window.location.href = '/home/personal-details' //sends a get request 
    }
    catch(error) {
        console.error("There was an error with the request:", error)
    }
  })