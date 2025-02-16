const button = document.querySelector('.button');
const URLParams = new URLSearchParams(window.location.search)
const email = URLParams.get('email')

const emailMessage = document.querySelector('.message-email')
emailMessage.textContent = email
button.addEventListener("click", () => {
    axios.post('/api/token/create', {email: email})
    .then(response => {
      // Redirect to the URL returned from the server
      window.location.href = response.data.redirectUrl;
    })
    .catch(error => {
      console.error("There was an error with the request:", error);
    });
})

