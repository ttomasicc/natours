const form = document.querySelector('form')

form.onsubmit = async (e) => {
  e.preventDefault()

  const name = form.querySelector('#name').value
  const email = form.querySelector('#email').value
  const password = form.querySelector('#password').value
  const passwordConfirm = form.querySelector('#passwordConfirm').value

  try {
    await signUp({ name, email, password, passwordConfirm })
    showAlert('Welcome to the Natours family!')
    window.setTimeout(() => location.assign('/'), 1374)
  } catch (err) {
    if (err.message.includes('email')) {
      err.message = 'Account for a given email already exists.'
    }
    showAlert(err.message, 'error')
  }
}

const signUp = async (user) => {
  const call = await fetch('/api/v1/users/signup', {
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
