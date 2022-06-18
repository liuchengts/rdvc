import {io, Socket} from "socket.io-client";
// @ts-ignore
import {Events} from "../../../../common/events";
import {desktopService} from "../desktop";
// @ts-ignore
import {calculatedLength, packageResponse, processResponse, Response, Screen} from "../../../../common/data";

interface ClientSocketService {

    init(connection: string, opts: any): void

    subscribe(event: Events, process?: Function): void

    defaultSubscribe(): void

    replyToServer(event: Events, response: Response<any>): void

    /**
     * 向服务器发起加入指定房间的请求
     * @param roomId 房间号
     */
    joinRoom(roomId: string): void

    /**
     * 服务器确认已经加入房间后的处理事件
     * @param roomId 已经加入的房间号
     */
    addRoomProcess(roomId: string): void

    /**
     * 房间订阅处理
     * @param roomId 已经加入的房间号
     * @param data 房间收到的订阅消息
     */
    roomSubscribeProcess(roomId: string, data: any): void

    /**
     * 向服务器发起退出指定房间的请求
     * @param roomId 房间号
     */
    leaveRoom(roomId: string): void

    /**
     * 推送到所有房间
     * @param roomIds 房间号
     * @param response 数据
     */
    pushToRoom(roomIds: string[], response: Response<any>): void


}

class ClientSocketServiceImpl implements ClientSocketService {

    private socket?: Socket

    private rooms = new Array<string>()

    init(connection: string) {
        this.socket = io(connection)
        this.defaultSubscribe()
    }

    subscribe(event: Events, process?: Function) {
        this.socket?.on(event, (data: any) => {
            if (process != null) {
                process(data)
            }
        })
    }

    addRoomProcess(roomId: string) {
        if (this.rooms.indexOf(roomId) == -1) {
            this.rooms.push(roomId)
        }
        //将桌面添加房间订阅
        desktopService.addRooms(roomId)
    }

    subscribeRoom(roomId: string, process?: Function) {
        this.addRoomProcess(roomId)
        this.socket?.on(roomId, (data: any) => {
            if (process != null) {
                process(roomId, data)
            }
        })
    }

    roomSubscribeProcess(roomId: string, data: any) {
        console.log("roomSubscribeProcess [", roomId, "]=> 收到消息长度:", calculatedLength(data));
        processResponse<Screen>(data, (response: Response<Screen>) => {
            // 这里收到room的消息 ，注意 需要判断这个消息是不是自己发的，如果是，就忽略掉
            if (this.socket != null && response.data?.socketId == this.socket?.id) {
                console.log("是自己发的消息，忽略掉")
                return
            } else {
                //todo   当前客户端可能在观看其他人屏幕，需要将此data进行下一步处理
            }
        })
    }

    joinRoom(roomId: string) {
        this.replyToServer(Events.JOIN_ROOM, new Response<string>(true, roomId))
    }

    leaveRoom(roomId: string) {
        this.replyToServer(Events.LEAVE_ROOM, new Response<string>(true, roomId))
    }

    replyToServer(event: Events, response: Response<any>): void {
        packageResponse(response, (result: Buffer) => {
            this.socket?.compress(true).emit(event, result)
        })
    }

    pushToRoom(roomIds: string[], response: Response<any>) {
        packageResponse(response, (result: Buffer) => {
            roomIds.forEach(roomId => {
                console.log("向房间[", roomId, "]发消息,长度:", calculatedLength(result))
                // this.socket?.emit(roomId, result)
                this.socket?.compress(true).emit(roomId, result)
            })
        })
    }

    defaultSubscribe() {
        this.subscribe(Events.CONNECT, (data: any) => {
            console.log(Events.CONNECT, "=>", this.socket?.id);
            desktopService.setSocketId(this.socket?.id)
            // todo 临时启动
            desktopService.desktopInit()
        })
        this.subscribe(Events.INIT, (data: Buffer) => {
            processResponse<string>(data, (response: Response<string>) => {
                console.log(Events.INIT, "=>", response);
            })
            this.subscribe(Events.JOIN_ROOM, (data: Buffer) => {
                processResponse<string>(data, (response: Response<string>) => {
                    console.log(Events.JOIN_ROOM, "=>", response);
                    let roomId = response.data
                    if (roomId == null) {
                        console.log("加入房间失败");
                        return
                    }
                    //订阅房间
                    this.subscribeRoom(roomId, (roomId: string, data: string) =>
                        this.roomSubscribeProcess(roomId, data))
                })
            })
        })
        this.subscribe(Events.LEAVE_ROOM, (data: Buffer) => {
            processResponse<string>(data, (response: Response<string>) => {
                console.log(Events.LEAVE_ROOM, "=>", response);
                let roomId = response.data
                if (roomId == null) {
                    console.log("退出房间失败");
                    return
                }
                desktopService.delRooms(roomId)
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
