import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server:{
    cors:{
      origin: /^https?:\/\/(?:.+\.)?localhost(?::\d+)?$/,  
      
    },
    proxy:{
      "/api/ai":{
        target: "http://localhost:6000",
        changeOrigin: true,
        secure: false,
      },
      "/api/agent-ws": {
        target: "http://localhost:5000",
        changeOrigin: true,
        ws: true,
      },
      "/api/agent":{
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
      "/api":{
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    }
  }
})

