vue
<template>
    <div>
        <div ref="mapContainer" class="dialogformap"></div>
        <div class="d-flex">
            <div v-if="tracks">
                <button @click="saveRoute" class="mr-4">Сохранить маршрут</button>
                <button @click="removeLastPoint"  class="mr-4">Удалить последнюю точку</button>
            </div>
            <button @click="loadRoute">Загрузить маршрут из GPX</button>
        </div>
    </div>


</template>

<script>
    import { onMounted, ref, defineEmits, watch } from 'vue';
    import L from 'leaflet';
    import 'leaflet/dist/leaflet.css';
    import { saveAs } from 'file-saver'; // Импортируем библиотеку для сохранения файлов

    export default {
        props: {
            coords: {
                type: Array,
                default: () => [45.049, 41.956], // Значение по умолчанию
            },
            layer: {
                type: String,
                default: () => 'openstreetmap', // Значение по умолчанию                
            },
            tracks: {
                type: Boolean,
                default: () => false,
            },
        },
        setup(props, { emit }) {
            const mapContainer = ref(null);
            let map = null;
            let marker = null;
            let route = []; // Массив для хранения координат маршрута
            let polyline = null; // Хранение линии маршрута

            onMounted(() => {
                // Проверяем, что контейнер существует
                if (mapContainer.value) {

                    map = L.map(mapContainer.value).setView(props.coords, 15);


                    L.tileLayer(`https://{s}.tile.${props.layer}.org/{z}/{x}/{y}.png`, {
                        maxZoom: 17,
                        attribution: `&copy; <a href="https://${props.layer}.org/copyright">OpenTopoMap</a> contributors`
                    }).addTo(map);

                    // if (!props.tracks) {
                    //     marker = L.marker(props.coords).addTo(map)
                    //         .bindPopup(`Координаты: ${props.coords[0]}, ${props.coords[1]}`)
                    //         .openPopup();
                    // }
                    marker = L.circleMarker(props.coords, {
                        radius: 4, // Радиус кружочка
                        fillColor: "#ff7800", // Цвет заливки
                        color: "#000", // Цвет обводки
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0.8
                    }).addTo(map)
                        .bindPopup(`Координаты: ${props.coords[0]}, ${props.coords[1]}`)
                        .openPopup();


                    map.on('click', (e) => {
                        const { lat, lng } = e.latlng;
                        if (!props.tracks) {
                            emit('updateCoords', { lat: lat.toFixed(3), lon: lng.toFixed(3) });
                        } else {
                            route.push([lat, lng]);
                        }


                        // L.marker([lat, lng]).addTo(map)
                        //     .bindPopup(`Координаты: ${lat.toFixed(3)}, ${lng.toFixed(3)}`)
                        //     .openPopup();

                        L.circleMarker([lat, lng], {
                            radius: 4, // Радиус кружочка
                            fillColor: "#ff7800", // Цвет заливки
                            color: "#000", // Цвет обводки
                            weight: 1,
                            opacity: 1,
                            fillOpacity: 0.8
                        }).addTo(map)
                        // .bindPopup(`Координаты:  ${lat.toFixed(3)}, ${lng.toFixed(3)}`)
                        // .openPopup();

                        // Рисуем маршрут
                        if (polyline) {
                            polyline.addLatLng([lat, lng]);
                        } else {
                            polyline = L.polyline(route, { color: 'blue' }).addTo(map);
                        }


                        // Рисуем маршрут
                        if (route.length > 1) {
                            L.polyline(route, { color: 'blue' }).addTo(map);
                        }

                    });




                } else {
                    console.error("Контейнер карты не найден");
                }
            });

            watch(() => props.coords, (newCoords) => {
                if (map) {
                    map.setView(newCoords, 17); // Перепозиционируем карту на новые координаты
                    // Можно также обновить маркер, если нужно
                    if (marker) {
                        marker.setLatLng(newCoords); // Обновляем позицию маркера
                        marker.bindPopup(`Координаты: ${newCoords[0]}, ${newCoords[1]}`).openPopup(); // Обновляем всплывающее окно
                    } else {
                        // Если маркер еще не создан, создаем его
                        marker = L.marker(newCoords).addTo(map)
                            .bindPopup(`Координаты: ${newCoords[0]}, ${newCoords[1]}`)
                            .openPopup();
                    }
                }
            });

            const saveRoute = () => {
                if (route.length === 0) {
                    alert("Маршрут пуст!");
                    return;
                }

                // Генерация GPX
                let gpxData = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Leaflet GPX Export">
    <trk>
        <name>My Route</name>
        <trkseg>`;

                route.forEach(coord => {
                    gpxData += `
            <trkpt lat="${coord[0]}" lon="${coord[1]}"></trkpt>`;
                });

                gpxData += `
        </trkseg>
    </trk>
</gpx>`;

                const blob = new Blob([gpxData], { type: "application/gpx+xml" });
                saveAs(blob, "route.gpx");
            };

            const loadRoute = () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.gpx';
                input.onchange = async (event) => {
                    const file = event.target.files[0];
                    if (!file) return;

                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const contents = e.target.result;
                        parseGPX(contents);
                    };
                    reader.readAsText(file);
                };
                input.click();
            };



            const parseGPX = (gpxData) => {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(gpxData, "application/xml");
                const trackPoints = xmlDoc.getElementsByTagName("trkpt");

                route = []; // Очищаем текущий маршрут
                if (polyline) {
                    map.removeLayer(polyline); // Удаляем старую линию
                    polyline = null; // Сбрасываем ссылку на линию
                }

                for (let i = 0; i < trackPoints.length; i++) {
                    const lat = parseFloat(trackPoints[i].getAttribute("lat"));
                    const lon = parseFloat(trackPoints[i].getAttribute("lon"));
                    route.push([lat, lon]);

                    // Добавляем маркер для каждой точки
                    // L.marker([lat, lon]).addTo(map)
                    //     .bindPopup(`Координаты: ${lat.toFixed(3)}, ${lon.toFixed(3)}`)
                    //     .openPopup();

                    L.circleMarker([lat, lon], {
                        radius: 3, // Радиус кружочка
                        fillColor: "#ff7800", // Цвет заливки
                        color: "#000", // Цвет обводки
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0.8
                    }).addTo(map)
                        .bindPopup(`Координаты:  ${lat.toFixed(3)}, ${lon.toFixed(3)}`)
                        .openPopup();


                }

                // Рисуем новый маршрут
                polyline = L.polyline(route, { color: 'blue' }).addTo(map);
            };


            const removeLastPoint = () => {
                if (route.length > 0) {
                    route.pop(); // Удаляем последнюю точку из массива

                    if (polyline) {
                        polyline.setLatLngs(route); // Обновляем линию маршрута
                        if (route.length === 0) {
                            map.removeLayer(polyline); // Удаляем линию, если маршрут пустой
                            polyline = null;
                        }
                    }

                    if (marker) {
                        marker.remove(); // Удаляем последний маркер
                        marker = null;
                    }

                    // Перерисовываем маркеры для оставшихся точек маршрута
                    route.forEach(coord => {
                        L.marker(coord).addTo(map)
                            .bindPopup(`Координаты: ${coord[0].toFixed(3)}, ${coord[1].toFixed(3)}`);
                    });

                    alert("Последняя точка удалена.");
                } else {
                    alert("Маршрут пуст!");
                }
            };

            return {
                mapContainer, saveRoute,
                loadRoute,
                removeLastPoint,
            };
        }
    };
</script>

<style scoped>
    /* Задаем высоту для компонента карты */
    .dialogformap {
        height: calc(100vh - 180px);
        /* Вычитаем высоту заголовка и других элементов */
    }
</style>