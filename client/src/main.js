  import { createApp } from 'vue';
  import { createPinia } from 'pinia';
  import App from './App.vue';
  import router from './router';
  import * as ElementPlusIconsVue from '@element-plus/icons-vue';

  import './assets/tailwind.css';

  import ElementPlus from 'element-plus';
  import 'element-plus/dist/index.css';
  import 'emoji-picker-element'

  // 导入 VueUse Motion
  import { MotionPlugin } from '@vueuse/motion'

  const app = createApp(App);
  const pinia = createPinia();

 for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
  }

  app.use(pinia);
  app.use(router);
  app.use(ElementPlus);
  app.use(MotionPlugin); // 使用 VueUse Motion 插件

  app.mount('#app');