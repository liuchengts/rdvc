export const enum Events {
    CONNECTION = "connection",//服务端启动 -
    CONNECT = "connect",//客户端连接 -
    DISCONNECT = "disconnect",//关闭 -
    RECONNECT = "reconnect",//客户端重新连接 -
    ERROR = "error",//异常 -
    INIT = "init",//初始化
    JOIN_ROOM = "joinRoom",//加入房间
    LEAVE_ROOM = "leaveRoom",//退出房间
    DESKTOP_STOP = "desktopStop",//客户端暂停截屏任务
    SCREEN = "screen",//屏幕推图片流
    RECONNECT_UPDATE = "reconnect Update",//客户端重连，更新信息
}