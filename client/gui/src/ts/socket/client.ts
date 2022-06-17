import {io, Socket} from "socket.io-client";
import {Events} from "@/ts/socket/events";
import {gZipService} from "@/ts/socket/gzip";
import {Response, Status} from "@/ts/socket/data";
import {desktopService} from "@/ts/desktop";

interface ClientSocketService {

  init(connection: string, opts: any): void

  subscribe(event: Events, process?: Function): void

  push(event: Events, response: Response<any>): void
  pushToRoom(roomIds: string[], response: Response<any>): void
  defaultSubscribe(): void
}

class ClientSocketServiceImpl implements ClientSocketService {
  private socket?: Socket

  init(connection: string, opts: any) {
    this.socket = io(connection, opts)
    this.defaultSubscribe()
  }

  subscribe(event: Events, process?: Function) {
    this.socket?.on(event, data => {
      if (process != null) {
        process(data)
      }
    })
  }

  subscribeRoom(roomId: string, process?: Function) {
    this.socket?.on(roomId, data => {
      if (process != null) {
        process(data)
      }
    })
  }

  push(event: Events, response: Response<any>) {
    let msg = JSON.stringify(response)
    console.log("push#socket client:[", event, "]=>", msg);
    gZipService.deflate(msg, (result: string) => {
      console.log(event, "推送到[", event, "]数据长度:", result.length)
      this.socket?.compress(true).emit(event, result);
    })
  }

  pushToRoom(roomIds: string[], response: Response<any>) {
    // let msg = JSON.stringify(response)
    // console.log("push#socket client:[", roomIds, "]=>", msg.length);
    // gZipService.deflate(msg, (result: string) => {
    //   roomIds.forEach(roomId => {
    //     console.log("推送到[", roomId, "]数据长度:", result.length)
    //     this.socket?.compress(true).emit(roomId, result);
    //   })
    // })
  }

  roomProcess(data: any) {
    console.log("subscribe#socket client: roomProcess =>", data);
  }

  defaultSubscribe() {
    this.subscribe(Events.CONNECT, (data: any) => {
      console.log("subscribe#socket client:", Events.CONNECT, "=>", data);
      //开始task
      desktopService.desktopInit()
    })
    this.subscribe(Events.INIT, (data: string) => {
      console.log("subscribe#socket client:", Events.INIT, "=>", data.length);
      gZipService.inflate(data, (result: string) => {
        let response = JSON.parse(result) as Response<string>
        if (response.status == Status.OK) {
          let roomId = response.data as string
          console.log("subscribe#socket client:[", roomId, "]=>", data);
          this.subscribeRoom(roomId, (data: any) => this.roomProcess(data))
        }
      })
    })
    this.subscribe(Events.HEARTBEAT, (data: any) => {
      console.log("subscribe#socket client:", Events.HEARTBEAT, "=>", data);
    })
    this.subscribe(Events.DISCONNECT, (data: any) => {
      console.log("#socket client:", Events.DISCONNECT, "=>", data);
    })
    this.subscribe(Events.ERROR, (data: any) => {
      console.log("subscribe#socket client:", Events.ERROR, "=>", data);
    })
    this.subscribe(Events.MESSAGE, (data: any) => {
      console.log("subscribe#socket client:", Events.MESSAGE, data);
    })
  }
}

const opts = {transports: ["websocket", "polling", "flashsocket"]}

export const clientSocketService=new ClientSocketServiceImpl()
