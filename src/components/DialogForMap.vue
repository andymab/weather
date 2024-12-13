<template>
    <div>
        <v-dialog v-model="dialog" max-width="100%" persistent fullscreen>
            <template v-slot:activator="{ props: activatorProps }">
                <v-tooltip text="Смотреть место на карте">
                    <template v-slot:activator="{ props: tooltipProps }">
                        <v-btn icon v-bind="{ ...activatorProps, ...tooltipProps }">
                            <v-icon>mdi-eye</v-icon>
                        </v-btn>
                    </template>
                </v-tooltip>
            </template>


            <v-card>
                <v-card-title>
                    <div v-if="$vuetify.display.xs">
                        <div class="d-flex" >
                        <div class="d-flex flex-column">
                            <span class="text-wrap">Точку на карте или маршрут</span>

                            <v-checkbox-btn v-model="tracks" :label="`Маршрут`"></v-checkbox-btn>
                        </div>
                            <v-spacer></v-spacer>
                            <v-btn icon flat @click="dialog = false"><v-icon>mdi-close</v-icon></v-btn>
                        </div>
                    </div>
                    <div class="d-flex align-center" v-else>
                        <span class="text-wrap">Выберите точку на карте для которой хотите получить погоду или постройте
                            маршрут</span>

                        <v-checkbox-btn v-model="tracks" :label="`Маршрут`"></v-checkbox-btn>
                        <v-spacer></v-spacer>
                        <v-btn icon flat @click="dialog = false"><v-icon>mdi-close</v-icon></v-btn>
                    </div>

                </v-card-title>
                <v-card-text>

                    <MapComponent @updateCoords="updateCoords" :coords="getCoords" :layer="getlayer" :tracks="tracks" />
                </v-card-text>


            </v-card>
        </v-dialog>
    </div>
</template>



<script>
import MapComponent from './MapComponent.vue';
export default {
    components: {
        MapComponent
    },
    props: {
        coords: {
            type: Array,
            default: () => [45.04886, 41.95639], // Значение по умолчанию
        },
        layer: {
            type: String,
            default: () => 'openstreetmap', // Значение по умолчанию                
        },
    },
    data() {
        return {
            dialog: false,
            tracks: false,
        }
    },
    computed: {
        getCoords() {
            return this.coords;
        },
        getlayer() {
            return this.layer;
        },
    },
    methods: {
        updateCoords(coords) {
            this.$emit('updateCoords', coords);
            this.dialog = false;
        },

    },
}
</script>