import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const repositoryName = 'Weather-App.Vue.js'

export default defineConfig(({ mode }) => ({
  plugins: [vue()],
  base: mode === 'production' ? `/${repositoryName}/` : '/',
}))
