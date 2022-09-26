import {ReconnectDetails, Response, RoomDetails} from "../../../../../common/data";
import {Server} from "socket.io";
import {Events} from "../../../../../common/events";
import {serverSocketService} from "./server";

interface RoomsService {
    /**
     * 将socket客户端加入某个房间
     * @param socketId  socket客户端
     * @param roomId  房间号
     */
    joinRoom(socketId: string, roomId: string): void

    /**
     * 将socket客户端移除某个房间
     * @param socketId  socket客户端
     * @param roomId  房间号
     */
    leaveRoom(socketId: string, roomId: string): void

    /**
     * 创建并加入一个房间
     * @param socketId socket客户端
     * @param roomId 房间号
     */
    createAndJoinRoom(socketId: string, roomId: string): void

    /**
     * 客户端重连到房间的处理
     * @param reconnectDetails 重连信息
     */
    recoveryRoom(reconnectDetails: ReconnectDetails): void

    /**
     * 强制让某个房间下的所有socket客户端关闭连接
     * @param roomId  房间号
     */
    disconnectRoom(roomId: string): void
}

export class RoomsServiceImpl implements RoomsService {
    constructor(public socket: Server) {
    }

    /**
     * 房间的归属者
     */
    private roomAttribution = new Map<string, RoomDetails>()

    createAndJoinRoom(socketId: string, roomId: string): void {
        let roomDetails = this.roomAttribution.get(roomId)
        if (roomDetails == null) {
            //不存在房间，注册为房间拥有者
            roomDetails = new RoomDetails(roomId, socketId, [socketId])
        } else {
            roomDetails.socketIds.push(socketId)
        }
        this.roomAttribution.set(roomId, roomDetails)
        this.joinRoom(socketId, roomId)
        serverSocketService.pushToClient(roomId, Events.JOIN_ROOM, new Response<RoomDetails>(true, roomDetails, "new room id"))
    }

    joinRoom(socketId: string, roomId: string): void {
        this.socket?.in(socketId).socketsJoin(roomId)
    }

    leaveRoom(socketId: string, roomId: string): void {
        let roomDetails = this.roomAttribution.get(roomId)
        if (roomDetails != null) {
            roomDetails.leave = socketId
            if (roomDetails.attribution == socketId) {
                console.log("房间拥有者主动退出房间 socketId:", socketId, " roomId:", roomId)
                serverSocketService.pushToClient(socketId, Events.LEAVE_ROOM, new Response<RoomDetails>(true, roomDetails))
                //清除房间
                this.roomAttribution.delete(roomId)
            } else {
                serverSocketService.pushToClient(roomId, Events.LEAVE_ROOM, new Response<RoomDetails>(true, roomDetails))
            }
        }
        if (this.roomAttribution.size <= 0) {
            serverSocketService.pushToClient(socketId, Events.DESKTOP_STOP, new Response<void>(true))
        }
        this.socket?.in(socketId).socketsLeave(roomId)
    }

    recoveryRoom(reconnectDetails: ReconnectDetails): void {
        reconnectDetails.rooms.forEach(value => {
            let key = value.roomId
            let room = this.roomAttribution.get(key)
            if (room == null) {
                this.roomAttribution.set(key, value)
            } else {
                if (room.attribution == reconnectDetails.oldSocketId) {
                    room.attribution = reconnectDetails.newSocketId
                }
                if (room.leave == reconnectDetails.oldSocketId) {
                    room.leave = reconnectDetails.newSocketId
                }
                let index = value.socketIds.indexOf(reconnectDetails.oldSocketId!)
                if (index != -1) {
                    room.socketIds.splice(index, 1)
                    room.socketIds.push(reconnectDetails.newSocketId)
                }
                this.roomAttribution.set(key, room)
            }
            //重新加入房间
            this.joinRoom(reconnectDetails.newSocketId, key)
        })
    }

    disconnectRoom(roomId: string) {
        this.socket?.in(roomId).disconnectSockets(true)
    }

    getBySocketIdRoom(socketId: string): string[] {
        let roomIds = new Array<string>()
        this.roomAttribution.forEach((value, key) => {
            let index = value.socketIds.indexOf(socketId)
            if (index != -1) {
                roomIds.push(key)
            }
        });
        return roomIds
    }
}
