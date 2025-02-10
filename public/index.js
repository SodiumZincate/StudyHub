const URLParams = new URLSearchParams(window.location.search)
const email = URLParams.get('email');

if (email) {
    const endIndex = email.search(/\d|@/)
    let name = email.slice(0, endIndex)
    name = (name.charAt(0).toUpperCase() + name.slice(1));
    document.querySelector('.main-section-1').textContent = `Welcome ${name}`
}

