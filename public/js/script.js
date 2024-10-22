const socket = io();

if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      socket.emit("send-location", { latitude, longitude }); //Send to frontend!
    },
    (error) => {
      console.log(error);
    },
    {
      enableHighAccuracy: true,
      timeout: 5000, //About how many secs later you should check his new position
      maximumAge: 0, //No caching:
    }
  );
}

//To show map on the screen, we use:
const map = L.map("map").setView([0, 0], 10); //It initializes the map view on screen and then we set the coordinates and the zoom in measurement!
//To set map face:
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "OpenStreetMap",
}).addTo(map);

const markers = {};

socket.on("recieve-location", (data) => {
  const { id, latitude, longitude } = data;
  map.setView([latitude, longitude], 16);
  if (markers[id]) {
    markers[id].setLatLng([latitude, longitude]);
  } else {
    markers[id] = L.markers([latitude, longitude]).addTo(map);
  }
});

socket.on("user-disconnected", (id) => {
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});
