<template>
  <section :class="['weather-shell', `sky-${skyTheme}`]">
    <div class="sky-backdrop" aria-hidden="true">
      <span class="sky-orb"></span>
      <span class="sky-glow sky-glow-left"></span>
      <span class="sky-glow sky-glow-right"></span>
      <span class="sky-stars"></span>
    </div>
    <div class="weather-panel">
      <div class="top-bar">
        <div>
          <p class="eyebrow">{{ t('eyebrow') }}</p>
          <h1>{{ t('title') }}</h1>
          <p class="intro">{{ t('intro') }}</p>
        </div>

        <label class="language-picker" :aria-label="t('languageLabel')">
          <span>{{ t('languageLabel') }}</span>
          <select v-model="language">
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="zh">中文</option>
            <option value="de">Deutsch</option>
            <option value="hi">हिन्दी</option>
            <option value="ar">العربية</option>
          </select>
        </label>
      </div>

      <form class="search-bar" @submit.prevent="getWeather">
        <input
          v-model.trim="city"
          type="text"
          class="form-control"
          :placeholder="t('searchPlaceholder')"
          autocomplete="off"
        />
        <button class="btn btn-dark" type="submit" :disabled="loading || !city">
          {{ loading ? t('loadingButton') : t('searchButton') }}
        </button>
      </form>

      <p v-if="error" class="status error">{{ error }}</p>
      <p v-else-if="loading" class="status">{{ t('loadingStatus') }}</p>

      <div v-if="location && forecast.length" class="result-header">
        <div>
          <p class="location-label">{{ t('locationLabel') }}</p>
          <h2>{{ location.name }}, {{ location.country }}</h2>
          <p class="location-meta">{{ location.admin1 || t('noRegion') }}</p>
        </div>
        <p class="timezone">{{ t('timezoneLabel') }}: {{ timezone }}</p>
      </div>

      <div v-if="forecast.length" class="forecast-grid">
        <article v-for="day in forecast" :key="day.date" class="forecast-card">
          <div class="forecast-card-header">
            <span class="forecast-day">{{ formatDay(day.date) }}</span>
            <span class="forecast-icon" aria-hidden="true">{{
              getWeatherDetails(day.code).icon
            }}</span>
          </div>
          <p class="forecast-description">
            {{ getWeatherDetails(day.code).description }}
          </p>
          <p class="forecast-date">{{ formatDate(day.date) }}</p>
          <div class="forecast-temp">
            <strong>{{ Math.round(day.max) }}°</strong>
            <span>{{ Math.round(day.min) }}° {{ t('minLabel') }}</span>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script>
import axios from 'axios';

