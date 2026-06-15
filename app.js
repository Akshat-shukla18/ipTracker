const API_KEY = window.__ENV__?.IPGEO_API_KEY || "";
const ipInput = document.getElementById("ip-input");
const searchBtn = document.getElementById("search-btn");
const ipDisplay = document.getElementById("ip");
const locationDisplay = document.getElementById("location");
const ispDisplay = document.getElementById("isp");
const loader = document.getElementById("loader");
const errorDisplay = document.getElementById("error");
const recentBtn = document.getElementById("recent-btn");
const recentList = document.getElementById("recent-list");

let map;
let searches = JSON.parse(localStorage.getItem("ipSearches")) || [];

function initMap(lat, lng) {
  if (map) map.remove();
  map = L.map('map').setView([lat, lng], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);
  L.marker([lat, lng]).addTo(map)
    .bindPopup("IP Location")
    .openPopup();
}
function showLoader() {
  loader.style.display = "block";
  errorDisplay.textContent = "";
}
function hideLoader() {
  loader.style.display = "none";
}
function updateRecentSearches() {
  recentList.innerHTML = searches
    .map(ip => `<li>${ip}</li>`)
    .join("");
document.querySelectorAll("#recent-list li").forEach(item => {
    item.addEventListener("click", () => {
      ipInput.value = item.textContent;
      fetchIPData(item.textContent);
    });
  });
}
function saveSearch(ip) {
  if (!searches.includes(ip)) {
    searches.unshift(ip);
    searches = searches.slice(0, 5);
    localStorage.setItem("ipSearches", JSON.stringify(searches));
    updateRecentSearches();
  }
}
async function fetchIPData(ip = "") {
  showLoader();
  try {
    const response = await fetch(`https://api.ipgeolocation.io/ipgeo?apiKey=${API_KEY}&ip=${ip}`);
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    const data = await response.json();
    
    ipDisplay.textContent = data.ip;
    locationDisplay.textContent = `${data.city}, ${data.country_name}`;
    ispDisplay.textContent = data.isp;
    
    initMap(data.latitude, data.longitude);
    document.getElementById("ip-info").style.opacity = "1";
    
    if (ip) saveSearch(ip);
  } catch (error) {
    errorDisplay.textContent = `Error: ${error.message}`;
    console.error(error);
  } finally {
    hideLoader();
  }
}
updateRecentSearches();
fetchIPData();
searchBtn.addEventListener("click", () => {
  const ip = ipInput.value.trim();
  if (ip) fetchIPData(ip);
});
recentBtn.addEventListener("mouseenter", () => {
  recentList.style.opacity = "1";
  recentList.style.visibility = "visible";
  recentList.style.transform = "translateY(0)";
});

recentBtn.addEventListener("mouseleave", () => {
  setTimeout(() => {
    if (!recentList.matches(":hover")) {
      recentList.style.opacity = "0";
      recentList.style.visibility = "hidden";
      recentList.style.transform = "translateY(10px)";
    }
  }, 200);
});

recentList.addEventListener("mouseleave", () => {
  recentList.style.opacity = "0";
  recentList.style.visibility = "hidden";
  recentList.style.transform = "translateY(10px)";
});