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


            <v-card class="px-0">
                <v-card-text class="pt-0 pa-0">
                    <div v-if="$vuetify.display.xs">
                        <div class="d-flex align-center">

                            <span class="text-wrap px-4">Выберите точку</span>


                            <v-spacer></v-spacer>
                            <v-btn icon flat @click="dialog = false"><v-icon>mdi-close</v-icon></v-btn>
                        </div>
                    </div>
                    <div class="d-flex align-center" v-else>
                        <span class="text-wrap pl-4">  Выберите точку на карте для которой хотите получить погоду или постройте
                            маршрут</span>
                        <v-spacer></v-spacer>
                        <v-btn icon flat @click="dialog = false"><v-icon>mdi-close</v-icon></v-btn>
                    </div>
                    <MapComponent @updateCoords="updateCoords" :coords="getCoords" :elevation="getElevation" :layer="getlayer" />
                </v-card-text>


            </v-card>

        </v-dialog>

    </div>
</template>



<script>
    import MapComponent from './MapComponent.vue';
    export default {
        name: 'DialogForMap',
        components: {
            MapComponent
        },
        props: {
            coords: {
                type: Array,
                default: () => [45.04886, 41.95639], // Значение по умолчанию
            },
            elevation:{
                type: Number,
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
            getElevation(){
                return this.elevation;
            }
        },
        methods: {
            updateCoords(coords) {
                this.$emit('updateCoords', coords);
                this.dialog = false;
            },

        },
    }
</script>