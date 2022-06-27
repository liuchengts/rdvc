import VueSocketIO from 'vue-3-socket.io';
import SocketIO from "socket.io-client";

const client_socket_prot = 8000
const connection = "http://10.30.20.177:" + client_socket_prot
// const connection = "http://192.168.50.71:" + client_socket_prot
const opts = {transports: ["websocket", "polling", "flashsocket"]}
export let clientSocket = new VueSocketIO({
  debug: true,
  connection: SocketIO(String(connection), opts),
  vuex: {
    actionPrefix: 'SOCKET_',
    mutationPrefix: 'SOCKET_'
  }
})
