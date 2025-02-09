const URLParams = new URLSearchParams(window.location.search)

const email = URLParams.get('email');
document.querySelector('.otp-message-email').innerText = `${email}`

