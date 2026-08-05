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
      "/api/auth":{
        target: "http://localhost",
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: "localhost",   // rewrite cookie domain so browser stores it
        configure: (proxy) => {
          // Forward set-cookie headers from auth service to the browser
          proxy.on('proxyRes', (proxyRes) => {
            const setCookie = proxyRes.headers['set-cookie'];
            if (setCookie) {
              // Strip 'Domain' attribute so cookie is valid for localhost
              proxyRes.headers['set-cookie'] = setCookie.map(c =>
                c.replace(/;\s*Domain=[^;]*/gi, '')
              );
            }
          });
        },
      },
      "/api/ai":{
        target: "http://localhost",
        changeOrigin: true,
        secure: false,
      },
      "/api/agent-ws": {
        target: "http://localhost",
        changeOrigin: true,
        ws: true,
      },
      "/api/agent":{
        target: "http://localhost",
        changeOrigin: true,
        secure: false,
      },
      "/api":{
        target: "http://localhost",
        changeOrigin: true,
        secure: false,
      },
    }
  }
})

