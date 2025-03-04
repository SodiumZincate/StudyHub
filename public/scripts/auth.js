function refreshToken() {
    axios.post('/api/token/refresh')
    .then(res => console.log(res.data))
    .catch(err => console.log(err))
}

refreshToken()
setInterval(refreshToken, 25 * 1000)
