export const enum Events {
    CONNECTION = "connection",//服务端启动 -
    CONNECT = "connect",//客户端连接 -
    DISCONNECT = "disconnect",//关闭 -
    RECONNECT = "reconnect",//客户端重新连接 -
    ERROR = "error",//异常 -
    INIT = "init",//初始化
    JOIN_ROOM = "joinRoom",//加入房间
}