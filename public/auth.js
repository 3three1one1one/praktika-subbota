
document.getElementById('regButton').addEventListener('click', () => {
    let email = document.getElementById('email').value
    let password = document.getElementById('password').value

    let body = {
        email,
        password
    }

    fetch('/login', {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
            "Content-Type": 'application/json'
        }
    })
    .then(response => {
        if(response.status == 404)
        {
            return alert('Пользователь не существует')
        }

        if(response.status == 400)
        {
            return alert('Неверный пароль')
        }

        return response.json()
    })
    .then(json => {
        if(json != undefined || json != null)
        {
            console.log(json)
            localStorage.setItem('token', json.token)
        }
    })


})