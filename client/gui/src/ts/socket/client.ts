import {io, Socket} from "socket.io-client";
// @ts-ignore
import {Events} from "../../../../../common/events";
// @ts-ignore
import {gZipService} from "../../../../../common/gzip";
// @ts-ignore
import {DesktopScreen, processResponse, Response, Status} from "../../../../../common/data";

interface ClientSocketService {

  init(connection: string, opts: any): void

  subscribe(event: Events, process?: Function): void

  defaultSubscribe(): void

  screen(callback: Function): void

  joinRoom(roomId: string, callback: Function): void
}

class ClientSocketServiceImpl implements ClientSocketService {
  private socket?: Socket

  init(connection: string) {
    this.socket = io(connection, opts)
    this.defaultSubscribe()
  }

  subscribe(event: Events, process?: Function) {
    this.socket?.on(event, (data: any) => {
      if (process != null) {
        process(data)
      }
    })
  }

  defaultSubscribe() {
    this.subscribe(Events.CONNECT, (data: any) => {
      console.log(Events.CONNECT, "=>", this.socket?.id);
    })
    this.subscribe(Events.INIT, (data: Buffer) => {
      processResponse<string>(data, (response: Response<string>) => {
        console.log(Events.INIT, "=>", response);
      })
    })
  }

  screen(callback: Function) {
    this.subscribe(Events.SCREEN, (data: Buffer) => {
      processResponse<DesktopScreen>(data, (response: Response<DesktopScreen>) => {
        callback(response)
      })
    })
  }
  joinRoom(roomId: string, callback: Function){

  }
}

const opts = {transports: ["websocket", "polling", "flashsocket"]}

export const clientSocketService = new ClientSocketServiceImpl()
