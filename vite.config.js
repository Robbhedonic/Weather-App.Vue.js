import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1]

export default defineConfig({
  plugins: [vue()],
  base: process.env.GITHUB_ACTIONS && repositoryName ? `/${repositoryName}/` : '/',
})
