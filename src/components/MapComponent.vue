vue
<template>
    <div>
        <v-toolbar flat>
            <v-toolbar-title>Настройки маршрута</v-toolbar-title>
     
            <v-btn icon @click="togglePanel">
                <v-icon>{{ panelVisible ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
            </v-btn>
        </v-toolbar>

        <div v-if="panelVisible" :class="'d-flex' + ($vuetify.display.xs ? 'flex-column pb-4' : '')">
            <v-checkbox-btn v-model="tracks" :label="`Новый маршрут`"></v-checkbox-btn>
            <v-btn flat class="mr-2" @click="loadRoute">Загрузить маршрут из GPX</v-btn>
            <div v-if="markers.length > 2" :class="`d-flex ` + ($vuetify.display.xs ? 'flex-column' : '')">
                <v-btn flat @click="saveRoute" class="mr-2">Сохранить маршрут</v-btn>
                <v-text-field v-model="trackName" label="Название маршрута" class="mr-2" variant="outlined"
                    hide-details="auto" density="compact" width="200"></v-text-field>
                <v-btn flat @click="removeLastPoint" class="mr-2">Удалить последнюю точку</v-btn>
            </div>
            <v-checkbox-btn v-model="joinTracks" :label="`Объединять треки`"></v-checkbox-btn>
            {{ calculateDistance }}
        </div>        
        <div ref="mapContainer" class="dialogformap"></div>


        <v-progress-circular v-if="loading" indeterminate color="primary" class="loading-spinner"></v-progress-circular>
    </div>
</template>

<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { saveAs } from 'file-saver';
// import { marker } from 'leaflet';

export default {
    name: 'MapComponent',
    props: {
        coords: {
            type: Array,
            default: () => [45.049, 41.956],
        },
        layer: {
            type: String,
            default: () => 'openstreetmap',
        },
    },
    data() {
        return {
            tracks:false,
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
    computed:{
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

            L.tileLayer(`https://{s}.tile.${this.layer}.org/{z}/{x}/{y}.png`, {
                maxZoom: 17,
                attribution: `&copy; <a href="https://${this.layer}.org/copyright">OpenTopoMap</a> contributors`,
            }).addTo(this.map);

            L.marker(this.coords, this.markerOptions).addTo(this.map).bindPopup(`Координаты: ${this.coords[0]}, ${this.coords[1]}`).openPopup();

            this.map.on('click', (e) => {
                const { lat, lng } = e.latlng;
                if (!this.tracks && this.markers.length === 0) {
                    this.$emit('updateCoords', { lat: lat.toFixed(3), lon: lng.toFixed(3) });
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
    },
    watch: {
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
.leaflet-bottom.leaflet-right{
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


</style>