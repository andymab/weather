vue
<template>
    <div style="position: relative;">
        <v-toolbar flat>
            <v-toolbar-title>Настройки маршрута <span v-if="route.length > 1">{{ calculateDistance
                    }}</span></v-toolbar-title>

            <v-btn icon @click="togglePanel">
                <v-icon>{{ panelVisible ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
            </v-btn>
        </v-toolbar>

        <div v-if="panelVisible" class="settings-panel">
            <v-tabs v-model="tab" background-color="transparent">
                <v-tab value="layer"> Слой карты</v-tab>
                <v-tab value="custom-track"> Маршрут </v-tab>
            </v-tabs>

            <v-tabs-window v-model="tab">
                <v-tabs-window-item value="layer">
                    <SelectLayer @changeLayer="selectLayer" />
                </v-tabs-window-item>
                <v-tabs-window-item value="custom-track">
                    <v-checkbox-btn v-model="tracks" :label="`Режим редактирования`"></v-checkbox-btn>
                    <div v-if="markers.length > 1">
                        <v-checkbox-btn v-model="autotrack" :label="`Проложить автоматически для:`"></v-checkbox-btn>
                        <div v-if="autotrack" class="d-flex flex-wrap">
                            <TrackMode @changeMode="selectMode" />
                        </div>
                        <div v-if="autotrackPropertys.summary" class="mb-2">
                            <v-alert :text="`${distance} ${times} ${calculateAverageSpeed}`" type="info"></v-alert>
                        </div>
                        <div v-if="elevations.length > 0" class="mb-2">
                            <v-alert :text="`${calculateElevation}`" type="warning"></v-alert>
                        </div>


                    </div>
                    <v-btn v-if="markers.length > 2" flat @click="removeLastPoint" class="">Удалить последнюю
                        точку</v-btn>
                    <v-btn v-if="markers.length > 0" flat @click="removeAllPoints" class="">Удалить все точки</v-btn>

                    <v-btn v-if="markers.length > 0" flat @click="removeAllMarkers" class="">Удалить все маркеры</v-btn>
                    <v-col>
                        <v-btn flat class="mr-2" @click="loadRoute">Загрузить маршрут из GPX</v-btn>
                        <div v-if="markers.length > 2" class="d-flex flex-column">
                            <v-text-field v-model="trackName" label="Название маршрута" class="mt-4" variant="outlined"
                                hide-details="auto" density="compact"></v-text-field>
                            <v-btn flat @click="saveRoute" class="mt-2">Сохранить маршрут</v-btn>

                        </div>
                        <v-checkbox-btn v-model="joinTracks" :label="`Объединять треки`"></v-checkbox-btn>
                    </v-col>
                </v-tabs-window-item>
            </v-tabs-window>

        </div>
        <div ref="mapContainer" class="dialogformap"></div>
        <div v-show="elevations.length > 0" ref="containerheights"  class="elevations">  </div>

        <Notification ref="notification" />
        <v-progress-circular v-if="loading" indeterminate color="primary" class="loading-spinner"></v-progress-circular>
    </div>
</template>

<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { saveAs } from 'file-saver';
import polyline from '@mapbox/polyline';

import TrackMode from './MapComponent/TrackMode.vue';
import SelectLayer from './MapComponent/SelectLayer.vue';
import Notification from './Notification.vue';


import Highcharts from 'highcharts';

import axios from 'axios';

export default {
    name: 'MapComponent',
    components: {
        TrackMode, Notification, SelectLayer,
    },
    props: {
        coords: {
            type: Array,
            default: () => [45.049, 41.956],
        },
    },
    data() {
        return {
            chart: null,
            tab: 'layer',
            autotrack: false,

            selectedMode: 'foot-walking',
            selectedlayer: { label: 'openstreetmap', path: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' },


            autotrackPropertys: {}, //свойства участков трека созданых автоматически
            elevations: [],
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
        distance() {
            if (this.autotrackPropertys.summary) {
                return `${(this.autotrackPropertys.summary.distance / 1000).toFixed(2)} км`;
            }
        },
        times() {
            if (this.autotrackPropertys.summary) {
                const seconds = this.autotrackPropertys.summary.duration;
                const hours = Math.floor(seconds / 3600); // Получаем целые часы
                const minutes = Math.floor((seconds % 3600) / 60); // Получаем оставшиеся минуты

                return `${hours}:${minutes} час`;
            }
        },
        calculateAverageSpeed() {
            if (this.autotrackPropertys.summary) {
                const distanceInKilometers = this.autotrackPropertys.summary.distance / 1000;
                const timeInHours = this.autotrackPropertys.summary.duration / 3600;

                // Вычисляем среднюю скорость
                return `${(distanceInKilometers / timeInHours).toFixed(0)} км/ч`; // Средняя скорость в км/ч
            }
        },
        calculateDistance() {
            let totalDistance = 0;
            for (let i = 0; i < this.route.length - 1; i++) {
                const pointA = L.latLng(this.route[i]);
                const pointB = L.latLng(this.route[i + 1]);
                totalDistance += pointA.distanceTo(pointB); // Расстояние в метрах
            }
            return `${totalDistance.toFixed(2)}м`; // Возвращает общее расстояние
        },
        calculateElevation() {
            if (this.elevations.length > 0) {
                const minElevation = Math.min(...this.elevations);
                const maxElevation = Math.max(...this.elevations);
                const elevationDifference = maxElevation - minElevation;
                return `${elevationDifference}м : ${minElevation} - ${maxElevation}м  `;
            }
        }
    },
    mounted() {
        this.initializeMap();
        this.initializeChart();
        this.addChartEvents();
    },
    methods: {
        initializeChart() {
            this.chart = Highcharts.chart(this.$refs.containerheights, {
                chart: {
                    type: 'line',
                },
                title: {
                    text: ''
                },
                xAxis: {
                    title: { text: '' },
                    categories: ['1','4','12'] // Изначально пустой массив категорий
                },
                yAxis: {
                    title: { text: '' }
                },
                series: [{
                    name: 'Высота',
                    data: [1,4,12] // Изначально пустой массив данных
                }]
            });



        },
        addChartEvents() {
            // Добавляем событие клика по контейнеру графика
            Highcharts.addEvent(this.chart.container, 'click', (e) => {
                e = this.chart.pointer.normalize(e); // Нормализуем координаты события
                console.log(`C ${e.point.index}`);
                console.log(`Clicked chart at ${e.chartX}, ${e.chartY}`);
            });

        },
        addNotification(message, succes) {
            this.$refs.notification.notify(message, succes);
        },
        selectLayer(mode) {
            this.selectedlayer = mode;
        },
        selectMode(mode) {
            this.selectedMode = mode;
            // Получаем первый маркер
            // const firstMarker = this.markers[0];
            // const firstLatLng = firstMarker.getLatLng(); // Получаем координаты первого маркера
            // const firstCoordinates = { lat: firstLatLng.lat, lon: firstLatLng.lng };
            //пред последний
            const firstMarker = this.markers[this.markers.length - 2];
            const firstLatLng = firstMarker.getLatLng(); // Получаем координаты первого маркера
            const firstCoordinates = { lat: firstLatLng.lat, lon: firstLatLng.lng };

            // Получаем последний маркер
            const lastMarker = this.markers[this.markers.length - 1];
            const lastLatLng = lastMarker.getLatLng(); // Получаем координаты последнего маркера
            const lastCoordinates = { lat: lastLatLng.lat, lon: lastLatLng.lng };

            console.log('Координаты первого маркера:', firstCoordinates);
            console.log('Координаты последнего маркера:', lastCoordinates);
            this.getRouteOpenroute(firstCoordinates, lastCoordinates, mode);
        },
        togglePanel() {
            this.panelVisible = !this.panelVisible; // Переключаем состояние видимости панели
        },
        initializeMap() {
            this.map = L.map(this.$refs.mapContainer).setView(this.coords, 15);
            this.map.on('zoomend', () => {
                this.updateMarkers(); // Обновляем маркеры при изменении масштаба
            });

            L.tileLayer(this.selectedlayer.path, {
                maxZoom: 17,
                attribution: `&copy; <a href="https://${this.selectedlayer.label}/copyright">OpenTopoMap</a> contributors`,
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
                this.$refs.notification.notify("Последняя точка удалена.", 'succes');
            } else {
                this.$refs.notification.notify("Маршрут пуст!", 'error');
            }
        },
        removeAllPoints() {
            if (this.route.length > 0) {
                this.route = []; // Очищаем массив маршрута
                if (this.polyline) {
                    this.polyline.setLatLngs(this.route); // Обновляем полилинию
                    this.map.removeLayer(this.polyline); // Удаляем полилинию с карты
                    this.polyline = null; // Сбрасываем ссылку на полилинию
                }
                this.$refs.notification.notify("Все точки удалены.", 'succes');
            } else {
                this.$refs.notification.notify("Маршрут пуст!", 'error');
            }
        },
        removeAllMarkers() {
            // Проверяем, есть ли маркеры для удаления
            if (this.markers.length > 0) {
                // Проходим по всем маркерам и удаляем их с карты
                this.markers.forEach(marker => {
                    this.map.removeLayer(marker);
                });

                // Очищаем массив маркеров
                this.markers = [];
                this.$refs.notification.notify("Все маркеры удалены.", 'succes');
            } else {
                this.$refs.notification.notify("Нет маркеров для удаления.", 'error');
            }
        },
        getRouteOpenroute(start, end, mode = 'foot-walking') {
            this.loading = true;

            // Формируем URL для OpenRouteService API
            const apiKey = '5b3ce3597851110001cf624807c4aca3606842eda3cbb1e7dc01066b'; // Замените на ваш ключ API OpenRouteService
            const url = `https://api.openrouteservice.org/v2/directions/${mode}?start=${start.lon},${start.lat}&end=${end.lon},${end.lat}`;

            axios.get(url, {
                headers: {
                    'Authorization': apiKey,
                    'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    // Проверяем наличие маршрута
                    if (response.data.features.length > 0) {
                        const route = response.data.features[0]; // Получаем первый маршрут
                        const decodedRoute = route.geometry.coordinates; // Получаем координаты маршрута
                        // Преобразуем в формат [lat, lon]
                        this.route = decodedRoute.map(coord => [coord[1], coord[0]]); // Обратите внимание на порядок: [lat, lon]
                        this.autotrackPropertys = response.data.features[0].properties; // Получаем данные о маршруте

                        // Получаем и рисуем данные о высоте пока не рисуем
                        this.getElevationData(this.route);
                        // Отрисовка маршрута на карте
                        this.redrawRoute();
                    } else {
                        console.error("Маршрут не найден или ошибка в запросе");
                    }
                })
                .catch(error => {
                    this.addNotification("Ошибка при получении маршрута:", 'error');
                    console.error("Ошибка при получении маршрута:", error);
                })
                .finally(() => {
                    this.loading = false;
                });
        },

        getElevationData(coordinates) { //запрос высот по координатам
            const elevationUrl = `https://api.open-elevation.com/api/v1/lookup`;

            // Формируем массив запросов к API высоты
            const requests = coordinates.map(coord => ({
                latitude: coord[0],
                longitude: coord[1]
            }));

            axios.post(elevationUrl, { locations: requests },
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            )
                .then(response => {
                    this.elevations = response.data.results.map(result => result.elevation);
                    this.plotElevationProfile(coordinates);
                })
                .catch(error => {
                    console.error("Ошибка при получении данных о высоте:", error);
                });
        },
        highlightRoutePoint(point) {
            console.log('point', point);
            //point.setStyle({ color: 'red', radius: 10 }); // Пример изменения стиля

        },
        unhighlightRoutePoint(point) {
            console.log('point ---', point);
            // point.setStyle({ color: 'blue', radius: 5 });

        },
        plotElevationProfile(coordinates) {  ///подготовка к постороению графика высот
            ///пока не работает
            const chartData = coordinates.map((coord, index) => ({
                x: index,
                y: this.elevations[index] // Высота по индексу
            }));

            // Проверяем, есть ли данные для графика
            if (chartData.length === 0) {
                console.warn('Нет данных для построения графика высот.');
                return; // Выходим из функции, если данные отсутствуют
            }

            this.chart.xAxis[0].setCategories(coordinates.map((_, index) => `${index + 1}`), false); // Обновляем категории
            this.chart.series[0].setData(chartData, true); // Обновляем данные и перерисовываем график


        }
    },
    watch: {
        selectedMode(newselectMode) {
            if (this.route) {
                const pointA = { lat: this.route[0][0], lon: this.route[0][1] }; // Первая точка
                const pointB = { lat: this.route[this.route.length - 1][0], lon: this.route[this.route.length - 1][1] }; // Вторая точка
                this.getRouteOpenroute(pointA, pointB, newselectMode);

            }

        },
        selectedlayer(newLayer) {
            // Удаляем предыдущий слой, если он существует
            if (this.currentLayer) {
                this.map.removeLayer(this.currentLayer);
            }


            // Создаём новый слой и добавляем его на карту
            this.currentLayer = L.tileLayer(newLayer.path, {
                maxZoom: 17,
                attribution: `&copy; <a href="https://${newLayer.label}/copyright">${newLayer.label}</a> contributors`,
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
.highcharts-credits{
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
.elevations{
    position:absolute;
    bottom: 0;
    z-index: 2000;
    height: 200px;
}
</style>