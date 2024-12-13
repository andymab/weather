vue
<template>
    <div>
        <div ref="mapContainer" class="dialogformap"></div>
        <div class="d-flex">
            <div v-if="tracks">
                <button @click="saveRoute" class="mr-4">Сохранить маршрут</button>
                <button @click="removeLastPoint" class="mr-4">Удалить последнюю точку</button>
            </div>
            <button @click="loadRoute">Загрузить маршрут из GPX</button>
        </div>
        <v-progress-circular v-if="loading" indeterminate color="primary" class="loading-spinner"></v-progress-circular>
    </div>
</template>

<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { saveAs } from 'file-saver';

export default {
    props: {
        coords: {
            type: Array,
            default: () => [45.049, 41.956],
        },
        layer: {
            type: String,
            default: () => 'openstreetmap',
        },
        tracks: {
            type: Boolean,
            default: () => false,
        },
    },
    data() {
        return {
            map: null,
            marker: null,
            marketOptions: {
                radius: 4,
                fillColor: "#ff7800",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8,
            },
            route: [],
            polyline: null,
            loading: false,
        };
    },
    mounted() {
        this.initializeMap();
    },
    methods: {
        initializeMap() {
            this.map = L.map(this.$refs.mapContainer).setView(this.coords, 15);
            L.tileLayer(`https://{s}.tile.${this.layer}.org/{z}/{x}/{y}.png`, {
                maxZoom: 17,
                attribution: `&copy; <a href="https://${this.layer}.org/copyright">OpenTopoMap</a> contributors`,
            }).addTo(this.map);

            this.marker = L.circleMarker(this.coords, this.marketOptions).addTo(this.map).bindPopup(`Координаты: ${this.coords[0]}, ${this.coords[1]}`).openPopup();

            this.map.on('click', (e) => {
                const { lat, lng } = e.latlng;
                if (!this.tracks) {
                    this.$emit('updateCoords', { lat: lat.toFixed(3), lon: lng.toFixed(3) });
                } else {
                    this.route.push([lat, lng]);
                }
                this.addMarker(lat, lng);
                this.drawRoute(lat, lng);
            });
        },
        addMarker(lat, lng) {
            L.circleMarker([lat, lng], this.marketOptions).addTo(this.map);
        },
        drawRoute(lat, lng) {
            if (this.polyline) {
                this.polyline.addLatLng([lat, lng]);
            } else {
                this.polyline = L.polyline(this.route, { color: 'blue' }).addTo(this.map);
            }
            if (this.route.length > 1) {
                L.polyline(this.route, { color: 'blue' }).addTo(this.map);
            }
        },
        saveRoute() {
            if (this.route.length === 0) {
                alert("Маршрут пуст!");
                return;
            }
            let gpxData = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Leaflet GPX Export">
    <trk>
        <name>My Route</name>
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
            saveAs(blob, "route.gpx");
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
            const trackPoints = xmlDoc.getElementsByTagName("trkpt");
            this.route = [];
            if (this.polyline) {
                this.map.removeLayer(this.polyline);
                this.polyline = null;
            }
            for (let i = 0; i < trackPoints.length; i++) {
                const lat = parseFloat(trackPoints[i].getAttribute("lat"));
                const lon = parseFloat(trackPoints[i].getAttribute("lon"));
                this.route.push([lat, lon]);
                this.addMarker(lat, lon);
            }
            this.polyline = L.polyline(this.route, { color: 'blue' }).addTo(this.map);
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
                if (this.marker) {
                    this.marker.setLatLng(newCoords);
                    this.marker.bindPopup(`Координаты: ${newCoords[0]}, ${newCoords[1]}`).openPopup();
                } else {
                    this.marker = L.marker(newCoords).addTo(this.map)
                        .bindPopup(`Координаты: ${newCoords[0]}, ${newCoords[1]}`)
                        .openPopup();
                }
            }
        },
    },
};
</script>

<style scoped>
.dialogformap {
    height: calc(100vh - 130px);
}
.loading-spinner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
</style>