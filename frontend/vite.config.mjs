import react from '@vitejs/plugin-react'
import autoprefixer from 'autoprefixer'
import path from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig(() => {
  return {
    base: './',
    build: {
      outDir: 'build',
    },
    css: {
      postcss: {
        plugins: [
          autoprefixer({}), // add options if needed
        ],
      },
    },
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.jsx?$/,
      exclude: [],
    },
    optimizeDeps: {
      force: true,
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },
    plugins: [react()],
    resolve: {
      alias: [
        {
          find: 'src/',
          replacement: `${path.resolve(__dirname, 'src')}/`,
        },
      ],
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.scss'],
    },
    server: {
      port: 8000,
      allowedHosts: ['https://gtsm1.lexartlabs.com.br', 'gtsm1.lexartlabs.com.br'],
      proxy: {
        // https://vitejs.dev/config/server-options.html
      },
    },
  }
})
