<template>
    <div>
        <!-- :timeout="3000" -->
        <v-snackbar v-model="visible" class="text-center"  bottom right :color="snackbarColor" style="opacity: 0.8;">{{ snackbarMessage }}
            <template v-slot:actions>
                <v-btn
                  color="indigo"
                  variant="text"
                  @click="visible = false"
                >
                  Закрыть
                </v-btn>
              </template>
        </v-snackbar>
    </div>
</template>

<script>
export default {
    name: 'AlertChackbar',
    data() {
        return {
            visible: false,
            snackbarMessage: '',
            snackbarColor:'success',
        };
    },
    methods: {
        showSnackbar(msg,color) {
            this.snackbarMessage = msg;
            this.visible = true;
            this.snackbarColor = color;
        },
    },
};
</script>

<style scoped></style>