const translations = {
  en: {
    eyebrow: 'Weekly forecast',
    title: 'Check the weather in any city',
    intro:
      'This version uses Open-Meteo so you can publish the project on GitHub without exposing API keys.',
    languageLabel: 'Language',
    searchPlaceholder: 'Search for a city',
    searchButton: 'Search',
    loadingButton: 'Searching...',
    loadingStatus: 'Loading forecast...',
    locationLabel: 'Location',
    timezoneLabel: 'Time zone',
    noRegion: 'No specific region',
    minLabel: 'min',
    emptyCity: 'Type a city to continue.',
    cityNotFound: 'That city was not found. Try a different name.',
    genericError: 'The forecast could not be loaded right now.',
    weather: {
      0: 'Clear sky',
      1: 'Mostly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Fog',
      48: 'Dense fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Heavy drizzle',
      61: 'Light rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      71: 'Light snow',
      73: 'Moderate snow',
      75: 'Heavy snow',
      80: 'Light showers',
      81: 'Moderate showers',
      82: 'Heavy showers',
      95: 'Thunderstorm',
      fallback: 'Variable conditions',
    },
  },
  es: {
    eyebrow: 'Forecast semanal',
    title: 'Consulta el clima de cualquier ciudad',
    intro:
      'Esta version usa Open-Meteo para que puedas publicar el proyecto en GitHub sin exponer claves.',
    languageLabel: 'Idioma',
    searchPlaceholder: 'Busca una ciudad',
    searchButton: 'Buscar',
    loadingButton: 'Buscando...',
    loadingStatus: 'Cargando pronostico...',
    locationLabel: 'Ubicacion',
    timezoneLabel: 'Zona horaria',
    noRegion: 'Sin region especificada',
    minLabel: 'min',
    emptyCity: 'Escribe una ciudad para continuar.',
    cityNotFound: 'No se encontro esa ciudad. Prueba con otro nombre.',
    genericError: 'No fue posible cargar el pronostico en este momento.',
    weather: {
      0: 'Cielo despejado',
      1: 'Mayormente despejado',
      2: 'Parcialmente nublado',
      3: 'Nublado',
      45: 'Niebla',
      48: 'Niebla densa',
      51: 'Llovizna ligera',
      53: 'Llovizna moderada',
      55: 'Llovizna intensa',
      61: 'Lluvia ligera',
      63: 'Lluvia moderada',
      65: 'Lluvia intensa',
      71: 'Nieve ligera',
      73: 'Nieve moderada',
      75: 'Nieve intensa',
      80: 'Chubascos ligeros',
      81: 'Chubascos moderados',
      82: 'Chubascos intensos',
      95: 'Tormenta',
      fallback: 'Condiciones variables',
    },
  },
  fr: {
    eyebrow: 'Previsions hebdomadaires',
    title: 'Consultez la meteo de n importe quelle ville',
    intro:
      'Cette version utilise Open-Meteo pour publier le projet sur GitHub sans exposer de cles API.',
    languageLabel: 'Langue',
    searchPlaceholder: 'Rechercher une ville',
    searchButton: 'Rechercher',
    loadingButton: 'Recherche...',
    loadingStatus: 'Chargement des previsions...',
    locationLabel: 'Lieu',
    timezoneLabel: 'Fuseau horaire',
    noRegion: 'Aucune region precisee',
    minLabel: 'min',
    emptyCity: 'Saisissez une ville pour continuer.',
    cityNotFound: 'Cette ville est introuvable. Essayez un autre nom.',
    genericError: 'Impossible de charger les previsions pour le moment.',
    weather: {
      0: 'Ciel degage',
      1: 'Plutot degage',
      2: 'Partiellement nuageux',
      3: 'Couvert',
      45: 'Brouillard',
      48: 'Brouillard dense',
      51: 'Bruine legere',
      53: 'Bruine moderee',
      55: 'Bruine forte',
      61: 'Pluie legere',
      63: 'Pluie moderee',
      65: 'Pluie forte',
      71: 'Neige legere',
      73: 'Neige moderee',
      75: 'Neige forte',
      80: 'Averses legeres',
      81: 'Averses moderees',
      82: 'Averses fortes',
      95: 'Orage',
      fallback: 'Conditions variables',
    },
  },
  zh: {
    eyebrow: '每周天气预报',
    title: '查询任何城市的天气',
    intro:
      '此版本使用 Open-Meteo，因此你可以在 GitHub 上发布项目而无需暴露 API 密钥。',
    languageLabel: '语言',
    searchPlaceholder: '搜索城市',
    searchButton: '搜索',
    loadingButton: '搜索中...',
    loadingStatus: '正在加载天气预报...',
    locationLabel: '位置',
    timezoneLabel: '时区',
    noRegion: '无具体地区',
    minLabel: '最低',
    emptyCity: '请输入城市名称。',
    cityNotFound: '未找到该城市，请尝试其他名称。',
    genericError: '当前无法加载天气预报。',
    weather: {
      0: '晴朗',
      1: '大部晴朗',
      2: '局部多云',
      3: '阴天',
      45: '有雾',
      48: '浓雾',
      51: '小毛毛雨',
      53: '中等毛毛雨',
      55: '强毛毛雨',
      61: '小雨',
      63: '中雨',
      65: '大雨',
      71: '小雪',
      73: '中雪',
      75: '大雪',
      80: '小阵雨',
      81: '中阵雨',
      82: '强阵雨',
      95: '雷暴',
      fallback: '天气多变',
    },
  },
  de: {
    eyebrow: 'Wochenvorhersage',
    title: 'Prufe das Wetter in jeder Stadt',
    intro:
      'Diese Version verwendet Open-Meteo, damit du das Projekt auf GitHub veroffentlichen kannst, ohne API-Schlussel preiszugeben.',
    languageLabel: 'Sprache',
    searchPlaceholder: 'Nach einer Stadt suchen',
    searchButton: 'Suchen',
    loadingButton: 'Suche...',
    loadingStatus: 'Vorhersage wird geladen...',
    locationLabel: 'Ort',
    timezoneLabel: 'Zeitzone',
    noRegion: 'Keine genaue Region',
    minLabel: 'Min',
    emptyCity: 'Gib eine Stadt ein, um fortzufahren.',
    cityNotFound:
      'Diese Stadt wurde nicht gefunden. Versuche einen anderen Namen.',
    genericError: 'Die Wettervorhersage konnte derzeit nicht geladen werden.',
    weather: {
      0: 'Klarer Himmel',
      1: 'Meist klar',
      2: 'Teilweise bewolkt',
      3: 'Bedeckt',
      45: 'Nebel',
      48: 'Dichter Nebel',
      51: 'Leichter Nieselregen',
      53: 'Maßiger Nieselregen',
      55: 'Starker Nieselregen',
      61: 'Leichter Regen',
      63: 'Maßiger Regen',
      65: 'Starker Regen',
      71: 'Leichter Schnee',
      73: 'Maßiger Schnee',
      75: 'Starker Schneefall',
      80: 'Leichte Schauer',
      81: 'Maßige Schauer',
      82: 'Starke Schauer',
      95: 'Gewitter',
      fallback: 'Wechselhafte Bedingungen',
    },
  },
  hi: {
    eyebrow: 'साप्ताहिक पूर्वानुमान',
    title: 'किसी भी शहर का मौसम देखें',
    intro:
      'यह संस्करण Open-Meteo का उपयोग करता है, ताकि आप API keys उजागर किए बिना प्रोजेक्ट को GitHub पर प्रकाशित कर सकें।',
    languageLabel: 'भाषा',
    searchPlaceholder: 'शहर खोजें',
    searchButton: 'खोजें',
    loadingButton: 'खोज जारी है...',
    loadingStatus: 'पूर्वानुमान लोड हो रहा है...',
    locationLabel: 'स्थान',
    timezoneLabel: 'समय क्षेत्र',
    noRegion: 'कोई विशिष्ट क्षेत्र नहीं',
    minLabel: 'न्यूनतम',
    emptyCity: 'आगे बढ़ने के लिए किसी शहर का नाम लिखें।',
    cityNotFound: 'यह शहर नहीं मिला। कोई दूसरा नाम आज़माएँ।',
    genericError: 'इस समय पूर्वानुमान लोड नहीं हो सका।',
    weather: {
      0: 'आसमान साफ',
      1: 'ज़्यादातर साफ',
      2: 'आंशिक बादल',
      3: 'घने बादल',
      45: 'कोहरा',
      48: 'घना कोहरा',
      51: 'हल्की फुहार',
      53: 'मध्यम फुहार',
      55: 'तेज़ फुहार',
      61: 'हल्की बारिश',
      63: 'मध्यम बारिश',
      65: 'तेज़ बारिश',
      71: 'हल्की बर्फबारी',
      73: 'मध्यम बर्फबारी',
      75: 'भारी बर्फबारी',
      80: 'हल्की बौछारें',
      81: 'मध्यम बौछारें',
      82: 'तेज़ बौछारें',
      95: 'आंधी-तूफान',
      fallback: 'मौसम बदलता हुआ',
    },
  },
  ar: {
    eyebrow: 'توقعات الطقس الأسبوعية',
    title: 'تحقق من الطقس في أي مدينة',
    intro:
      'يستخدم هذا الإصدار Open-Meteo حتى تتمكن من نشر المشروع على GitHub دون كشف مفاتيح API.',
    languageLabel: 'اللغة',
    searchPlaceholder: 'ابحث عن مدينة',
    searchButton: 'بحث',
    loadingButton: 'جارٍ البحث...',
    loadingStatus: 'جارٍ تحميل التوقعات...',
    locationLabel: 'الموقع',
    timezoneLabel: 'المنطقة الزمنية',
    noRegion: 'لا توجد منطقة محددة',
    minLabel: 'الصغرى',
    emptyCity: 'اكتب اسم مدينة للمتابعة.',
    cityNotFound: 'لم يتم العثور على هذه المدينة. جرّب اسمًا آخر.',
    genericError: 'تعذر تحميل التوقعات حاليًا.',
    weather: {
      0: 'سماء صافية',
      1: 'صحو غالبًا',
      2: 'غائم جزئيًا',
      3: 'غائم',
      45: 'ضباب',
      48: 'ضباب كثيف',
      51: 'رذاذ خفيف',
      53: 'رذاذ متوسط',
      55: 'رذاذ غزير',
      61: 'مطر خفيف',
      63: 'مطر متوسط',
      65: 'مطر غزير',
      71: 'ثلوج خفيفة',
      73: 'ثلوج متوسطة',
      75: 'ثلوج كثيفة',
      80: 'زخات خفيفة',
      81: 'زخات متوسطة',
      82: 'زخات غزيرة',
      95: 'عاصفة رعدية',
      fallback: 'أحوال جوية متقلبة',
    },
  },
};

