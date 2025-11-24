  import { createApp } from 'vue';
  import { createPinia } from 'pinia';
  import App from './App.vue';
  import router from './router';
  import * as ElementPlusIconsVue from '@element-plus/icons-vue'; 

  import ElementPlus from 'element-plus';
  import 'element-plus/dist/index.css';
  import 'vue-advanced-chat';
  import 'emoji-picker-element'

  // 导入并注册 vue-advanced-chat
  import { register } from 'vue-advanced-chat';
  register();  // 样式已经包含在 JS 中，无需单独导入 CSS

  const app = createApp(App);
  const pinia = createPinia();

 for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
  }

  app.use(pinia);
  app.use(router);
  app.use(ElementPlus);

  app.mount('#app');