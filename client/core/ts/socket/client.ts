import {io, Socket} from "socket.io-client";
import {Events} from "../common/events";
import {desktopService} from "../desktop";
import {packageResponse, processResponse, Response, Screen, ServiceType} from "../common/data";

interface ClientSocketService {

    init(connection: string, opts: any): void

    subscribe(event: Events, process?: Function): void

    defaultSubscribe(): void

    replyToServer(event: Events, response: Response<any>): void

    /**
     * 向服务器发起加入指定房间的请求
     * @param roomId
     */
    joinRoom(roomId: string): void

    /**
     * 推送到所有房间
     * @param roomIds 房间号
     * @param response 数据
     */
    pushToRoom(roomIds: string[], response: Response<any>): void
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
                process(roomId, data)
            }
        })
    }

    roomProcess(roomId: string, data: any) {
        console.log("roomProcess [", roomId, "]=>", data);
        processResponse<Screen>(data, (response: Response<Screen>) => {
            // 这里收到room的消息 ，注意 需要判断这个消息是不是自己发的，如果是，就忽略掉
            if (this.socket != null && response.data?.socketId == this.socket?.id) {
                console.log("是自己发的消息，忽略掉")
                return
            } else {
                // 当前客户端可能在观看其他人屏幕，需要将此data进行下一步处理
            }
        })
    }

    joinRoom(roomId: string) {
        this.replyToServer(Events.INIT, new Response<string>(true, ServiceType.APPLY, roomId))
    }

    replyToServer(event: Events, response: Response<any>): void {
        packageResponse(response, (result: string) => {
            this.socket?.compress(true).emit(event, result)
        })
    }

    pushToRoom(roomIds: string[], response: Response<any>) {
        packageResponse(response, (result: string) => {
            roomIds.forEach(roomId => {
                this.socket?.compress(true).emit(roomId, result)
            })
        })
    }

    defaultSubscribe() {
        this.subscribe(Events.CONNECT, (data: any) => {
            console.log(Events.CONNECT, "=>", data);
            //开始task
            desktopService.desktopInit(data.socketId)
        })
        this.subscribe(Events.INIT, (data: string) => {
            console.log(Events.INIT, "=>", data.length);
            processResponse(data, (response: Response<string>) => {
                let roomId = response.data
                console.log("[", roomId, "]=>", data);
                if (roomId == undefined) {
                    console.error("没有房间号,忽略本次处理(需要请求服务器重新下发roomId)")
                    return
                }
                //将桌面添加房间订阅
                desktopService.addRooms(roomId)
                //订阅房间
                this.subscribeRoom(roomId, (roomId: string, data: string) =>
                    this.roomProcess(roomId, data))
            })
        })
        this.subscribe(Events.DISCONNECT, (data: any) => {
            console.log("#socket client:", Events.DISCONNECT, "=>", data);
        })
        this.subscribe(Events.ERROR, (data: any) => {
            console.log("subscribe#socket client:", Events.ERROR, "=>", data);
        })
    }

}


export const clientSocketService = new ClientSocketServiceImpl()
