
document.getElementById('regButton').addEventListener('click', () => {
    let email = document.getElementById('email').value
    let password = document.getElementById('password').value
    let nickname = document.getElementById('nickname').value
    let role = document.getElementById('role')

    role = role.options[role.selectedIndex].value
    console.log(role)

    let body = {
        email,
        password,
        nickname,
        role
    }

    fetch('/register', {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        console.log(response)
        return response.json()
    })
    .then(json => {
        console.log(`token: ${json.token}`)
        localStorage.setItem('token', json.token)
    })
})