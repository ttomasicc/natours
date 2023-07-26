const logout = async () => {
  try {
    const call = await fetch('/api/v1/users/logout')
    const response = await call.json()

    if (response.status === 'success') {
      location.assign('/')
    }
  } catch (_) {
    showAlert('Error logging out. Please try again.', 'error')
  }
}

const logoutBtn = document.querySelector('.nav__el--logout')
if (logoutBtn) {
  logoutBtn.addEventListener('click', async (e) => {
    await logout()
  })
}
