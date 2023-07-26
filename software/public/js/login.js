const form = document.querySelector('form[class="form"]')

form.onsubmit = async (e) => {
  e.preventDefault()
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value

  try {
    await login({ email, password })
    showAlert('Logged in successfully!')
    window.setTimeout(() => location.assign('/'), 1374)
  } catch (err) {
    showAlert(err.message, 'error')
  }
}

const login = async (user) => {
  const call = await fetch('/api/v1/users/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(user)
  })
  const response = await call.json()

  if (response.status === 'success') {
    return response
  }

  throw new Error(response.message)
}
