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

const SOCKET_PROT = 8000
const connection = "http://10.30.20.154:" + SOCKET_PROT
clientSocketService.init(connection);
