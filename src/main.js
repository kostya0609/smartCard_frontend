import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import locale from 'element-plus/es/locale/lang/ru'
import dayjs from "dayjs";
import "dayjs/locale/ru";
dayjs.locale("ru");

import '@/vdg3/css/style.css'
import '@/vdg3/css/color.css'

import * as ElementPlusIconsVue from '@element-plus/icons-vue'

if (process.env.NODE_ENV == 'development'){
  //   window._userId = 12467;
  //   window._token  = '$2y$10$CIUaM79xGUBy2tKvNlJIU.fw6.04NwcJkAXD5B.pZnzDJZyjeps2y';

    window._userId = 14317;
    window._token  = '$2y$10$NMJZxfAaRIJpLeroZdnB5OQrFlm/o.2Hyx.mZWtADsWN9eyLanpOy';

    //window._userId = 6362;
    //window._token  = '$2y$10$NMJZxfAaRIJpLeroZdnB5OQrFlm/o.2Hyx.mZWtADsWN9eyLanpOy';
}

const app = createApp(App)
app.use(store)
app.use(ElementPlus,  {locale})
app.use(router)


for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.mount('#app')
