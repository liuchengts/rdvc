import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// import {clientSocket} from "@/ts/socket/ClientIo";
import {clientSocketService} from "@/ts/socket/client";

createApp(App)
  // .use(clientSocket)
  .use(store)
  .use(router)
  .use(ElementPlus)
  .mount('#app')

const SOCKET_PROT = 8000
//server 地址
// const connection = "http://localhost:" + SOCKET_PROT
const connection = "http://10.30.70.14:" + SOCKET_PROT
clientSocketService.init(connection);
