import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import {client_socket_init} from "@/ts/socket/client";
// import {clientSocket} from "@/ts/socket/ClientIo";

createApp(App)
  // .use(clientSocket)
  .use(store)
  .use(router)
  .use(ElementPlus)
  .mount('#app')

const SOCKET_PROT = 8000
const connection = "http://localhost:" + SOCKET_PROT
client_socket_init(connection);
