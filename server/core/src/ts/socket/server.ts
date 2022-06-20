import {Server} from "socket.io";
import * as http from "http";
// @ts-ignore
import {Events} from "../../../../../common/events";
// @ts-ignore
import {
    calculatedLength,
    packageResponse,
    processResponse, ReconnectDetails,
    Response,
    RoomDetails,
    Screen
} from "../../../../../common/data";
import {desktopService} from "../../../../../client/core/src/desktop/screenshot";

interface ServerSocketService {
    /**
     * 初始化模块方法
     * @param port 端口
     * @param httpServer http实例
     */
    init(port: number, httpServer: http.Server): void

    /**
     * 客户端订阅
     * @param client 客户端
     * @param event 订阅事件
     * @param process 订阅处理函数
     */
    subscribe(client: Server, event: Events, process?: Function): void

    /**
     * 给指定客户端或房间推送消息
     * @param socketId  指定的房间id或者客户端id
     * @param event 推送的事件
     * @param response 推送的消息
     * @param isDeflate 压缩，默认开启 传递false关闭压缩
     */
    pushToClient(socketId: string, event: Events, response: Response<any>, isDeflate?: boolean): void

    /**
     * 批量给指定客户端或房间推送消息
     * @param socketIds 指定的房间ids或者客户端ids
     * @param event 推送的事件
     * @param response 推送的消息
     */
    pushToClients(socketIds: string[], event: Events, response: Response<any>): void

    /**
     * 客户端默认的订阅事件
     * @param client 客户端
     */
    defaultSubscribe(client: any): void

    pushToClientLocal(client: any, event: Events, response: Response<any>, isDeflate?: boolean): void

    // 系统操作api
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
     * 强制让某个房间下的所有socket客户端关闭连接
     * @param roomId  房间号
     */
    disconnectRoom(roomId: string): void

    /**
     * 获取某个房间下的socket客户端
     * @param roomId 房间号
     * @param callback 回调函数-在获得当前房间下所有socket客户端后执行
     */
    getRoomSockets(roomId: string, callback: Function): void
}

class ServerSocketServiceImpl implements ServerSocketService {
    /**
     * 服务端 socket
     */
    private socket?: Server;
    /**
     * 默认加入的注册房间
     */
    private registerRoom = "REGISTER_ROOM"
    /**
     * 房间的归属者
     */
    private roomAttribution = new Map<string, RoomDetails>()

    init(port: number, httpServer: http.Server) {
        this.socket = new Server(httpServer, {
            cors: {
                origin: "http://localhost:" + port,
                credentials: true
            }
        });
        this.socket.on(Events.CONNECTION, (client: any) => {
            console.log("#socket server: welcome", Events.CONNECTION, "=>", client.id);
            this.joinRoom(client.id, this.registerRoom)
            this.pushToClientLocal(client, Events.INIT, new Response(true, null,
                "欢迎连接socket"))
            this.defaultSubscribe(client)
        });
        this.socket.listen(port)
        console.log("ServerSocket:", port)
    }

    recoveryRoom(reconnectDetails: ReconnectDetails) {
        this.roomAttribution.forEach((value, key) => {
            if (value.attribution == reconnectDetails.oldSocketId) {
                value.attribution = reconnectDetails.newSocketId
            }
            if (value.leave == reconnectDetails.oldSocketId) {
                value.leave = reconnectDetails.newSocketId
            }
            value.socketIds.forEach(id => {
                if (id == reconnectDetails.oldSocketId) {
                    return reconnectDetails.newSocketId
                }
            })
        });
    }

    createAndJoinRoom(socketId: string, roomId: string) {
        if (roomId == this.registerRoom) return
        let roomDetails = this.roomAttribution.get(roomId)
        if (roomDetails == null) {
            //不存在房间，注册为房间拥有者
            roomDetails = new RoomDetails(roomId, socketId, [socketId])
        } else {
            roomDetails.socketIds.push(socketId)
        }
        this.roomAttribution.set(roomId, roomDetails)
        this.joinRoom(socketId, roomId)
        this.pushToClient(socketId, Events.JOIN_ROOM, new Response<RoomDetails>(true, roomDetails, "new room id"))
    }

    joinRoom(socketId: string, roomId: string) {
        this.socket?.in(socketId).socketsJoin(roomId)
    }

