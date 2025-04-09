vue
<template>
    <div style="position: relative;">
        <v-btn rounded="0" class="text-white " :width="$vuetify.display.xs ? '420px' : '380px'" style="position:absolute; right:0; z-index:2000"
            color="light-green" @click="togglePanel">
            Настройки маршрута
            <v-icon :icon="ispanelVisible ? 'mdi-chevron-up' : 'mdi-chevron-down'" end></v-icon>
        </v-btn>


        <div v-if="ispanelVisible" class="settings-panel">
            <!-- <v-card width="360px"> -->
            <v-tabs v-model="tab" background-color="transparent" class="pa-0 ma-0 ">
                <v-tab value="layer" class="tabs-layer-item"> {{ $vuetify.display.xs ? 'Слой' : 'Слой' }} </v-tab>
                <v-tab value="custom-track" class="tabs-layer-item">Маршрут</v-tab>
                <v-tab value="elevations" class="tabs-layer-item">Высоты</v-tab>

            </v-tabs>

            <v-tabs-window v-model="tab" class="pa-0 ma-0">
                <v-tabs-window-item value="layer">
                    <SelectLayer @changeLayer="selectLayer" />
                </v-tabs-window-item>
                <v-tabs-window-item value="custom-track">
                    <div class="d-flex">
                        <v-icon @click="istracks = !istracks" v-tooltip.bottom="`Редактировать`" class="ma-2 "
                            :class="{ 'text-green-accent-3': istracks, ' grey-lighten-2 ': !istracks }">mdi-vector-square-edit</v-icon>
                        <v-icon @click="isautotrack = !isautotrack" :disabled="!istracks"
                            v-tooltip.bottom="`Проложить автоматически`" class="ma-2 "
                            :class="{ 'text-teal-lighten-3': isautotrack, ' grey-lighten-2 ': !isautotrack }">mdi-arrow-decision-auto-outline</v-icon>
                        <v-icon @click="isJoinTracks = !isJoinTracks" :disabled="!istracks"
                            v-tooltip.bottom="`Объединять загруженые треки`" class="ma-2 "
                            :class="{ 'text-green-accent-3': isJoinTracks, ' grey-lighten-2 ': !isJoinTracks }">mdi-group</v-icon>
                        <v-icon @click="isFeatures = !isFeatures" :disabled="!istracks"
                            v-tooltip.bottom="`Загружать Достопримечательности`" class="ma-2 "
                            :class="{ 'text-green-accent-3': isFeatures, ' grey-lighten-2 ': !isFeatures }">mdi-home-map-marker</v-icon>
                        <v-icon @click="isElevations = !isElevations" :disabled="!istracks"
                            v-tooltip.bottom="`Загружать Профиль высот`" class="ma-2 "
                            :class="{ 'text-green-accent-3': isElevations, ' grey-lighten-2 ': !isElevations }">mdi-elevation-rise</v-icon>
                        <v-icon @click="isWeathers = !isWeathers" :disabled="!istracks"
                            v-tooltip.bottom="`Получить погоду`" class="ma-2 " disabled
                            :class="{ 'text-green-accent-3': isWeathers, ' grey-lighten-2 ': !isWeathers }">mdi-weather-partly-cloudy</v-icon>

                    </div>

                    <div v-if="autotrackPropertys.summary || (istracks && markers.length > 1)">
                        <div v-if="isautotrack" class="d-flex flex-wrap">
                            <TrackMode @changeMode="selectMode" />
                        </div>
                        <div v-if="autotrackPropertys.summary" class="mb-2">
                            <v-alert :text="`${distance} ${times} ${calculateAverageSpeed}`" type="info"></v-alert>
                        </div>
                        <div v-if="elevations.length > 0" class="mb-2">
                            <v-alert :text="`${calculateElevation}`" type="warning"></v-alert>
                        </div>
                    </div>

                    <div class="d-flex">
                        <v-icon @click="removeLastPoint" :disabled="markers.length == 0"
                            v-tooltip.bottom="`Удалить последнюю точку`"
                            class="ma-2 text-amber-accent-4">mdi-vector-square-remove</v-icon>
                        <v-icon @click="clearMapEntities" v-tooltip.bottom="`Очистить все`"
                            class="ma-2 text-amber-accent-4"
                            :disabled="markers.length == 0">mdi-delete-forever-outline</v-icon>
                    </div>

                    <div class="d-flex justify-space-around">
                        <div class="d-flex">
                            <v-icon  size="x-large" @click="openSavedRoutes"
                                v-tooltip.bottom="`Сохраненые в сети маршруты`"
                                class="ma-2 text-teal-lighten-3">mdi-web</v-icon>
                            <v-icon size="x-large" @click="loadRouteGPX" v-tooltip.bottom="`Загрузить маршрут (GPX)`"
                                class="ma-2 text-teal-lighten-3">mdi-briefcase-upload-outline</v-icon>
                            <v-icon size="x-large" @click="openDialogFileName(('saveRouteGPX'))"
                                v-tooltip.bottom="`Сохранить маршрут (.GPX)`"
                                class="ma-2 text-teal-lighten-3">mdi-briefcase-download-outline</v-icon>

                        </div>
                        <div class="d-flex">
                            <v-icon size="x-large" @click="loadRouteElevation"
                                v-tooltip.bottom="`Загрузить маршрут c высотами  (JSON)`"
                                class="ma-2 text-teal-lighten-3">mdi-tray-arrow-up</v-icon>
                            <v-icon size="x-large" @click="openDialogFileName('saveRouteElevation')"
                                v-tooltip.bottom="`Выгрузить маршрут с высотами (JSON)`"
                                class="ma-2 text-teal-lighten-3">mdi-tray-arrow-down </v-icon>
                        </div>
                    </div>
                </v-tabs-window-item>
                <v-tabs-window-item value="elevations">
                    <ElevationChart :elevationData="elevationData" :route="route" @addTrackMarker="addTrackMarker"
                        :textdistance="infoForDistance" :textelevation="calculateElevation" />
                </v-tabs-window-item>
            </v-tabs-window>
            <!-- </v-card> -->
        </div>

        <div ref="mapContainer" class="dialogformap"></div>


        <Notification ref="notification" />
        <v-progress-circular v-if="loading" indeterminate color="primary" class="loading-spinner"></v-progress-circular>



        <v-dialog v-model="isdialogFileName" max-width="400">
            <v-card>
                <v-card-title>
                    <span class="headline">Введите имя файла</span>
                </v-card-title>
                <v-card-text>
                    <v-text-field v-model="trackName" label="Название маршрута" required
                        :rules="[v => !!v || 'Это поле обязательно']"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click="executeSave" :disabled="!trackName">Сохранить</v-btn>
                    <v-btn text @click="closeDialogFileName">Отмена</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <UploadDialogPage  ref="UploadDialogPage" :route="routesLocation" :features="features"
            :elevations="elevationsLocation" @updateLoaded="updateLoaded" />

    </div>
