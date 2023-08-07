import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import {clientSocketService} from "@/ts/socket/client";

createApp(App)
  .use(store)
  .use(router)
  .use(ElementPlus)
  .mount('#app')

const SOCKET_PROT = 443
const connection = "https://192.168.50.71:" + SOCKET_PROT
clientSocketService.init(connection);
