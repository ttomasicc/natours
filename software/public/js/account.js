const userDataFrm = document.querySelector('.form-user-data')
const userPasswordFrm = document.querySelector('.form-user-settings')

userDataFrm.addEventListener('submit', async (e) => {
  e.preventDefault()

  const form = new FormData()
  const photo = userDataFrm.querySelector('#photo').files[0]
  form.append('name', userDataFrm.querySelector('#name').value)
  form.append('email', userDataFrm.querySelector('#email').value)
  form.append('photo', photo)

  try {
    await updateUser(form)
    showAlert('Updated successfully!')
    if (photo){
      setTimeout(() => location.reload(), 474)
    }
  } catch (err) {
    showAlert(err.message, 'error')
  }
})

userPasswordFrm.addEventListener('submit', async (e) => {
  e.preventDefault()

  const currentPassword = userPasswordFrm.querySelector('#password-current').value
  const newPassword = userPasswordFrm.querySelector('#password').value
  const newPasswordConfirm = userPasswordFrm.querySelector('#password-confirm').value

  try {
    await updateUser({ currentPassword, newPassword, newPasswordConfirm })
    showAlert('Password updated successfully!')
  } catch (err) {
    showAlert(err.message, 'error')
  }
})

const updateUser = async (user) => {
  const isFormData = user instanceof FormData

  const url = `/api/v1/users/${isFormData ? 'current' : 'update-password'}`
  const httpOptions = {
    method: 'PATCH',
    ...(!isFormData && { headers: { 'Content-Type': 'application/json' } }),
    body: isFormData ? user : JSON.stringify(user)
  }

  const call = await fetch(url, httpOptions)
  const response = await call.json()

  if (response.status !== 'success') {
    throw new Error(response.message)
  }
}

const userImg = document.querySelector('.form__user-photo')
const userImgInput = document.querySelector('#photo')

userImgInput.addEventListener('change', (e) => {
  const imgFile = e.target.files?.[0]

  if (!imgFile?.type.startsWith('image/')) return

  const reader = new FileReader()
  reader.addEventListener('load', () => {
    userImg.setAttribute('src', reader.result)
  })

  reader.readAsDataURL(imgFile)
})
