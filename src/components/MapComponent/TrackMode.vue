<template>
    <v-icon v-for="(track, index) in trackmode" :key="index" :class="{'selected-icon': selectedMode === track.mode}"
        @click="selectMode(track.mode)" v-tooltip.bottom=" track.label" class="ma-2 text-teal-lighten-3">
        {{ track.icon }}
    </v-icon>
</template>

<script>
    export default {
        name: 'TrackMode',
        data() {
            return {
                selectedMode: null,
                trackmode: [
                    { mode: 'foot-walking', label: 'Для пешеходных маршрутов', icon: 'mdi-ski-cross-country' },
                    { mode: 'foot-hiking', label: 'Для пеших походов и троп', icon: 'mdi-walk' },
                    { mode: 'cycling-mountain', label: 'Для горных велосипедных маршрутов', icon: 'mdi-bicycle' },
                    { mode: 'cycling-regular', label: 'Для обычных велосипедных маршрутов', icon: 'mdi-bike' },
                    { mode: 'cycling-road', label: 'Для велосипедных маршрутов по дорогам', icon: 'mdi-bike' },
                    { mode: 'cycling-electric', label: 'Для маршрутов на электрических велосипедах', icon: 'mdi-bike' },
                    { mode: 'wheelchair', label: 'Для маршрутов, доступных для инвалидных колясок', icon: 'mdi-wheelchair' },
                    { mode: 'driving-car', label: 'Для автомобильных маршрутов', icon: 'mdi-car' },
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