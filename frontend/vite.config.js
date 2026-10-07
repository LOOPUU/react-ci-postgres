import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  // ปิด tree shaking เพราะ Rollup ค้างระหว่าง optimize ใน runtime ที่ใช้ตรวจ
  // ยัง bundle และ minify ตามปกติ เหมาะกับตัวอย่างโปรเจกต์ขนาดเล็กนี้
  build: { rollupOptions: { treeshake: false } },
  server: {
    port: 5173, strictPort: true,
    // Browser เรียก /api ที่พอร์ตเดียวกับหน้าเว็บ แล้ว Vite ส่งต่อไป backend
    // backend คือชื่อ service ใน Compose ไม่ใช่ localhost ภายใน container
    proxy: { '/api': { target: 'http://backend:80', changeOrigin: true } },
  },
});
