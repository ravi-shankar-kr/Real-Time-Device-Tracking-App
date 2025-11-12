const socket = io();

let map = L.map("map").setView([20.5937, 78.9629], 5);  // map pehle banao
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "Ravi",
}).addTo(map);

let firstUpdate = true;
let userMarker;
const markers = {};

if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;

      socket.emit("send-location", { latitude, longitude });

      //  Map ko sirf pehli baar user location pe zoom karo
      if (firstUpdate) {
        map.setView([latitude, longitude], 16);
        firstUpdate = false;
      }

      //  User ka marker show/update karo
      if (!userMarker) {
        userMarker = L.marker([latitude, longitude]).addTo(map);
      } else {
        userMarker.setLatLng([latitude, longitude]);
      }
    },
    (error) => {
      console.error("Geolocation Error:", error.message);
      if (error.code === 1) alert("Please allow location access.");
      if (error.code === 2) alert("Location unavailable. Try again.");
      if (error.code === 3) alert("Location request timed out. Try reloading.");
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    }
  );
}

//  Doosre users ke liye markers handle karo
socket.on("receive-location", (data) => {
  const { id, latitude, longitude } = data;
  if (!markers[id]) {
    markers[id] = L.marker([latitude, longitude]).addTo(map);
  } else {
    markers[id].setLatLng([latitude, longitude]);
  }
});

socket.on("user-disconnected", (id) => {
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});
