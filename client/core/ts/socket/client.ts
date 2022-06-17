import {io, Socket} from "socket.io-client";
import {Events} from "../common/events";
import {desktopService} from "../desktop";
import {gZipService} from "../common/gzip";
import {processResponse, Response, Screen} from "../common/data";

interface ClientSocketService {

    init(connection: string, opts: any): void

    subscribe(event: Events, process?: Function): void

    defaultSubscribe(): void
}

class ClientSocketServiceImpl implements ClientSocketService {
    private socket?: Socket

    init(connection: string) {
        this.socket = io(connection)
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
                process(roomId,data)
            }
        })
    }

    roomProcess(roomId: string, data: any) {
        console.log("roomProcess [", roomId, "]=>", data);
        processResponse<Screen>(data, (response) => {
            response.data
        })
    }

    defaultSubscribe() {
        this.subscribe(Events.CONNECT, (data: any) => {
            console.log(Events.CONNECT, "=>", data);
            //开始task
            desktopService.desktopInit()
        })
        this.subscribe(Events.INIT, (data: string) => {
            console.log(Events.INIT, "=>", data.length);
            processResponse(data, (response: Response<string>) => {
                let roomId = response.data
                console.log("[", roomId, "]=>", data);
                //订阅房间
                this.subscribeRoom(roomId, (roomId:string, data: string) => this.roomProcess(roomId, data))
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


export const clientSocketService = new ClientSocketServiceImpl()
