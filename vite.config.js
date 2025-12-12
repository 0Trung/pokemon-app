import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // Thêm dòng 'base' này để Vite biết ứng dụng đang được host
  // trong thư mục con /pokemon-app/ trên GitHub Pages
  plugins: [react()],
})