    leaveRoom(socketId: string, roomId: string) {
        let roomDetails = this.roomAttribution.get(roomId)
        if (roomDetails != null) {
            roomDetails.leave = socketId
            if (roomDetails.attribution == socketId) {
                console.log("房间拥有者主动退出房间 socketId:", socketId, " roomId:", roomId)
                this.pushToClient(socketId, Events.LEAVE_ROOM, new Response<RoomDetails>(true, roomDetails))
                //清除房间
                this.roomAttribution.delete(roomId)
            } else {
                this.pushToClient(roomId, Events.LEAVE_ROOM, new Response<RoomDetails>(true, roomDetails))
            }
        }
        this.socket?.in(socketId).socketsLeave(roomId)
    }

    disconnectRoom(roomId: string) {
        this.socket?.in(roomId).disconnectSockets(true)
    }

    async getRoomSockets(roomId: string, callback: Function) {
        const sockets = await this.socket?.in(roomId).fetchSockets();
        callback(sockets)
    }

    subscribe(client: Server, event: Events, process?: Function) {
        client.on(event, (data: any) => {
            if (process != null) {
                process(data)
            }
        })
    }

    pushToClientLocal(client: any, event: Events, response: Response<any>, isDeflate?: boolean) {
        if (isDeflate != null && !isDeflate) {
            let msg = JSON.stringify(response)
            console.log(event, "推送到[", client.id, "]数据长度:", calculatedLength(msg))
            client.compress(true).emit(event, msg);
        } else {
            packageResponse(response, (result: Buffer) => {
                console.log(event, "推送到[", client.id, "]数据长度:", calculatedLength(result))
                client.compress(true).emit(event, result)
            })
        }
    }

    pushToClient(socketId: string, event: Events, response: Response<any>, isDeflate?: boolean) {
        if (isDeflate != null && !isDeflate) {
            let msg = JSON.stringify(response)
            console.log(event, "推送到[", socketId, "]数据长度:", calculatedLength(msg))
            this.socket?.compress(true).to(socketId).emit(event, msg);
        } else {
            packageResponse(response, (result: Buffer) => {
                console.log(event, "推送到[", socketId, "]数据长度:", calculatedLength(result))
                this.socket?.compress(true).in(socketId).emit(event, result)
            })
        }
    }

    pushToClients(socketIds: string[], event: Events, response: Response<any>) {
        packageResponse(response, (result: Buffer) => {
            socketIds.forEach(socketId => {
                console.log(event, "推送到[", socketId, "]数据长度:", calculatedLength(result))
                this.socket?.compress(true).to(socketId).emit(event, result);
            })
        })
    }

    defaultSubscribe(client: any) {
        this.subscribe(client, Events.JOIN_ROOM, (data: any) => {
            console.log("#socket server:", Events.JOIN_ROOM, "=>", calculatedLength(data));
            processResponse<string>(data, (response: Response<string>) => {
                let roomId = ""
                if (response.data == null) {
                    roomId = "" + Math.floor(Math.random() * (9999))
                } else {
                    roomId = response.data
                }
                console.log("分配给[", client.id, "] roomId:", roomId)
                this.createAndJoinRoom(client.id, roomId)
            })
        })
        this.subscribe(client, Events.LEAVE_ROOM, (data: any) => {
            console.log("#socket server:", Events.LEAVE_ROOM, "=>", calculatedLength(data));
            processResponse<string>(data, (response: Response<string>) => {
                if (response.data == null) return
                this.leaveRoom(client.id, response.data)
            })
        })
        this.subscribe(client, Events.SCREEN, (data: any) => {
            console.log("#socket server:", Events.SCREEN, "=>", calculatedLength(data));
            processResponse<Screen>(data, (response: Response<Screen>) => {
                if (response.data == null) return
            })
        })
        this.subscribe(client, Events.RECONNECT_UPDATE, (data: any) => {
            console.log("#socket server:", Events.RECONNECT_UPDATE, "=>", calculatedLength(data));
            processResponse<ReconnectDetails>(data, (response: Response<ReconnectDetails>) => {
                if (response.data == null) return
                this.recoveryRoom(response.data)
            })
        })

        this.subscribe(client, Events.DISCONNECT, (data: any) => {
            console.log("#socket server:", Events.DISCONNECT);
        })
        this.subscribe(client, Events.ERROR, (data: Server) => {
            console.log("#socket server:", Events.ERROR, "=>", data);
        })

    }
}

export const serverSocketService = new ServerSocketServiceImpl()
