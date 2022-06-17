export const enum Events {
  CONNECTION = "connection",//服务端启动 -
  CONNECT = "connect",//客户端连接 -
  DISCONNECT = "disconnect",//关闭 -
  ERROR = "error",//异常 -
  MESSAGE = "message",//消息 -
  INIT = "init",//初始化
  HEARTBEAT = "heartbeat",//心跳
  AUTHENTICATION = "authentication",//认证
  CONTROL = "control",//控制
  SCREEN = "screen"//画面
}