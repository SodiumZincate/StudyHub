async function refreshToken() {
    try {
        await axios.post('/token/refresh')
        console.log("Access token refreshed successfully"); 
    } catch (err) {
        console.log(err)
    }
}

refreshToken()
setInterval(refreshToken, 16000)
