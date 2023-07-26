'use strict'

const locations = JSON.parse(document.getElementById('map').dataset.locations)
const map = L.map('map', { zoomControl: false })

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  gestureHandling: true,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map)

map.attributionControl.setPosition('bottomleft')
map.scrollWheelZoom.disable()

const markers = []
locations.forEach((location) => {
  const [lat, lng] = location.coordinates
  const point = [lng, lat]

  markers.push(point)
  L.marker(point, { icon: L.icon({ iconUrl: '/img/pin.png', iconSize: [20, 24] }) })
    .bindPopup(`<h1>Day ${location.day}: ${location.description}</h1>`, { autoClose: false })
    .openPopup()
    .addTo(map)
})

map.fitBounds(L.latLngBounds(markers).pad(0.4))
