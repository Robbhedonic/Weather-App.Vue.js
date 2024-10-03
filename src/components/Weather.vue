<template>
  <div class="weather container mt-5">
    <h1 class="text-center">Weather App</h1>
    <div class="input-group mb-3">
      <input
        type="text"
        v-model="city"
        class="form-control"
        placeholder="Enter city"
        @keyup.enter="getWeather"
      />
      <button class="btn btn-primary" @click="getWeather">Get Weather</button>
    </div>

    <div v-if="loading" class="text-center">Loading...</div>

    <div v-if="weatherData.length" class="card text-center">
      <div class="card-body">
        <h2 class="card-title">Weather in {{ city }}</h2>
        <div class="card-text" v-for="(day, index) in weatherData.slice(0, 5)" :key="index">
          
          <p>
            Date: {{ day.dt_txt }}
             
          </p>
          <p>Temp: {{ day.main.temp }} °C </p>
          <p>Weather: {{ day.weather[0].description }}</p>
          <img :src="`http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`" alt="Weather Icon" />
        </div>
      </div>
    </div>

    <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      city: '',
      weatherData: [],
      error: null,
      loading: false,
    };
  },
  methods: {
    async getWeather() {
      this.error = null; // Limpiar errores anteriores
      this.loading = true; // Mostrar estado de carga
      const apiKey = 'd57bda810f163a75f2a107063f218a7a'; // Tu clave de API
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast?q=${this.city}&appid=${apiKey}&units=metric`
        );
        this.weatherData = response.data.list; // Cambia para manejar una lista de pronósticos
      } catch (err) {
        this.error = 'City not found. Please try again.';
        this.weatherData = [];
      } finally {
        this.loading = false; // Ocultar estado de carga
      }
    },
  },
};
</script>

<style scoped>
.weather {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>