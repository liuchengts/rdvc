import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import {clientSocket} from "@/ts/socket/ClientIo";

createApp(App)
  .use(clientSocket)
  .use(store)
  .use(router)
  .use(ElementPlus)
  .mount('#app')
