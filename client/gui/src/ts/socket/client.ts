import {io, Socket} from "socket.io-client";
// @ts-ignore
import {Events} from "../../../../../common/events";
// @ts-ignore
import {gZipService} from "../../../../../common/gzip";
// @ts-ignore
import {
  calculatedLength,
  DesktopScreen,
  packageResponse,
  processResponse,
  Response,
  RoomDetails
} from "../../../../../common/data";
import {Buffer} from "buffer";

interface ClientSocketService {

  init(connection: string, opts: any): void

  subscribe(event: Events, process?: Function): void

  defaultSubscribe(): void

  screen(callback: Function): void

  joinRoom(roomId: string, callback: Function): void

  replyToServer(event: Events, response: Response<any>): void
}

class ClientSocketServiceImpl implements ClientSocketService {
  private socket?: Socket

  init(connection: string) {
    this.socket = io(connection, opts)
    this.defaultSubscribe()
  }

  replyToServer(event: Events, response: Response<any>) {
    packageResponse(response, (result: Buffer) => {
      console.log("向服务器发消息[", event, "]发消息:",calculatedLength(result))
      this.socket?.compress(true).emit(event, result)
    })
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
    this.subscribe(Events.INIT, (data: ArrayBuffer) => {
      processResponse<string>(Buffer.from(data), (response: Response<string>) => {
        console.log(Events.INIT, "=>", response);
      })
    })
    this.subscribe(Events.JOIN_ROOM, (data: Buffer) => {
      processResponse<RoomDetails>(Buffer.from(data), (response: Response<RoomDetails>) => {
        let roomDetails = response.data
        if (roomDetails == null) {
          console.log("加入房间失败");
          return
        }
      })
    })
  }

  screen(callback: Function) {
    this.subscribe(Events.SCREEN, (data: ArrayBuffer) => {
      processResponse<DesktopScreen>(Buffer.from(data), (response: Response<DesktopScreen>) => {
        callback(response)
      })
    })
  }

  joinRoom(roomId: string, callback: Function) {
    this.replyToServer(Events.JOIN_ROOM, new Response<string>(true, roomId))
    callback()
  }
}

const opts = {transports: ["websocket", "polling", "flashsocket"]}

export const clientSocketService = new ClientSocketServiceImpl()
