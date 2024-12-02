<template>
    <div>
        <div ref="weatherChart" style="height: 400px;"></div>
    </div>
</template>

<script>

import Highcharts from 'highcharts';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

export default {
    props: {
        weatherData: {
            type: Array,
            required: true,
        },
        selectedLocations: {
            type: Array,
            required: true,
        },
    },
    watch: {
        weatherData: {
            handler(newData) {
                this.renderChart();
            },
                deep: true,
      
        },
    },
    mounted() {

        this.renderChart();

    },
    methods: {
        formatDate(dateString) {
            return format(parseISO(dateString), "dd MMMM yyyy HH:mm", { locale: ru });
        },
        renderChart() {
            console.log('стартуем');
            if (this.weatherData.length === 0) return;

            console.log('this.weatherData', this.weatherData);

            const temperature = [];
            const pressure = [];
            const humidity = [];
            const windSpeed = [];

            let categories = [];

            if (this.weatherData.length) {
                categories = this.weatherData[0].properties.timeseries.map(item => this.formatDate(item.time));
            }



           // console.log('categories', categories, 'temperature', temperature, 'pressure', pressure, 'humidity', humidity, 'windSpeed', windSpeed);


            // this.weatherData[0].properties.timeseries.forEach(item => {
            //     temperature.push(item.data.instant.details.air_temperature);
            //     pressure.push(item.data.instant.details.air_pressure_at_sea_level);
            //     humidity.push(item.data.instant.details.relative_humidity);
            //     windSpeed.push(item.data.instant.details.wind_speed);
            // });

            const seriesData = [];
            if (this.weatherData.length) {
                this.weatherData.forEach((data, index) => {
                    const seriesTemperature = [];
                    const seriesPressure = [];
                    const seriesHumidity = [];
                    const seriesWindSpeed = [];

                    data.properties.timeseries.forEach(item => {
                        seriesTemperature.push(item.data.instant.details.air_temperature);
                        seriesPressure.push(item.data.instant.details.air_pressure_at_sea_level);
                        seriesHumidity.push(item.data.instant.details.relative_humidity);
                        seriesWindSpeed.push(item.data.instant.details.wind_speed);
                    });

                    seriesData.push({
                        name: `Температура (°C) - ${this.selectedLocations[index].label}`,
                        data: seriesTemperature,
                    });

                });
            }


            Highcharts.chart(this.$refs.weatherChart, {
                chart: {
                    type: 'column',
                },
                title: {
                    text: 'Погодные условия',
                },
                xAxis: {
                    categories: categories, //['Температура (°C)', 'Давление (hPa)', 'Влажность (%)', 'Скорость ветра (m/s)'],
                },
                yAxis: {
                    title: {
                        text: 'Значение',
                    },
                },
                series: seriesData,
                // , {
                //     name: 'Давление (hPa)',
                //     data: pressure,
                // }, {
                //     name: 'Влажность (%)',
                //     data: humidity,
                // }, {
                //     name: 'Скорость ветра (m/s)',
                //     data: windSpeed,
                // },
                //  ],
            });
        },
    },
};
</script>

<style scoped>
/* Добавьте стили по необходимости */
</style>