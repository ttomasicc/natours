const bookingBtn = document.getElementById('book-tour')
bookingBtn?.addEventListener('click', async (e) => {
  e.preventDefault()
  e.target.textContent = 'Processing...'

  const { tourId } = e.target.dataset
  await bookTour(tourId)
})

const bookTour = async (tourId) => {
  try {
    const session = await getCheckoutSession(tourId)
    location.assign(session.url)
  } catch (err) {
    showAlert(err, 'error')
  }
}

const getCheckoutSession = async (tourId) => {
  const call = await fetch(`/api/v1/bookings/checkout-session/${tourId}`)
  const response = await call.json()
  return response.session
}
