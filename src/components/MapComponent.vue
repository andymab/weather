<template>
    <v-container>
        <YandexMap v-model="map" ref="yandexMap" :settings="{
            location: {
                center: [41.95616, 45.04907],
                zoom: 15,
            },
        }" width="100%" height="500px"  class="yandex-map"  @ready="onMapLoad">
            <YandexMapDefaultSchemeLayer />
        </YandexMap>
        <div v-if="selectedCoordinates">
            <p>Долгота: {{ selectedCoordinates.lng }}</p>
            <p>Широта: {{ selectedCoordinates.lat }}</p>
        </div>
    </v-container>
</template>

<script>
import { YandexMap, YandexMapDefaultSchemeLayer } from 'vue-yandex-maps';

export default {

    components: {
        YandexMap,
        YandexMapDefaultSchemeLayer,
    },
    data() {
        return {
            map: null,
            selectedCoordinates: null,
        };
    },
    mounted() {
        this.$nextTick(() => {
        if (this.map) {
            this.map.events.add('click', (event) => {
                const coords = event.get('coords');
                console.log(coords, 'coords');
                this.selectedCoordinates = {
                    lat: coords[0],
                    lng: coords[1],
                };
            });
        }
    });
    },
    methods: {
        onMapLoad() {
            console.log('Карта загружена');
            // Доступ к объекту карты после загрузки
            this.map = this.$refs.yandexMap.map;

            // Добавляем обработчик клика на карту
            this.map.events.add('click', (event) => {
                const coords = event.get('coords'); // Получаем координаты из события
                console.logg(coords, 'coords');
                this.selectedCoordinates = {
                    lat: coords[0],
                    lng: coords[1],
                };
            });
        },
    },
};
</script>

<style scoped>
.yandex-map {
    width: 100%;
    height: 500px;
    /* Задайте высоту для отображения карты */
}
</style>
