import {io, Socket} from "socket.io-client";
// @ts-ignore
import {Events} from "../../../../common/events";
import {desktopService, screenService} from "../desktop/screenshot";
// @ts-ignore
import {
    calculatedLength, DesktopScreen,
    packageResponse,
    processResponse, ReconnectDetails,
    Response,
    RoomDetails,
    Screen
} from "../../../../common/data";

interface ClientSocketService {

    init(connection: string, opts: any): void

    subscribe(event: Events, process?: Function): void

    defaultSubscribe(): void

    replyToServer(event: Events, response: Response<any>): void

    /**
     * 向服务器发起加入指定房间的请求
     * @param roomId 房间号 为空表示由服务器分配
     */
    joinRoom(roomId?: string): void

    /**
     * 服务器确认已经加入房间后的处理事件
     * @param roomDetails 已经加入的房间
     */
    addRoomProcess(roomDetails: RoomDetails): void

    /**
     * 向服务器发起退出指定房间的请求
     * @param roomId 房间号
     */
    leaveRoom(roomId: string): void

    addScreenCache(rooms: string[], screen: Screen): void

    shiftScreenCache(rooms: string): Screen | undefined
}

class ClientSocketServiceImpl implements ClientSocketService {

    private socket?: Socket
    private oldSocketId?: string
    private roomAttribution = new Map<string, RoomDetails>()
    private isReconnect = false
    private screenCache = new Map<string, Array<Screen>>()
    private screenCacheMax = 3


    test() {
        // todo 临时启动
        // desktopService.desktopInit()
        // this.joinRoom("1")
    }

    shiftScreenCache(roomId: string): Screen | undefined {
        const mapCache = this.screenCache.get(roomId)
        if (mapCache == null) {
            console.log("不存在 mapCache:", roomId)
            return undefined
        }
        //todo  这里拉取一帧数据需要考虑多个客户端拉取同一个room的情况
        return mapCache.shift()
    }

    addScreenCache(rooms: string[], screen: Screen) {
        rooms.forEach(roomId => {
            const mapCache = this.screenCache.get(roomId)
            if (mapCache == null) {
                this.screenCache.set(roomId, Array(screen))
            } else {
                if (mapCache.length >= this.screenCacheMax) {
                    mapCache.shift()
                    console.log("移除最早的一个 mapCache")
                }
                mapCache.push(screen)
                this.screenCache.set(roomId, mapCache)
            }
        })
    }

    init(connection: string) {
        this.socket = io(connection)
        this.defaultSubscribe()
        desktopService.desktopInit()
        screenService.suspend()
        console.log("client core clientSocket start");
    }

    subscribe(event: Events, process?: Function) {
        this.socket?.on(event, (data: any) => {
            if (process != null) {
                process(data)
            }
        })
    }

    delRoomProcess(roomDetails: RoomDetails) {
        if (!this.roomAttribution.has(roomDetails.roomId)) return
        desktopService.delRooms(roomDetails.roomId)
        this.roomAttribution.delete(roomDetails.roomId)
    }

    addRoomProcess(roomDetails: RoomDetails) {
        this.roomAttribution.set(roomDetails.roomId, roomDetails)
        //将桌面添加房间订阅
        desktopService.addRooms(roomDetails.roomId)
    }

    joinRoom(roomId?: string) {
        this.replyToServer(Events.JOIN_ROOM, new Response<string>(true, roomId))
    }

    leaveRoom(roomId: string) {
        this.replyToServer(Events.LEAVE_ROOM, new Response<string>(true, roomId))
    }

    replyToServer(event: Events, response: Response<any>): void {
        console.log("向服务器发消息[", event, "]发消息:", response)
        packageResponse(response, (result: Buffer) => {
            this.socket?.compress(true).emit(event, result)
        })
    }

    recoveryRoom() {
        this.isReconnect = false
        // 重连之后保留了room，但是id被更新了
        const socketId = this.socket?.id!
        let rooms = new Array<RoomDetails>()
        this.roomAttribution.forEach((value, key) => {
            if (value.attribution == this.oldSocketId) {
                value.attribution = socketId
            }
            if (value.leave == this.oldSocketId) {
                value.leave = socketId
            }
            let index = value.socketIds.indexOf(this.oldSocketId!)
            if (index == -1) return
            value.socketIds.splice(index, 1)
            value.socketIds.push(socketId)
            rooms.push(value)
        });
        let reconnectDetails = new ReconnectDetails(this.oldSocketId!, socketId, rooms)
        this.oldSocketId = socketId
        this.replyToServer(Events.RECONNECT_UPDATE, new Response<ReconnectDetails>(true, reconnectDetails))
    }

    defaultSubscribe() {
        this.subscribe(Events.CONNECT, (data: any) => {
            console.log(Events.CONNECT, "=>", this.socket?.id, " 是重连:", this.isReconnect);
            desktopService.setSocketId(this.socket?.id)
            if (this.isReconnect) {
                this.recoveryRoom()
                return
            }
            this.oldSocketId = this.socket?.id
            this.joinRoom()
            this.socket?.io.on(Events.RECONNECT, (data: any) => {
                console.log("#socket client:", Events.RECONNECT, "=>", data);
                this.isReconnect = true
                screenService.continued()
            })
            //todo 这里是测试内容
            // this.test()
        })
        this.subscribe(Events.INIT, (data: Buffer) => {
            processResponse<string>(data, (response: Response<string>) => {
                console.log(Events.INIT, "=>", response);
            })
        })
        this.subscribe(Events.JOIN_ROOM, (data: Buffer) => {
            processResponse<RoomDetails>(data, (response: Response<RoomDetails>) => {
                console.log(Events.JOIN_ROOM, "=>", response);
                let roomDetails = response.data
                if (roomDetails == null) {
                    console.log("加入房间失败");
                    return
                }
                this.addRoomProcess(roomDetails)
                screenService.continued()
            })
        })
        this.subscribe(Events.LEAVE_ROOM, (data: Buffer) => {
            processResponse<RoomDetails>(data, (response: Response<RoomDetails>) => {
                console.log(Events.LEAVE_ROOM, "=>", response);
                let roomDetails = response.data
                if (roomDetails == null) {
                    console.log("退出房间失败");
                    return
                }
                if (roomDetails.attribution == roomDetails.leave) {
                    console.log("房间拥有者主动退出房间 socketId:", roomDetails.leave, " roomId:", roomDetails.roomId)
                    this.delRoomProcess(roomDetails)
                } else {
                    console.log("其他成员主动退出房间 socketId:", roomDetails.leave, " roomId:", roomDetails.roomId)
                }
            })
        })
        this.subscribe(Events.SCREEN, (data: Buffer) => {
            processResponse<DesktopScreen>(data, (response: Response<DesktopScreen>) => {
                if (response.data == null) return
                const screen = response.data!.screen
                //todo  测试打开
                if (screen.socketId == this.socket?.id) {
                    console.log("收到自己发出的消息，忽略掉")
                    return
                }
                console.log("收到共享屏幕消息", Events.SCREEN, "=>", response);
                this.addScreenCache(response.data!.rooms!, screen)
            })
        })
        this.subscribe(Events.DESKTOP_STOP, (data: Buffer) => {
            screenService.suspend()
        })
        this.subscribe(Events.DISCONNECT, (data: any) => {
            console.log("#socket client:", Events.DISCONNECT, "=>", data);
            screenService.suspend()
        })
        this.subscribe(Events.ERROR, (data: any) => {
            console.log("subscribe#socket client:", Events.ERROR, "=>", data);
        })
    }

}

export const clientSocketService = new ClientSocketServiceImpl()
