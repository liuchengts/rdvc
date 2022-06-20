import {io, Socket} from "socket.io-client";
// @ts-ignore
import {Events} from "../../../../common/events";
import {desktopService} from "../desktop";
// @ts-ignore
import {
    calculatedLength,
    packageResponse,
    processResponse,
    Response,
    RoomDetails,
    Screen
} from "../../../../common/data";
import {screenData} from "../api/listens";

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

    /**
     * 推送到所有房间
     * @param roomIds 房间号
     * @param response 数据
     */
    pushToRoom(roomIds: string[], response: Response<any>): void


}

class ClientSocketServiceImpl implements ClientSocketService {

    private socket?: Socket

    private roomAttribution = new Map<string, RoomDetails>()

    init(connection: string) {
        this.socket = io(connection)
        this.defaultSubscribe()
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
        let details = this.roomAttribution.get(roomDetails.roomId)
        if (details == null) {
            this.roomAttribution.set(roomDetails.roomId, roomDetails)
            //将桌面添加房间订阅
            desktopService.addRooms(roomDetails.roomId)
        }
    }

    joinRoom(roomId?: string) {
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
                this.socket?.compress(true).emit(roomId, result)
            })
        })
    }

    defaultSubscribe() {
        this.subscribe(Events.CONNECT, (data: any) => {
            console.log(Events.CONNECT, "=>", this.socket?.id);
            desktopService.setSocketId(this.socket?.id)
            // todo 临时启动
            // desktopService.desktopInit()
            // this.joinRoom("66611000")
        })
        this.subscribe(Events.INIT, (data: Buffer) => {
            processResponse<string>(data, (response: Response<string>) => {
                console.log(Events.INIT, "=>", response);
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
                    // todo 临时加入 测试leaveRoom
                    // this.leaveRoom(roomDetails.roomId)
                    // console.log("向服务器发送退出房间")
                })
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
            processResponse<Screen>(data, (response: Response<Screen>) => {
                console.log(Events.SCREEN, "=>", response);
                // if (response.data == null) return
                // screenData(response.data.imgBuffer)
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
