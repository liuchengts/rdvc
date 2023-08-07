import {io, Socket} from "socket.io-client";

interface ClientSocketService {

  init(connection: string, opts: any): void

  subscribe(event: string, process?: Function): void

  send(event: string, msg: any): void
}

const opts = {transports: ["websocket", "polling", "flashsocket"]}

class ClientSocketServiceImpl implements ClientSocketService {

  private socket?: Socket

  init(connection: string) {
    this.socket = io(connection, opts)
    this.defaultSubscribe()
  }

  send(event: string, msg: any): void {
    this.socket?.compress(true).emit(event, msg)
  }

  subscribe(event: string, process?: Function) {
    this.socket?.on(event, (data: any) => {
      if (process != null) {
        process(data)
      }
    })
  }

  defaultSubscribe() {
    this.subscribe("init", (data: any) => {
      console.log("init", "=>", data);
    })
  }

}


export const clientSocketService = new ClientSocketServiceImpl()
