// @ts-ignore
import {Server} from "socket.io";
// @ts-ignore
// import * as http from "http";
import * as https from "https";

interface ServerSocketService {
    /**
     * 初始化模块方法
     * @param port 端口
     * @param httpServer http实例
     */
    init(port: number, httpServer: https.Server): void

    /**
     * 客户端订阅
     * @param client 客户端
     * @param event 订阅事件
     * @param process 订阅处理函数
     */
    subscribe(client: Server, event: string, process?: Function): void

    /**
     * 给指定客户端或房间推送消息
     * @param socketId  指定的房间id或者客户端id
     * @param event 推送的事件
     * @param response 推送的消息
     */
    pushToClient(socketId: string, event: string, response: any): void

}

const TOPIC = "offer"

class ServerSocketServiceImpl implements ServerSocketService {
    /**
     * 服务端 socket
     */
    private socket?: Server;
    private clients = new Map<string, any>()

    init(port: number, httpsServer: https.Server) {
        this.socket = new Server(httpsServer, {
            cors: {
                origin: "https://192.168.50.71:" + port,
                credentials: true
            }
        });
        this.socket.on("connection", (client: any) => {
            console.log("#socket server: welcome", "connection", "=>", client.id);
            this.clients.set(client.id, client)
            this.pushToClientLocal(client, "init", "[" + client.id + "]欢迎连接socket")
            this.defaultSubscribe(client)
        });
        this.socket.listen(port)
        console.log("ServerSocket:", port)
    }

    subscribe(client: any, event: string, process?: Function) {
        client.on(event, (data: any) => {
            if (process != null) {
                process(data)
            }
        })
    }

    pushToClientLocal(client: any, event: string, response: any) {
        console.log(event, "推送到[", client.id, "]")
        client.compress(true).emit(event, response);
    }

    pushToClient(socketId: string, event: string, response: any) {
        console.log(event, "推送到[", socketId, "]")
        this.socket?.compress(true).to(socketId).emit(event, response);
    }

    defaultSubscribe(client: any) {
        this.subscribe(client, TOPIC, (data: any) => {
            console.log("#socket server:", TOPIC, "=>", data);
            this.clients.forEach(clientMap => {
                if (clientMap.id != client.id) {
                    this.pushToClientLocal(clientMap, TOPIC, data)
                }
            })
        })
    }
}

export const serverSocketService = new ServerSocketServiceImpl()
