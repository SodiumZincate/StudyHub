async function refreshToken() {
    try {
        await axios.post('/token/refresh')
        console.log("Access token refreshed successfully"); 
    } catch (err) {
        console.log(err)
    }
}

refreshToken()
setInterval(refreshToken, 14.8 * 60 * 1000)
