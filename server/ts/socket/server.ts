import {Server} from "socket.io";
import * as http from "http";
import {Events} from "../common/events";
import {roomService} from "./rooms";
import {gZipService} from "../common/gzip";
import {Response} from "../common/data";

interface ClientSocketService {
    /**
     * 删除一个存储
     * @param id Socket分配的clientId
     */
    del(id: string): void

    /**
     * 将一个clientSocket加入存储
     * @param id Socket分配的clientId
     * @param client Socket client对象
     */
    add(id: string, client: Server): ClientSocket

    /**
     * 获取一个存储
     * @param id Socket分配的clientId
     */
    get(id: string): ClientSocket
}

class ClientSocketServiceImpl implements ClientSocketService {

    /**
     * 客户端 Socket 存储
     */
    private clientSockets = new Map();

    add(id: string, client: Server): ClientSocket {
        if (this.clientSockets.has(id)) {
            console.warn("已存在 id:", id)
            return this.get(id)
        }
        let clientSocket = new ClientSocket(client, id)
        this.clientSockets.set(id, clientSocket)
        return clientSocket
    }

    del(id: string) {
        if (!this.clientSockets.has(id)) {
            console.warn("不存在 id:", id)
            return
        }
        this.clientSockets.delete(id)
    }

    get(id: string): ClientSocket {
        return this.clientSockets.get(id)
    }
}


export class ClientSocket {
    constructor(public client: any,
                public id: string) {
    }
}

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
     * @param clientSocket 客户端
     */
    defaultSubscribe(clientSocket: ClientSocket): void

    pushToClientLocal(clientSocket: ClientSocket, event: Events, response: Response<any>, isDeflate?: boolean): void
}

class ServerSocketServiceImpl implements ServerSocketService {
    /**
     * 服务端 socket
     */
    private socket?: Server;

    init(port: number,
         httpServer: http.Server) {
        this.socket = new Server(httpServer, {
            cors: {
                origin: "http://localhost:" + port,
                credentials: true
            }
        });
        this.socket.on(Events.CONNECTION, client => {
            console.log("#socket server: welcome", Events.CONNECTION, "=>", client.id);
            let clientSocket = clientSocketService.add(client.id, client)
            // 客户端的 socket 对象
            this.pushToClientLocal(clientSocket, Events.CONNECT,
                new Response(true, "", "欢迎连接socket"), false)
            let room = roomService.joinRoom(clientSocket)
            if (room != undefined) {
                this.pushToClientLocal(clientSocket, Events.INIT, new Response(true, room.index))
            } else {
                console.error("desktop 加入房间失败")
                this.pushToClientLocal(clientSocket, Events.INIT, new Response(false, "",
                    "desktop 加入房间失败"))
            }
            this.defaultSubscribe(clientSocket)
        });
        this.socket.listen(port)
        console.log("ServerSocket:", port)
    }

    subscribe(client: any, event: Events, process?: Function) {
        client.on(event, data => {
            if (process != null) {
                process(data)
            }
        })
    }

    pushToClientLocal(clientSocket: ClientSocket, event: Events, response: Response<any>, isDeflate?: boolean) {
        let msg = JSON.stringify(response)
        if (isDeflate != null && !isDeflate) {
            console.log(event, "推送到[", clientSocket.id, "]数据长度:", msg.length)
            clientSocket.client.compress(true).emit(event, msg);
        } else {
            gZipService.deflate(msg, (result: string) => {
                console.log(event, "推送到[", clientSocket.id, "]数据长度:", result.length)
                clientSocket.client.compress(true).emit(event, result);
            })
        }
    }

    pushToClient(socketId: string, event: Events, response: Response<any>, isDeflate?: boolean) {
        let msg = JSON.stringify(response)
        if (isDeflate != null && !isDeflate) {
            console.log(event, "推送到[", socketId, "]数据长度:", msg.length)
            this.socket?.compress(true).to(socketId).emit(event, msg);
        } else {
            gZipService.deflate(msg, (result: string) => {
                console.log(event, "推送到[", socketId, "]数据长度:", result.length)
                this.socket?.compress(true).to(socketId).emit(event, result);
            })
        }
    }

    pushToClients(socketIds: string[], event: Events, response: Response<any>) {
        let msg = JSON.stringify(response)
        gZipService.deflate(msg, (result: string) => {
            socketIds.forEach(socketId => {
                console.log(event, "推送到[", socketId, "]数据长度:", result.length)
                this.socket?.compress(true).to(socketId).emit(event, result);
            })
        })
    }

    defaultSubscribe(clientSocket: ClientSocket) {
        this.subscribe(clientSocket.client, Events.DISCONNECT, (data: any) => {
            console.log("#socket server:", Events.DISCONNECT);

        })
        this.subscribe(clientSocket.client, Events.ERROR, (data: Server) => {
            console.log("#socket server:", Events.ERROR, "=>", data);
        })
    }
}

export const clientSocketService = new ClientSocketServiceImpl()
export const serverSocketService = new ServerSocketServiceImpl()