const weatherIcons = {
  0: '☀️',
  1: '🌤️',
  2: '⛅',
  3: '☁️',
  45: '🌫️',
  48: '🌫️',
  51: '🌦️',
  53: '🌦️',
  55: '🌧️',
  61: '🌦️',
  63: '🌧️',
  65: '🌧️',
  71: '🌨️',
  73: '❄️',
  75: '❄️',
  80: '🌦️',
  81: '🌧️',
  82: '⛈️',
  95: '⛈️',
  fallback: '🌡️',
};

const localeMap = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  zh: 'zh-CN',
  de: 'de-DE',
  hi: 'hi-IN',
  ar: 'ar-SA',
};

export default {
  computed: {
    skyTheme() {
      const hour = this.getCurrentHour();

      if (hour >= 5 && hour < 8) {
        return 'dawn';
      }

      if (hour >= 8 && hour < 18) {
        return 'day';
      }

      if (hour >= 18 && hour < 20) {
        return 'dusk';
      }

      return 'night';
    },
  },
  watch: {
    language() {
      this.updateDocumentLanguage();
    },
  },
  data() {
    return {
      city: 'Madrid',
      language: 'es',
      now: new Date(),
      forecast: [],
      location: null,
      timezone: '',
      loading: false,
      error: '',
      clockIntervalId: null,
    };
  },
  mounted() {
    this.updateDocumentLanguage();
    this.startClock();
    this.getWeather();
  },
  beforeUnmount() {
    this.stopClock();
  },
  methods: {
    startClock() {
      this.clockIntervalId = window.setInterval(() => {
        this.now = new Date();
      }, 60000);
    },
    stopClock() {
      if (this.clockIntervalId) {
        window.clearInterval(this.clockIntervalId);
        this.clockIntervalId = null;
      }
    },
    t(key) {
      return translations[this.language][key];
    },
    updateDocumentLanguage() {
      document.documentElement.lang = this.language;
      document.documentElement.dir = this.language === 'ar' ? 'rtl' : 'ltr';
    },
    getCurrentHour() {
      const activeTimeZone =
        this.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

      return Number(
        new Intl.DateTimeFormat('en-US', {
          hour: '2-digit',
          hour12: false,
          timeZone: activeTimeZone,
        }).format(this.now),
      );
    },
    getWeatherDetails(code) {
      const localizedWeather = translations[this.language].weather;

      return {
        description: localizedWeather[code] ?? localizedWeather.fallback,
        icon: weatherIcons[code] ?? weatherIcons.fallback,
      };
    },
    formatDay(date) {
      return new Intl.DateTimeFormat(localeMap[this.language], {
        weekday: 'long',
      }).format(new Date(`${date}T12:00:00`));
    },
    formatDate(date) {
      return new Intl.DateTimeFormat(localeMap[this.language], {
        day: 'numeric',
        month: 'short',
      }).format(new Date(`${date}T12:00:00`));
    },
    async getWeather() {
      if (!this.city) {
        this.error = this.t('emptyCity');
        this.forecast = [];
        this.location = null;
        return;
      }

      this.loading = true;
      this.error = '';

      try {
        const geoResponse = await axios.get(
          'https://geocoding-api.open-meteo.com/v1/search',
          {
            params: {
              name: this.city,
              count: 1,
              language: this.language,
              format: 'json',
            },
          },
        );

        const match = geoResponse.data.results?.[0];

        if (!match) {
          throw new Error('CITY_NOT_FOUND');
        }

        const weatherResponse = await axios.get(
          'https://api.open-meteo.com/v1/forecast',
          {
            params: {
              latitude: match.latitude,
              longitude: match.longitude,
              daily: 'weather_code,temperature_2m_max,temperature_2m_min',
              timezone: 'auto',
              forecast_days: 7,
            },
          },
        );

        this.location = {
          name: match.name,
          country: match.country,
          admin1: match.admin1,
        };
        this.timezone = weatherResponse.data.timezone;
        this.forecast = weatherResponse.data.daily.time.map((date, index) => ({
          date,
          code: weatherResponse.data.daily.weather_code[index],
          max: weatherResponse.data.daily.temperature_2m_max[index],
          min: weatherResponse.data.daily.temperature_2m_min[index],
        }));
      } catch (err) {
        this.forecast = [];
        this.location = null;
        this.timezone = '';
        this.error =
          err.message === 'CITY_NOT_FOUND'
            ? this.t('cityNotFound')
            : this.t('genericError');
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
