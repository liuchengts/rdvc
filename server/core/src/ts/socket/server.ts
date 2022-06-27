import {Server} from "socket.io";
import * as http from "http";
// @ts-ignore
import {Events} from "../../../../../common/events";
// @ts-ignore
import {
    calculatedLength, DesktopScreen,
    packageResponse,
    processResponse, ReconnectDetails,
    Response,
    RoomDetails,
    Screen
} from "../../../../../common/data";
import {desktopService} from "../../../../../client/core/src/desktop/screenshot";
import {RoomsServiceImpl} from "./rooms";

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

    /**
     * 回复客户端消息
     * @param client 客户端
     * @param event 事件
     * @param response  推送的消息
     * @param isDeflate 是否加密
     */
    pushToClientLocal(client: any, event: Events, response: Response<any>, isDeflate?: boolean): void
}

class ServerSocketServiceImpl implements ServerSocketService {
    /**
     * 服务端 socket
     */
    private socket?: Server;
    private roomsService?: RoomsServiceImpl;

    init(port: number, httpServer: http.Server) {
        this.socket = new Server(httpServer, {
            cors: {
                origin: "http://localhost:" + port,
                credentials: true
            }
        });
        this.socket.on(Events.CONNECTION, (client: any) => {
            console.log("#socket server: welcome", Events.CONNECTION, "=>", client.id);
            this.pushToClientLocal(client, Events.INIT, new Response(true, null,
                "欢迎连接socket"))
            this.defaultSubscribe(client)
        });
        this.socket.listen(port)
        this.roomsService = new RoomsServiceImpl(this.socket)
        console.log("ServerSocket:", port)
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
                this.roomsService?.createAndJoinRoom(client.id, roomId)
            })
        })
        this.subscribe(client, Events.LEAVE_ROOM, (data: any) => {
            console.log("#socket server:", Events.LEAVE_ROOM, "=>", calculatedLength(data));
            processResponse<string>(data, (response: Response<string>) => {
                if (response.data == null) return
                this.roomsService?.leaveRoom(client.id, response.data)
            })
        })
        this.subscribe(client, Events.SCREEN, (data: any) => {
            console.log("#socket server:", Events.SCREEN, "=>", calculatedLength(data));
            processResponse<DesktopScreen>(data, (response: Response<DesktopScreen>) => {
                if (response.data == null) {
                    console.log("data不能为空")
                    return
                }
                this.pushToClients(response.data.rooms, Events.SCREEN, response)
            })
        })
        this.subscribe(client, Events.RECONNECT_UPDATE, (data: any) => {
            console.log("#socket server:", Events.RECONNECT_UPDATE, "=>", calculatedLength(data));
            processResponse<ReconnectDetails>(data, (response: Response<ReconnectDetails>) => {
                if (response.data == null) return
                console.log(Events.RECONNECT_UPDATE, response.data)
                this.roomsService?.recoveryRoom(response.data)
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
