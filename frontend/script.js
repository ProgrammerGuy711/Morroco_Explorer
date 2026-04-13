const API = "http://localhost:5000";

const map = L.map('map', {
    zoomControl: true,
    attributionControl: true
}).setView([29.0, -8.0], 5);

// =====================================================
// OFFLINE TILE LAYER
// Tiles are served from your local folder: frontend/tiles/{z}/{x}/{y}.png
// Downloaded using download_tiles.py (CartoDB source)
// =====================================================
L.tileLayer('./tiles/{z}/{x}/{y}.png', {
    attribution: '© CartoDB © OpenStreetMap contributors',
    maxZoom: 10,
    minZoom: 4
}).addTo(map);

const redIcon = L.divIcon({
    className: '',
    html: `<div style="
        width:16px; height:16px;
        background:#C1272D;
        border: 3px solid #8B1A1F;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -12]
});

const goldIcon = L.divIcon({
    className: '',
    html: `<div style="
        width:18px; height:18px;
        background:#D4A017;
        border: 3px solid #b8860b;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -12]
});

let allCitiesData = {};
let activeMarkers = [];
let currentFilter = 'all';
let searchTerm = '';

async function init() {
    try {
        const response = await fetch(`${API}/cities/all`);

        if (!response.ok) throw new Error(`API error: ${response.status}`);

        allCitiesData = await response.json();

        const total = Object.keys(allCitiesData).length;
        const saharan = Object.values(allCitiesData).filter(c => c.saharan).length;
        document.getElementById('total-count').textContent = total;
        document.getElementById('saharan-count').textContent = saharan;

        updateDisplay();

    } catch (err) {
        console.error('Failed to load cities:', err);
        document.getElementById('loading').innerHTML = `
            <p style="color:#C1272D; text-align:center; padding: 20px;">
                ⚠️ Could not connect to the API.<br>
                <small>Make sure the Flask server is running at ${API}</small>
            </p>
        `;
        return;
    }

    const loader = document.getElementById('loading');
    loader.style.opacity = '0';
    setTimeout(() => loader.style.display = 'none', 400);
}

function renderMarkers(citiesToShow) {
    activeMarkers.forEach(m => map.removeLayer(m));
    activeMarkers = [];

    for (const [, city] of Object.entries(citiesToShow)) {
        const icon = city.saharan ? goldIcon : redIcon;

        const marker = L.marker(
            [city.coordinates.lat, city.coordinates.lng],
            { icon }
        )
        .addTo(map)
        .bindPopup(`<strong>${city.name}</strong><br><small>${city.region}</small>`);

        marker.on('click', () => {
            showCityDetail(city);
            if (window.innerWidth < 900) {
                document.querySelector('.info-panel').scrollIntoView({ behavior: 'smooth' });
            }
        });

        activeMarkers.push(marker);
    }
}

function renderCityCards(citiesToShow) {
    const container = document.getElementById('city-cards');
    container.innerHTML = '';

    for (const [, city] of Object.entries(citiesToShow)) {
        const card = document.createElement('div');
        card.className = `city-card${city.saharan ? ' saharan-card' : ''}`;
        card.innerHTML = `
            <div class="city-card-name">${city.name}</div>
            <div class="city-card-region">${city.region}</div>
            <div class="city-card-pop">👥 ${city.population.toLocaleString()}</div>
        `;
        card.addEventListener('click', () => {
            showCityDetail(city);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        container.appendChild(card);
    }
}

function showCityDetail(city) {
    document.getElementById('default-state').classList.add('hidden');
    const detail = document.getElementById('city-detail');
    detail.classList.remove('hidden');

    const badge = document.getElementById('city-badge');
    badge.textContent = city.saharan ? '🏜 Saharan Region' : '🏙 Northern City';
    badge.className = `city-badge${city.saharan ? ' saharan' : ''}`;

    document.getElementById('city-name').textContent = city.name;
    document.getElementById('city-region').textContent = `📍 ${city.region}`;
    document.getElementById('city-description').textContent = city.description;
    document.getElementById('city-population').textContent = city.population.toLocaleString();
    document.getElementById('city-founded').textContent = city.founded;
    document.getElementById('city-language').textContent = city.language;
    document.getElementById('city-economy').textContent = city.economy;

    map.flyTo([city.coordinates.lat, city.coordinates.lng], 8, {
        animate: true,
        duration: 1.2
    });
}

function showDefaultState() {
    document.getElementById('city-detail').classList.add('hidden');
    document.getElementById('default-state').classList.remove('hidden');
    map.flyTo([29.0, -8.0], 5, { animate: true, duration: 1.2 });
}

function searchCities(term) {
    searchTerm = term.toLowerCase();
    updateDisplay();
}

function updateDisplay() {
    let filtered = allCitiesData;
    if (currentFilter === 'saharan') {
        filtered = Object.fromEntries(
            Object.entries(allCitiesData).filter(([_, city]) => city.saharan)
        );
    }
    if (searchTerm) {
        filtered = Object.fromEntries(
            Object.entries(filtered).filter(([_, city]) => 
                city.name.toLowerCase().includes(searchTerm) ||
                city.region.toLowerCase().includes(searchTerm)
            )
        );
    }

    renderMarkers(filtered);
    renderCityCards(filtered);
    showDefaultState();
}

function filterCities(filter) {
    currentFilter = filter;

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });

    updateDisplay();
}

init();
