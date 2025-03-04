const menusHome = document.querySelector("#menus-home");
const menusResources = document.querySelector("#menus-resources");
const menusNotices = document.querySelector("#menus-notices");
const menusFaculties = document.querySelector("#menus-faculties");
const menusContact = document.querySelector("#menus-contact");

menusHome.addEventListener("click", (event) => {
    event.preventDefault();
    window.location.href = '/api/home/home'; 
})

menusResources.addEventListener("click", (event) => {
    event.preventDefault();
    window.location.href = '/api/home/resources';
})

menusNotices.addEventListener("click", (event) => {
    event.preventDefault();
    window.location.href = '/api/home/notices'; 
})

menusFaculties.addEventListener("click", (event) => {
    event.preventDefault();
    window.location.href = '/api/home/faculties'; 
})

menusContact.addEventListener("click", (event) => {
    event.preventDefault();
    window.location.href = '/api/home/contact'; 
})