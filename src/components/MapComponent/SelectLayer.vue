<template>
    <v-radio-group density="comfortable" class="mt-2" v-model="selectedLayer" @change="selectLayer">
        <v-radio v-for="layer in mapsLayerPath" :label="layer.label" :value="layer" ></v-radio>
    </v-radio-group>
</template>

<script>
    export default {
        name: 'SelectLayer',
        data() {
            return {
                selectedLayer: { label: 'Opentopomap', path: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'  },
                mapsLayerPath: {
                    openstreetmap: { label: 'openstreetmap', path: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' },
                    opentopomap: { label: 'Opentopomap', path: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png' },
                    thunderforest: { label: 'Thunderforest', path: 'https://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png' },
                    thunderforest1: { label: 'Thunderforest outdoors', path: 'https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png' },
                },
            };
        },
        methods: {
            selectLayer() {
                this.$emit('changeLayer', this.selectedLayer);
            },
        },
    };
</script>

<style scoped>
    .selected-icon {
        background-color: rgb(11, 11, 11);
        color: aliceblue;
    }
</style>