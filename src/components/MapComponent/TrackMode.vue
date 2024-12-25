<template>
    <div>
        <v-icon v-for="(track, index) in trackmode" :key="index" :class="{ 'selected-icon': selectedMode === track.mode }"
            @click="selectMode(track.mode)" v-tooltip.bottom="track.label" class="ma-2 text-teal-lighten-3">
            {{ track.icon }}
        </v-icon>
    </div>
</template>

<script>
export default {
    name: 'TrackMode',
    data() {
        return {
            selectedMode: null,
            trackmode: [
                { mode: 'foot-walking', label: 'Турист', icon: 'mdi-ski-cross-country' },
                { mode: 'foot-hiking', label: 'Горные туристы', icon: 'mdi-walk' },
                { mode: 'cycling-mountain', label: 'Горные велосипеды', icon: 'mdi-bicycle' },
                { mode: 'cycling-regular', label: 'Велосипед', icon: 'mdi-bike' },
                { mode: 'cycling-road', label: 'Шоссейный велосипед', icon: 'mdi-bike' },
                { mode: 'cycling-electric', label: 'Электро велосипед', icon: 'mdi-bike' },
                { mode: 'wheelchair', label: 'Инвалидная коляска', icon: 'mdi-wheelchair' },
                { mode: 'driving-car', label: 'Автомобиль', icon: 'mdi-car' },
                //можно для разных типов грузовиков
            ],
        };
    },
    methods: {
        selectMode(mode) {
            this.selectedMode = mode;
            this.$emit('changeMode', mode);
        },
    },
};
</script>

<style scoped>
.selected-icon {
    background-color: rgb(11, 11, 11);
    color: aliceblue;
    border-radius: 5px;
}
</style>