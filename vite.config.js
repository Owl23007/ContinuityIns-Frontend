import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

import { fa } from 'element-plus/es/locales.mjs'

// 动态环境变量处理
const envResolver = (mode) => {
  return loadEnv(mode, process.cwd(), 'VITE_')
}

export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = envResolver(mode)
  const isDev = mode === 'development'

  return {
    // 基础路径 (需与路由配置一致)
    base: env.VITE_BASE_URL || '/',

    // 核心插件
    plugins: [
      vue(),
      fa,
    ],

    // 开发服务器配置
    server: {
      host: '0.0.0.0',
      port: 5173,
      open: true,
      // 文件系统权限
      fs: {
        strict: false,
        allow: [
          process.cwd(),
        ]
      },
    },

    // 构建配置
    build: {
      target: 'esnext',
      minify: 'terser',
      sourcemap: isDev,
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          // 文件分类策略
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return id.toString().split('node_modules/')[1].split('/')[0].toString();
            }
          },
        }
      },
      // 生产环境清除console
      terserOptions: {
        compress: {
          drop_console: !isDev,
          drop_debugger: !isDev
        }
      }
    },

    // 解析配置
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
      extensions: ['.mjs', '.js', '.ts', '.vue', '.json',]
    },
  }
})