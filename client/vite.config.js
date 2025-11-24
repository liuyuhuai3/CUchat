 import { defineConfig } from 'vite'
  import vue from '@vitejs/plugin-vue'
  import path from 'path'

  export default defineConfig({
    plugins: [
      vue({
        template: {
          compilerOptions: {
            // 只标记 emoji-picker 为自定义元素，不要标记vue-advanced-chat
            isCustomElement: (tag) => tag === 'emoji-picker'
          }
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    }
  })