</template>

<script>
    import { toRaw } from 'vue';
    import { icons } from './MapComponent/iconsleaflet';
    import { reactive } from 'vue';
    import L from 'leaflet';
    import 'leaflet/dist/leaflet.css';
    import polyline from '@mapbox/polyline';

    import { saveAs } from 'file-saver';


    import TrackMode from './MapComponent/TrackMode.vue';
    import SelectLayer from './MapComponent/SelectLayer.vue';
    import ElevationChart from './MapComponent/ElevationChart.vue';
    import Notification from './Notification.vue';
    import UploadDialogPage from '../Auth/UploadPage.vue';



    import axios from 'axios';

    export default {
        name: 'MapComponent',
        components: {
            TrackMode, Notification, SelectLayer, ElevationChart, UploadDialogPage
        },
        emits: ['changeMode', 'updateCoords'],
        props: {
            coords: {
                type: Array,
                default: () => [45.049, 41.956],
            },
            elevation: {
                type: Number,
            }
        },
        data() {
            return {
                //состояния
                isWeathers: false,
                isFeatures: false,
                isElevations: false,
                isJoinTracks: false,
                istracks: false,
                isdialogFileName: false,
                isautotrack: false,
                ispanelVisible: false,

                chart: null,
                tab: 'layer',

                selectedMode: 'foot-walking',
                selectedlayer: { label: 'Opentopomap', path: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png' },
                currentMarker: null,
                currentLayer: null,

                routesLocation: {},//полученный из файла
                features: [],
                elevationsLocation: [],
                autotrackPropertys: reactive({}), //свойства участков трека созданых автоматически
                elevations: [],
                elevationData: [],
                markers: [], // Массив для хранения ссылок на маркеры
                route: [],


                trackName: '',
                map: null,

                markerOptions: {
                    draggable: true,
                    // zoomAnimation: false,
                    // markerZoomAnimation: false,
                    icon: L.divIcon({
                        className: 'custom-marker',
                        html: `<div style="background-color: #FF9800; border-radius: 50%; width: 10px; height: 10px;"></div>`,
                        iconSize: [10, 10]
                    })
                },

                polyline: null,
                loading: false,
                saveFunction: null,
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
            },
            infoForDistance() {
                if (this.distance && this.times && this.calculateAverageSpeed) {
                    return `${this.distance} ${this.times} ${this.calculateAverageSpeed}`;
                }
                return false;
            }
        },
        mounted() {
            this.initializeMap();
        },
        methods: {
            openSavedRoutes() {
                this.$refs.UploadDialogPage.openDialogMain();
            },
            clearMapEntities() {
                this.markers.forEach(marker => {
                    this.map.removeLayer(marker);
                });
                if (this.polyline) {
                    this.polyline.setLatLngs(this.route); // Обновляем полилинию
                    this.map.removeLayer(this.polyline); // Удаляем полилинию с карты
                    this.polyline = null; // Сбрасываем ссылку на полилинию
                }

                this.routesLocation = {};//полученный из файла
                this.features = [];
                this.elevationsLocation = [];
                this.autotrackPropertys = {}; //свойства участков трека созданых автоматически
                this.elevations = [];
                this.elevationData = [];
                this.markers = []; // Массив для хранения ссылок на маркеры
                this.route = [];


                this.$refs.notification.notify("Очищен clearMapEntities", 'succes');

            },
            initializeMap() {
                this.map = L.map(this.$refs.mapContainer).setView(this.coords, 15);

                // map.on('moveend', () => { //можно но не замечал
                //     this.updateMarkers();
                // });
                this.currentLayer = L.tileLayer(this.selectedlayer.path, {
                    maxZoom: 17,
                    attribution: `&copy; <a href="https://${this.selectedlayer.label}/copyright">OpenTopoMap</a> contributors`,
                }).addTo(this.map);



                this.currentMarker = L.marker(this.coords, this.markerOptions).addTo(toRaw(this.map)).bindPopup(`Координаты: ${parseFloat(this.coords[0]).toFixed(3)}, ${parseFloat(this.coords[1]).toFixed(3)}  <br /> Высота:${this.elevation}м`).openPopup();


                this.map.on('click', (e) => {
                    const { lat, lng } = e.latlng;
                   // console.log(lat, lng, 'lat', 'lon');
                    if (!this.istracks && this.markers.length === 0) {
                        //стоит получить также высоту поверхности
                        this.addMarker(lat, lng);

                        const request_status = this.getElevations();

                        const latitude = lat.toFixed(5);
                        const longitude = lng.toFixed(5);

                        setTimeout(() => {
                            if (this.elevations.length > 0) {
                                this.$emit('updateCoords', { latitude, longitude, elevation: this.elevations[0] });
                            } else {
                                this.clearMapEntities();
                            }
                        }, 1000);

                    } else {
                        // if (this.currentMarker) {
                        //     this.map.removeLayer(this.currentMarker);
                        //     this.currentMarker = null;
                        // }
                        this.addMarker(lat, lng);
                        this.redrawRoute(); // Перерисовываем линию
                    }
                });

                this.map.on('zoomend', () => {
                    this.$nextTick(() => {
                        this.updateMarkers(); // Обновляем маркеры после завершения анимации
                    });
                });
                // this.map.on('moveend', () => {
                //     //if (this.currentMarker && this.currentMarker.isPopupOpen()) {
                //     //     this.map.closePopup(); // Закрываем всплывающее окно, если оно открыто
                //     //  }
                //     this.$nextTick(() => {
                //         this.updateMarkers(); // Обновляем маркеры после завершения анимации
                //     });
                // });

                L.Marker.prototype._animateZoom = function (opt) {
                    // if (!this.map) {
                    //     return;
                    // }
                    const pos = this._map._latLngToNewLayerPoint(this._latlng, opt.zoom, opt.center).round();
                    this._setPos(pos);
                };
            },
            addMarker(lat, lng) {
                this.markerOptions.draggable = false;
                const marker = L.marker([lat, lng], this.markerOptions).addTo(this.map);
                this.markers.push(marker);
                // marker.on('dragend', (event) => {
                //     // const marker = event.target;
                //     const position = marker.getLatLng();

                //     // Обновляем координаты в вашем массиве маршрута
                //     const index = this.route.findIndex(coord => coord[0] === lat && coord[1] === lng);
                //     if (index !== -1) {
                //         this.route[index] = [position.lat, position.lng]; // Обновляем координаты
                //     }
                //     // Перерисовываем линию
                //     this.redrawRoute();
                // });
                // Добавляем координаты в маршрут
                this.route.push([lat, lng]);
            },
            openDialogFileName(func) {
                this.saveFunction = func;
                this.isdialogFileName = true;
            },
            closeDialogFileName() {
                this.isdialogFileName = false;
                this.trackName = ''; // Сбрасываем имя файла
                this.saveFunction = null; // Сбрасываем функци
            },
            executeSave() {
                if (this.trackName && this.saveFunction) {
                    if (this.saveFunction === 'saveRouteGPX') {
                        this.saveRouteGPX();
                    } else if (this.saveFunction === 'saveRouteElevation') {
                        this.saveRouteElevation();
                    }
                    // Закрываем диалог после сохранения
                    this.closeDialogFileName();
                }
            },
            getDuration(duration) {
                // if(duration < 3600){
                //     const minutes = Math.floor((duration % 3600)); // Получаем оставшиеся минуты
                //     return `${minutes} мин`;
                // }
                const hours = Math.floor(duration / 3600); // Получаем целые часы
                const minutes = Math.floor((duration % 3600) / 60); // Получаем оставшиеся минуты
                return `${hours} ч:${minutes} мин`;
            },
            getDistance(distance) {
                if (distance < 1000) {
                    return `${distance.toFixed(2)} м`;
                }
                return `${(distance / 1000).toFixed(2)} км`;
            },
            selectLayer(mode) {
                this.selectedlayer = mode;
            },
            selectMode(mode) {
                this.selectedMode = mode;
                this.features = [];
                this.elevationsLocation = [];

                if (this.markers.length > 1) {
                    const coordinatesArray = this.markers.map(marker => {
                        const latLng = marker.getLatLng(); // Получаем координаты маркера
                        return [latLng.lng, latLng.lat]; // Возвращаем массив с координатами
                    });
                    this.getRouteOpenroutePOST(coordinatesArray, mode);
                }
                return false;
                //пред последний
                const firstMarker = this.markers[this.markers.length - 2];
                const firstLatLng = firstMarker.getLatLng(); // Получаем координаты первого маркера
                const firstCoordinates = { lat: firstLatLng.lat, lon: firstLatLng.lng };

                // Получаем последний маркер
                const lastMarker = this.markers[this.markers.length - 1];
                const lastLatLng = lastMarker.getLatLng(); // Получаем координаты последнего маркера
                const lastCoordinates = { lat: lastLatLng.lat, lon: lastLatLng.lng };

                // console.log('Координаты первого маркера:', firstCoordinates);
                // console.log('Координаты последнего маркера:', lastCoordinates);
                this.getRouteOpenroute(firstCoordinates, lastCoordinates, mode);
            },
            async getRouteOpenroutePOST(coordinates, mode = 'foot-walking') {
                //только для теста
                // const response = await fetch(`/post.json`);
                // const result = await response.json();
                // this.routesLocation = result;
                // this.updateRoute(result);
                // return false;
                // //только для теста
                this.loading = true;
                // Формируем URL для OpenRouteService API
                const apiKey = '5b3ce3597851110001cf624807c4aca3606842eda3cbb1e7dc01066b'; // Замените на ваш ключ API OpenRouteService
                const url = `https://api.openrouteservice.org/v2/directions/${mode}`;

                axios.post(url, {
                    coordinates
                }, {
                    headers: {
                        'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
                        'Authorization': apiKey,
                        'Content-Type': 'application/json; charset=utf-8'
                    }
                })
                    .then(response => {
                        /// if (response.data.features.length > 0) здесь этого нет 
                        if (response.data.routes.length > 0) {
                            this.routesLocation = response.data;
                            this.updateRoute(response.data);
                        } else {
                            console.error("Маршрут не найден или ошибка в запросе");
                        }
                    })
                    .catch(error => {
                        this.message("Ошибка при получении маршрута:", false);
                        console.error("Ошибка при получении маршрута:", error);
                    })
                    .finally(() => {
                        this.loading = false;
                    });


            },
            getRouteOpenroute(start, end, mode = 'foot-walking') {

                this.loading = true;
                // Формируем URL для OpenRouteService API
                const apiKey = '5b3ce3597851110001cf624807c4aca3606842eda3cbb1e7dc01066b'; // Замените на ваш ключ API OpenRouteService
                const url = `https://api.openrouteservice.org/v2/directions/${mode}?start=${start.lon},${start.lat}&end=${end.lon},${end.lat}`;

                axios.get(url, {
                    headers: {
                        'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
                        'Authorization': apiKey,
                        'Content-Type': 'application/json; charset=utf-8'
                    }
                })
                    .then(response => {
                        // Проверяем наличие маршрута
                        if (response.data.features.length > 0) {
                            this.routesLocation = response.data;
                            this.updateRoute(response.data);
                        } else {
                            console.error("Маршрут не найден или ошибка в запросе");
                        }
                    })
                    .catch(error => {
                        this.message("Ошибка при получении маршрута:", false);
                        console.error("Ошибка при получении маршрута:", error);
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            },

            togglePanel() {
                this.ispanelVisible = !this.ispanelVisible; // Переключаем состояние видимости панели
            },

            addTrackMarker(route, elevation) {
                ///маркер на треке который добавляем щелкая по высотам
                this.markerOptions.draggable = false;

                const marker = L.marker([route[0], route[1]], icons.springIcon).addTo(toRaw(this.map)).bindPopup(`Высота: ${elevation}`).openPopup();



                //   const marker = L.marker([route[0], route[1]], this.markerOptions).addTo(this.map);
                this.markers.push(marker);
            },

            redrawRoute() {
                // Удаляем старую полилинию, если она существует
                if (this.polyline) {
                    this.map.removeLayer(this.polyline);
                }
                // Создаем новую полилинию с обновленными координатами
                this.polyline = L.polyline(this.route, { color: '#F57F17' }).addTo(this.map);
                // Обновляем маркеры, если нужно

            },
            message(message, status) {
                let notificationType;

                if (typeof status === undefined || status === true) {
                    notificationType = 'success';
                } else if (status) {
                    notificationType = status;
                } else {
                    notificationType = 'error'; // по умолчанию
                }
                this.$refs.notification.notify(message, notificationType);
            },
            updateMarkers() {
                // Обновляем позиции маркеров
                this.markers.forEach(marker => {
                    marker.update(); // Обновляем положение маркера
                });
                // this.markers.forEach((marker, index) => {
                //     if (this.route[index]) {
                //         marker.setLatLng(this.route[index]); // Устанавливаем новую позицию маркера
                //     }
                // });
            },
            saveRouteGPX() {
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
            loadRouteGPX() {
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
            saveRouteElevation() {
                if (!this.routesLocation || !this.elevationsLocation) {
                    this.message("Вам нечего выгружать", false);
                    return false;
                }
                const jsonData = JSON.stringify({ location: this.routesLocation, elevation: this.elevationsLocation, features: this.features });
                const blob = new Blob([jsonData], { type: "application/json" }, null, 2);
                saveAs(blob, `${this.trackName}.json`);
            },
            updateLoaded(jsonData) {
              //  console.log(jsonData,'jsonData')
                //const jsonData = JSON.parse(contents);
                this.routesLocation = jsonData.location;
                this.elevationsLocation = jsonData.elevation;
                this.features = jsonData.features;
                this.updateRoute(jsonData.location);

            },
            loadRouteElevation() {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = async (event) => {
                    const file = event.target.files[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const contents = e.target.result;
                        try {
                            this.updateLoaded(JSON.parse(contents));


                            //вот здесь сразу запустить отрисовку
                        } catch (error) {
                            this.$refs.notification.notify('Ошибка см. консоль', 'error');
                            console.log(error);
                        }
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
                if (this.polyline && !this.isJoinTracks) {
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
                    const marker = this.markers.pop();
                    this.map.removeLayer(marker)
                    this.updateMarkers();
                    if (this.polyline) {
                        this.polyline.setLatLngs(this.route);
                        // if (this.route.length === 0) {
                        //     this.map.removeLayer(this.polyline);
                        //     this.polyline = null;
                        // }
                    }
                    this.$refs.notification.notify("Последняя точка удалена.", 'succes');
                } else {
                    this.$refs.notification.notify("Маршрут пуст!", 'error');
                }
            },

            handleUploads() { //системная штука позволяющая упростить зависимые части
                const uploadActions = {
                    isElevations: this.getElevations,
                    isFeatures: this.uploadFeatures,
                };

                Object.entries(uploadActions).forEach(([key, action]) => {
                    if (this[key]) {
                        action.call(this); // Вызываем метод в контексте текущего экземпляра
                    }
                });
            },

            handleFeatureAndElevationUpdates() {
                const actions = [
                    {
                        condition: this.features && this.features.length > 0,
                        action: () => this.setMarkerForFeatures(),
                    },
                    {
                        condition: this.elevationsLocation.results,
                        action: () => this.updateElevations(this.elevationsLocation),
                    },
                ];

                for (const { condition, action } of actions) {
                    if (condition) {
                        action();
                    }
                }
            },

            updateRoute(data) {
                //теперь тут два варианта
                if (!data.features) {
                    this.updataRouterFromPost(data);
                    return false;
                }

                ///все что ниже пока оставляем это для другой структуры пприходящим по двум точкам, сейчас не используется фактически
                const route = data.features[0]; // Получаем первый маршрут
                const decodedRoute = route.geometry.coordinates; // Получаем координаты маршрута
                // Преобразуем в формат [lat, lon]
                this.route = decodedRoute.map(coord => [coord[1], coord[0]]); // Обратите внимание на порядок: [lat, lon]
                this.autotrackPropertys = reactive(data.features[0].properties); // Получаем данные о маршруте



                this.handleFeatureAndElevationUpdates();
                this.handleUploads();


                // Отрисовка маршрута на карте
                this.redrawRoute();
            },
            updataRouterFromPost(data) {
                const encodedString = data.routes[0].geometry;
                const decodedCoordinates = polyline.decode(encodedString);
                this.route = decodedCoordinates.map(coord => [coord[0], coord[1]]); // Обратите внимание на порядок: [lat, lon]
                this.autotrackPropertys = reactive(data.routes[0]); // путь пройденый время
                this.redrawRoute(); //рисуем путь уже хорошо
                this.handleFeatureAndElevationUpdates();
                this.handleUploads();
            },
            updateElevations(data) {
                this.elevations = data.results.map(result => result.elevation);
                this.plotElevationProfile();
            },

            setMarkerForFeatures() {

                this.features.forEach(feature => {
                    // Извлекаем координаты
                    const coordinates = feature.geometry.coordinates;
                    const lat = coordinates[1]; // Широта
                    const lon = coordinates[0];  // Долгота


                    // Собираем данные для всплывающего окна
                    let popupContent = '';
                    if (feature.properties.osm_tags) {
                        popupContent = feature.properties.osm_tags.name;
                    }
                    else if (feature.properties.category_ids) {
                        const categories = Object.values(feature.properties.category_ids);

                        categories.forEach(category => {
                            if (category.category_group && category.category_name) {
                                popupContent += `
                    <strong>${category.category_group}</strong>: ${category.category_name}<br>
                `;
                            }
                        });
                    }

                    const icon = { icon: icons.defaultIcon };
                    if (feature.properties.category_ids["103"]) {
                        icon.icon = icons.tentIcon;
                    }
                    if (feature.properties.category_ids["627"]) {
                        icon.icon = icons.starIcon;
                    }
                    if (feature.properties.category_ids["336"] || feature.properties.category_ids["335"]) {
                        icon.icon = icons.rockIcon;
                    }
                    if (feature.properties.category_ids["340"] || feature.properties.category_ids["338"] || feature.properties.category_ids["292"]) {
                        icon.icon = icons.springIcon;
                    }


                    // Создаем маркерd raggable: true,
                    const marker = L.marker([lat, lon], icon).addTo(toRaw(this.map));

                    //const marker = L.marker([lat, lon], this.markerOptions).addTo(this.map);
                    this.markers.push(marker);



                    // Привязываем всплывающее окно к маркеру
                    marker.bindPopup(popupContent).openPopup();
                });


            },
            uploadFeatures() {
                //https://api.openrouteservice.org/
                //The pattern for this bbox string is [[minlon,minlat],[maxlon,maxlat]]
                this.loading = true;
                // Формируем URL для OpenRouteService API
                const apiKey = '5b3ce3597851110001cf624807c4aca3606842eda3cbb1e7dc01066b'; // Замените на ваш ключ API OpenRouteService
                const url = `https://api.openrouteservice.org/pois`;


                let ddox = [];
                let geojson = {
                    type: "Point",
                    coordinates: []
                };
                if (this.routesLocation.bbox) {
                    const bbox = this.routesLocation.bbox;
                    ddox = [
                        [bbox[0], bbox[1]], // [minLat, minLon]
                        [bbox[2], bbox[3]]  // [maxLat, maxLon]
                    ];
                    geojson.coordinates = [bbox[0], bbox[1]];
                } else {
                    const box = this.route[this.route.length - 1];
                    ddox = [
                        [this.route[0][1], this.route[0][0]], // [minLat, minLon]
                        [box[1], box[0]]  // [maxLat, maxLon]
                    ];
                    geojson.coordinates = [this.route[0][1], this.route[0][0]];

                }


                axios.post(url, {
                    request: "pois",
                    geometry: {
                        bbox: ddox,
                        //  geojson,
                        buffer: 200
                    }
                }, {
                    headers: {
                        'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
                        'Authorization': apiKey,
                        'Content-Type': 'application/json; charset=utf-8'
                    }
                })
                    .then(response => {
                        this.features = response.data.features;
                        this.setMarkerForFeatures();
                    })
                    .catch(error => {
                        // Проверяем, есть ли ответ от сервера
                        if (error.response) {
                            const code = error.response.status; // Статус ошибки
                            const message = error.response.data.message || 'Неизвестная ошибка'; // Сообщение об ошибке

                            this.message(message, false);
                            console.error(`Ошибка ${code}: ${message}`);
                        } else {
                            // Если ошибка не связана с ответом от сервера
                            this.message('Ошибка сети или сервера', false);
                            console.error("Ошибка при получении маршрута:", error);
                        }
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            },
            getElevations() { //запрос высот по координатам
                const url = `https://api.open-elevation.com/api/v1/lookup`;
                // Формируем массив запросов к API высоты
                const requests = this.route.map(coord => ({
                    latitude: coord[0],
                    longitude: coord[1]
                }));


                axios.post(url, { locations: requests },
                    {
                        headers: {
                            'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
                            'Content-Type': 'application/json; charset=utf-8'
                        }
                    }
                )
                    .then(response => {
                        this.elevationsLocation = response.data;
                        this.updateElevations(response.data);
                        return true;
                    })
                    .catch(error => {
                        console.error("Ошибка при получении данных о высоте:", error);
                        return false;
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
            plotElevationProfile() {  ///подготовка к постороению графика высот
               // console.log('this.routesLocation', this.routesLocation);
                if (this.routesLocation && (this.routesLocation.features || this.routesLocation.routes)) {
                    const points = this.calculateDistancesAndTimes();
                  //  console.log('points', points);
                    if (points.length > 0) {
                        this.elevationData = points;
                    }
                }
                else {
                    this.elevationData = this.route.map((coord, index) => ({
                        x: index,
                        y: this.elevations[index] // Высота по индексу
                    }));
                }




            },

            calculateDistancesAndTimesPOST() {
                const data = [];
                let currentDistance = 0;
                let currentDuration = 0;

                if (this.routesLocation.routes.length > 0) {
                    const route = this.routesLocation.routes[0];

                    // Проходим по всем сегментам в маршруте
                    route.segments.forEach(segment => {
                        // Проходим по всем шагам в текущем сегменте
                        segment.steps.forEach(step => {
                            const segmentDistance = step.distance / (step.way_points[1] - step.way_points[0]);
                            const segmentDuration = step.duration / (step.way_points[1] - step.way_points[0]);

                            // Проходим по всем точкам пути в шаге
                            for (let i = step.way_points[0]; i < step.way_points[1]; i++) {
                                currentDistance += segmentDistance;
                                currentDuration += segmentDuration;

                                data.push({
                                    x: i,
                                    y: this.elevations[i],
                                    distance: this.getDistance(currentDistance),
                                    duration: this.getDuration(currentDuration),
                                });
                            }
                        });
                    });
                }
                return data;

                //     calculateTimeAndDistance() {
                //     return false;
                //     //points, V_base, k
                //     let totalDistance = 0;
                //     let totalTime = 0;

                //     for (let i = 0; i < points.length - 1; i++) {
                //         const d = points[i + 1].horizontalDistance; // Горизонтальное расстояние между точками
                //         const h = points[i + 1].height - points[i].height; // Разница в высоте

                //         // Расчет реального расстояния
                //         const d_real = Math.sqrt(d * d + h * h);

                //         // Расчет угла наклона
                //         const alpha = Math.atan(h / d);

                //         // Учет скорости
                //         const V_actual = V_base * (1 - k * alpha);

                //         // Расчет времени
                //         const time = d_real / V_actual;

                //         totalDistance += d_real;
                //         totalTime += time;
                //     }

                //     return {
                //         totalDistance,
                //         totalTime
                //     };
                // }
            },
            calculateDistancesAndTimes() {
                if (this.routesLocation.length === 0) {
                    return false;
                }

                if (this.routesLocation.routes) {
                    return this.calculateDistancesAndTimesPOST();
                }

                const data = [];
                let currentDistance = 0;
                let currentDuration = 0;

                this.routesLocation.features[0].properties.segments[0].steps.forEach(step => {
                    const segmentDistance = step.distance / (step.way_points[1] - step.way_points[0]);
                    const segmentDuration = step.duration / (step.way_points[1] - step.way_points[0]);

                    for (let i = step.way_points[0]; i < step.way_points[1]; i++) {
                        currentDistance += segmentDistance;
                        currentDuration += segmentDuration;

                        data.push({
                            x: i,
                            y: this.elevations[i],
                            distance: this.getDistance(currentDistance),
                            duration: this.getDuration(currentDuration),
                        });
                    }
                });
                return data;
            }
        },
        watch: {
            isElevations(newValue) {
                if (newValue && this.route.length > 0) {
                    this.getElevations();
                }
            },
            isFeatures(newValue) {
                if (newValue && this.route.length > 0) {
                    this.uploadFeatures();
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

                this.updateMarkers();
                // // Удаляем старые маркеры
                // this.markers.forEach(marker => {
                //     this.map.removeLayer(marker);
                // });

                // // Повторно добавляем все маркеры
                // this.markers.forEach(marker => {
                //     marker.addTo(this.map);
                // });


            },
            coords(newCoords) {
                if (this.map) {
                    this.map.setView(newCoords, 17);
                    this.currentMarker = L.marker(newCoords, this.markerOptions).addTo(toRaw(this.map)).bindPopup(`Координаты: ${parseFloat(this.newCoords[0]).toFixed(3)}, ${parseFloat(this.newCoords[1]).toFixed(3)}  <br /> Высота:${this.elevation}м`).openPopup();
                }
            },

        },
    };
</script>

<style>
    .custom-icon {
        fill: #FF9800;
    }

    .leaflet-bottom.leaflet-right {
        opacity: 0;
    }

    .leaflet-top {
        top: 80px !important;
        z-index: 400;
    }
</style>
<style scoped>
    .dialogformap {
        height: calc(100vh - 50px);
    }

    .loading-spinner {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }


    .settings-panel {
        position: absolute;
        top: 20px;
        right: 0;
        width: 380px;
        /* max-width: 360px; */
        z-index: 1000;
        /* Установите нужный z-index */
        background-color: rgb(255, 255, 255);
        /* Добавьте фон, если необходимо */
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        /* Добавьте тень для лучшего визуального эффекта */
        padding: 16px;
        /* Добавьте отступы, если необходимо */
        font-size: 0.8rem;
    }

    .tabs-layer-item {
        font-size: 0.8rem;
    }

    @media (max-width: 600px) {
        .settings-panel {
            width: 100%;
            /* Устанавливаем ширину 100% для маленьких экранов */
            right: 0;
            /* Убедитесь, что панель остается справа */
        }
    }
</style>