import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// `npm run dev` 는 화면만 띄우고, /api 요청은 `npm run api` (wrangler, 8788)로 넘깁니다.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: { '/api': 'http://localhost:8788' },
  },
})
