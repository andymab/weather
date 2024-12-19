vue
<template>
    <div>
        <v-toolbar flat>
            <v-toolbar-title>Настройки маршрута <span v-if="route.length > 1">{{ calculateDistance
                    }}</span></v-toolbar-title>

            <v-btn icon @click="togglePanel">
                <v-icon>{{ panelVisible ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
            </v-btn>
        </v-toolbar>

        <div v-if="panelVisible" class="settings-panel">
            <v-col>
                <p>Слои </p>
                <v-radio-group density="comfortable" class="mt-2" v-model="mapslayer">
                    <v-radio v-for="layer in mapsLayerPath" :label="layer.label" :value="layer"></v-radio>
                </v-radio-group>
            </v-col>
            <v-col>
                <v-checkbox-btn v-model="tracks" :label="`Новый маршрут`"></v-checkbox-btn>
                <v-btn v-if="markers.length > 2" flat @click="removeLastPoint" class="mr-2">Удалить последнюю
                    точку</v-btn>
            </v-col>
            <v-col>
                <v-btn flat class="mr-2" @click="loadRoute">Загрузить маршрут из GPX</v-btn>
                <div v-if="markers.length > 2" class="d-flex flex-column">
                    <v-text-field v-model="trackName" label="Название маршрута" class="mt-4" variant="outlined"
                        hide-details="auto" density="compact"></v-text-field>
                    <v-btn flat @click="saveRoute" class="mt-2">Сохранить маршрут</v-btn>

                </div>
                <v-checkbox-btn v-model="joinTracks" :label="`Объединять треки`"></v-checkbox-btn>
            </v-col>




        </div>
        <div ref="mapContainer" class="dialogformap"></div>


        <v-progress-circular v-if="loading" indeterminate color="primary" class="loading-spinner"></v-progress-circular>
    </div>
</template>

<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { saveAs } from 'file-saver';
import polyline from '@mapbox/polyline';

import axios from 'axios';

export default {
    name: 'MapComponent',
    props: {
        coords: {
            type: Array,
            default: () => [45.049, 41.956],
        },
    },
    data() {
        return {
            mapsLayerPath: {
                openstreetmap: { label: 'openstreetmap', path: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' },
                opentopomap: { label: 'Opentopomap', path: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png' },

                thunderforest: { label: 'Thunderforest', path: 'https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png' },
                thunderforest1: { label: 'Thunderforest outdoors', path: 'https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png' },
            },
            mapslayer: { label: 'openstreetmap', path: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' },
            tracks: false,
            panelVisible: false,
            trackName: '',
            map: null,
            markers: [], // Массив для хранения ссылок на маркеры
            joinTracks: false,
            markerOptions: {
                draggable: true,
                icon: L.divIcon({
                    className: 'custom-marker',
                    html: `<div style="background-color: #ff7800; border-radius: 50%; width: 10px; height: 10px;"></div>`,
                    iconSize: [10, 10]
                })
            },
            route: [],
            polyline: null,
            loading: false,

        };
    },
    computed: {
        calculateDistance() {
            let totalDistance = 0;
            for (let i = 0; i < this.route.length - 1; i++) {
                const pointA = L.latLng(this.route[i]);
                const pointB = L.latLng(this.route[i + 1]);
                totalDistance += pointA.distanceTo(pointB); // Расстояние в метрах
            }
            return `${totalDistance.toFixed(2)}м`; // Возвращает общее расстояние
        },
    },
    mounted() {
        this.initializeMap();
        this.addMarkersAndRoute();

    },
    methods: {
        togglePanel() {
            this.panelVisible = !this.panelVisible; // Переключаем состояние видимости панели
        },
        initializeMap() {
            this.map = L.map(this.$refs.mapContainer).setView(this.coords, 15);
            this.map.on('zoomend', () => {
                this.updateMarkers(); // Обновляем маркеры при изменении масштаба
            });

            L.tileLayer(this.mapslayer.path, {
                maxZoom: 17,
                attribution: `&copy; <a href="https://${this.mapslayer.label}/copyright">OpenTopoMap</a> contributors`,
            }).addTo(this.map);

            L.marker(this.coords, this.markerOptions).addTo(this.map).bindPopup(`Координаты: ${this.coords[0]}, ${this.coords[1]}`).openPopup();




            this.map.on('click', (e) => {
                const { lat, lng } = e.latlng;
                if (!this.tracks && this.markers.length === 0) {
                    this.$emit('updateCoords', { lat: lat, lon: lng });
                } else {
                    this.addMarker(lat, lng);
                    this.redrawRoute(); // Перерисовываем линию
                }
            });
        },
        addMarker(lat, lng) {
            const marker = L.marker([lat, lng], this.markerOptions).addTo(this.map);
            this.markers.push(marker);

            marker.on('dragend', (event) => {
                // const marker = event.target;
                const position = marker.getLatLng();

                // Обновляем координаты в вашем массиве маршрута
                const index = this.route.findIndex(coord => coord[0] === lat && coord[1] === lng);
                if (index !== -1) {
                    this.route[index] = [position.lat, position.lng]; // Обновляем координаты
                }
                // Перерисовываем линию
                this.redrawRoute();
            });
            // Добавляем координаты в маршрут
            this.route.push([lat, lng]);
        },
        redrawRoute() {
            // Удаляем старую полилинию, если она существует
            if (this.polyline) {
                this.map.removeLayer(this.polyline);
            }
            // Создаем новую полилинию с обновленными координатами
            this.polyline = L.polyline(this.route, { color: 'blue' }).addTo(this.map);
            // Обновляем маркеры, если нужно

        },
        updateMarkers() {
            // Обновляем позиции маркеров
            this.markers.forEach((marker, index) => {
                if (this.route[index]) {
                    marker.setLatLng(this.route[index]); // Устанавливаем новую позицию маркера
                }
            });
        },
        saveRoute() {
            if (this.route.length === 0) {
                alert("Маршрут пуст!");
                return;
            }
            let gpxData = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Leaflet GPX Export">
    <trk>
        <name>${this.trackName}</name>
        <trkseg>`;
            this.route.forEach(coord => {
                gpxData += `
            <trkpt lat="${coord[0]}" lon="${coord[1]}"></trkpt>`;
            });
            gpxData += `
        </trkseg>
    </trk>
</gpx>`;
            const blob = new Blob([gpxData], { type: "application/gpx+xml" });
            saveAs(blob, `${this.trackName}.gpx`);
        },
        loadRoute() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.gpx';
            input.onchange = async (event) => {
                const file = event.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (e) => {
                    const contents = e.target.result;
                    this.parseGPX(contents);
                };
                reader.readAsText(file);
            };
            input.click();
        },
        parseGPX(gpxData) {
            this.loading = true;
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(gpxData, "application/xml");
            this.trackName = xmlDoc.getElementsByTagName("name")[0].textContent;
            const trackPoints = xmlDoc.getElementsByTagName("trkpt");
            this.route = [];
            if (this.polyline && !this.joinTracks) {
                this.map.removeLayer(this.polyline);
                this.polyline = null;
            }
            for (let i = 0; i < trackPoints.length; i++) {
                const lat = parseFloat(trackPoints[i].getAttribute("lat"));
                const lon = parseFloat(trackPoints[i].getAttribute("lon"));
                this.addMarker(lat, lon);
            }
            this.redrawRoute();
            // Обновляем позиционирование карты
            if (this.route.length > 0) {
                const bounds = L.latLngBounds(this.route.map(coord => L.latLng(coord[0], coord[1])));
                this.map.fitBounds(bounds);
            }
            this.loading = false;
        },
        removeLastPoint() {
            if (this.route.length > 0) {
                this.route.pop();
                if (this.polyline) {
                    this.polyline.setLatLngs(this.route);
                    if (this.route.length === 0) {
                        this.map.removeLayer(this.polyline);
                        this.polyline = null;
                    }
                }
                alert("Последняя точка удалена.");
            } else {
                alert("Маршрут пуст!");
            }
        },
        addMarkersAndRoute() {
            // Пример двух точек
            const pointA = { lat: 44.24739708818783, lon: 39.2643964290619 }; // Первая точка
            const pointB = { lat: 44.24526050089643, lon:  39.29749488830567}; // Вторая точка

            // Добавляем маркеры на карту
            L.marker([pointA.lat, pointA.lon]).addTo(this.map).bindPopup('Точка A').openPopup();
            L.marker([pointB.lat, pointB.lon]).addTo(this.map).bindPopup('Точка B').openPopup();

            // Запрашиваем маршрут
            this.getRoute(pointA, pointB);
        },

        getRoute(start, end, mode = 'walking') {
            this.loading = true;

            // Запрос к OSRM API для получения маршрута
            const url = `http://router.project-osrm.org/route/v1/walking/${start.lon},${start.lat};${end.lon},${end.lat}?overview=full`;
            //машины http://router.project-osrm.org/route/v1/driving/${start.lon},${start.lat};${end.lon},${end.lat}?overview=full
            //пешеходы            http://router.project-osrm.org/route/v1/walking/${start.lon},${start.lat};${end.lon},${end.lat}?overview=full
            //велосипедисты       http://router.project-osrm.org/route/v1/cycling/${start.lon},${start.lat};${end.lon},${end.lat}?overview=full


            axios.get(url)
                .then(response => {
                    //const route = response.data.routes[0].geometry.coordinates;
                    const encodedPolyline = response.data.routes[0].geometry;
                    const decodedRoute = polyline.decode(encodedPolyline); // Декодируем полилинию
                    this.route = decodedRoute.map(coord => [coord[0], coord[1]]);

                    // Отрисовка маршрута на карте
                    this.redrawRoute();
                })
                .catch(error => {
                    console.error("Ошибка при получении маршрута:", error);
                })
                .finally(() => {
                    this.loading = false;
                });
        },
//         getRoute(start, end, mode = 'foot') {
//   this.loading = true;
//НУЖЕН API OpenRouteService
//   // Формируем URL для OpenRouteService API
//   const apiKey = 'YOUR_API_KEY'; // Замените на ваш ключ API OpenRouteService
//   const url = `https://api.openrouteservice.org/v2/directions/${mode}?start=${start.lon},${start.lat}&end=${end.lon},${end.lat}`;

//   axios.get(url, {
//     headers: {
//       'Authorization': apiKey,
//       'Content-Type': 'application/json'
//     }
//   })
//     .then(response => {
//       // Проверяем наличие маршрута
//       if (response.data.routes.length > 0) {
//         const route = response.data.routes[0]; // Получаем первый маршрут
//         const decodedRoute = route.geometry.coordinates; // Получаем координаты маршрута

//         // Преобразуем в формат [lat, lon]
//         this.route = decodedRoute.map(coord => [coord[1], coord[0]]); // Обратите внимание на порядок: [lat, lon]

//         // Отрисовка маршрута на карте
//         this.redrawRoute();
//       } else {
//         console.error("Маршрут не найден или ошибка в запросе");
//       }
//     })
//     .catch(error => {
//       console.error("Ошибка при получении маршрута:", error);
//     })
//     .finally(() => {
//       this.loading = false;
//     });
// }

    },
    watch: {
        mapslayer(newMapslayer) {

            // Удаляем предыдущий слой, если он существует
            if (this.currentLayer) {
                this.map.removeLayer(this.currentLayer);
            }


            // Создаём новый слой и добавляем его на карту
            this.currentLayer = L.tileLayer(newMapslayer.path, {
                maxZoom: 17,
                attribution: `&copy; <a href="https://${newMapslayer.label}/copyright">${newMapslayer.label}</a> contributors`,
            }).addTo(this.map);


        },
        coords(newCoords) {
            if (this.map) {
                this.map.setView(newCoords, 17);
                L.marker(newCoords, this.markerOptions).addTo(this.map).bindPopup(`Координаты: ${newCoords[0]}, ${newCoords[1]}`).openPopup();
            }
        },
    },
};
</script>

<style>
.leaflet-bottom.leaflet-right {
    opacity: 0;
}
</style>
<style scoped>
.dialogformap {
    height: calc(100vh - 140px);
}

.loading-spinner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}


.settings-panel {
    position: absolute;
    right: 30px;
    max-width: 360px;
    z-index: 1000;
    /* Установите нужный z-index */
    background-color: white;
    /* Добавьте фон, если необходимо */
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    /* Добавьте тень для лучшего визуального эффекта */
    padding: 16px;
    /* Добавьте отступы, если необходимо */
}
</style>