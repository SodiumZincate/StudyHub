const URLParams = new URLSearchParams(window.location.search)
const email = URLParams.get('email');

document.querySelectorAll('.menus a').forEach(function(link) {
    let url = new URL(link.href); 
    if (email) {
        url.searchParams.set('email', email); 
        link.href = url; 
    }
});