mapboxgl.accessToken = mapToken;

// マップ表示
const map = new mapboxgl.Map({
container: 'map', // container ID
style: 'mapbox://styles/mapbox/streets-v12', // style URL
center: campground.geometry.coordinates,
zoom: 8, // starting zoom
});

// マーカー
new mapboxgl.Marker()
.setLngLat(campground.geometry.coordinates)
// ポップアップ
.setPopup(
  new mapboxgl.Popup({ offset: 25 })
  .setHTML(`<h4>${campground.title}</h4><p>${campground.location}</p>`)
)
.addTo(map);

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());