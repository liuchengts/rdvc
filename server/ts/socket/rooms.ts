import {ClientSocket, clientSocketService, serverSocketService} from "./server";
import {Events} from "../../../common/events";
import {Response} from "../../../common/data";

interface RoomService {
    /**
     * 加入一个房间,若指定的房间号不存在会自动创建一个
     * @param client 要加入的客户端
     * @param index 要加入的房号
     */
    joinRoom(client: ClientSocket, index?: string): Room | undefined

    /**
     * 获取房间
     * @param index 房号
     * @param room 房间
     */
    getRoom(index?: string, room?: Room): Room | undefined

    /**
     * 创建房间时,获取一个可用的房间号(没有被其他房间使用的)
     */
    getAvailableIndex(): string

    /**
     * 删除一个房间,同时房间中的所有成员都离开房间
     * @param index 房间号
     * @param room  房间
     */
    del(index?: string, room?: Room): void

    /**
     * 把房间底下的某个客户端移除房间
     * @param client 客户端
     * @param index 房间号
     * @param room 房间
     */
    leaveRoom(client: ClientSocket, index?: string, room?: Room): void


    /**
     * 创建房间
     */
    createRoom(): Room | undefined
}

class RoomServiceImpl implements RoomService {

    /**
     * 房间存储
     */
    private rooms = new Map();
    /**
     * 初始房间号起始量
     */
    private initialIndex = 0;
    /**
     * 当前最大的房间号（在用值）
     */
    private lastIndex = 0;

    leaveRoom(client: ClientSocket, index?: string, room?: Room): void {
        let leaveRoom = this.getRoom(index, room)
        if (leaveRoom == undefined) return
        leaveRoom.leave(client)
        if (leaveRoom.clients == undefined || leaveRoom.clients.length <= 0) {
            this.del(index, leaveRoom)
        }
        serverSocketService.pushToClientLocal(client, Events.LEAVE_ROOM, new Response(true, leaveRoom.index,
            "退出[" + leaveRoom.index + "]成功"))
    }

    createRoom(): Room | undefined {
        let room: Room | undefined
        let index = this.getAvailableIndex()
        if (this.rooms.has(index)) {
            console.warn("rooms 已存在", index)
            room = this.getRoom(index)
        } else {
            room = new Room(index)
            this.rooms.set(index, room)
        }
        if (room == undefined) return undefined;
        console.log("rooms :", this.rooms)
        return room
    }

    joinRoom(client: ClientSocket, index?: string): Room | undefined {
        let room: Room | undefined
        if (index != null) {
            room = this.getRoom(index)
        } else {
            room = this.createRoom()
        }
        if (room == undefined) {
            console.error("desktop 加入房间失败")
            serverSocketService.pushToClientLocal(client, Events.JOIN_ROOM, new Response(false, null,
                "desktop 加入房间失败"))
            return undefined;
        }
        //todo  这里可能需要加入room是否允许加入的权限判断
        room.join(client)
        serverSocketService.subscribeRoom(client, room.index)
        serverSocketService.pushToClientLocal(client, Events.JOIN_ROOM, new Response(true, room.index,
            "欢迎加入[" + room.index + "]room"))
        return room
    }

    getRoom(index?: string, room?: Room): Room | undefined {
        let runRoom: Room
        if (room != null) {
            runRoom = room
        } else if (index != null) {
            runRoom = this.rooms.get(index)
        } else {
            return undefined
        }
        return runRoom
    }

    getAvailableIndex(): string {
        this.lastIndex = this.initialIndex + this.lastIndex + 1
        return this.lastIndex.toString()
    }

    del(index?: string, delRoom?: Room) {
        let room: Room | undefined
        if (index != null) {
            room = this.getRoom(index)
        } else if (delRoom != null) {
            room = delRoom
        } else {
            return
        }
        if (room == undefined) return;
        if (this.rooms.has(room.index)) {
            room.clear()
            this.rooms.delete(room.index)
        }
    }
}


class Room {

    constructor(public index: string,
                public clients?: Array<string>) {
        this.clients = new Array<string>(10);
    }

    /**
     * 加入房间
     * @param clientSocket 客户端
     */
    join(clientSocket: ClientSocket) {
        if (this.clients?.indexOf(clientSocket.id) != -1) {
            console.warn("已存在", clientSocket.id)
            return
        }
        console.log(clientSocket.client.rooms);
        clientSocket.client.join(this.index)
        console.log(clientSocket.client.rooms);
        this.clients?.push(clientSocket.id)
    }

    /**
     * 离开房间
     * @param clientSocket 客户端
     */
    leave(clientSocket: ClientSocket) {
        let index = this.clients?.indexOf(clientSocket.id)
        if (index == -1) {
            console.error("不存在", clientSocket.id)
            return
        }
        console.log(clientSocket.client.rooms);
        clientSocket.client.leave(this.index)
        console.log(clientSocket.client.rooms);
        this.clients = this.clients?.slice(index, 1)
    }

    /**
     * 清除房间下所有的客户端
     */
    clear() {
        this.clients?.forEach(clientSocketId => {
            this.leave(clientSocketService.get(clientSocketId))
        })
    }
}

export const roomService = new RoomServiceImpl()