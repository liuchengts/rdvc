// @ts-ignore
import {gZipService} from "./gzip";

/**
 * 顶级数据返回模型
 */
export class Response<T> {
    constructor(public successful: boolean,
                public data?: T,
                public message?: string) {
    }
}
export class DesktopScreen {
    constructor(public rooms: string[],
                public screen: Screen,
                public time: Date) {
    }
}

/**
 * 屏幕数据
 */
export class Screen {
    constructor(
        public socketId: string,
        public imgBuffer: Buffer,
        public quality: number,
        public extension: string,
        public width?: number,
        public height?: number) {
    }
}

/**
 * 房间信息传输模型
 */
export class RoomDetails {
    constructor(
        public roomId: string,
        public attribution: string,
        public socketIds: string[],
        public leave?: string) {
    }
}

/**
 * 客户端重连信息更新
 */
export class ReconnectDetails {
    constructor(
        public oldSocketId: string,
        public newSocketId: string,
        public rooms: RoomDetails[]) {
    }
}

/**
 * 解析 Response
 * @param data 压缩加密后的数据
 * @param successfulCallback 成功处理函数
 * @param errorCallback 失败处理函数
 */
export function processResponse<T>(data: Buffer, successfulCallback: Function, errorCallback?: Function) {
    gZipService.inflate(data, (result: string) => {
        let response = JSON.parse(result) as Response<T>
        if (response.successful) {
            successfulCallback(response)
        } else {
            console.error("失败:", response)
            if (errorCallback != null) errorCallback(response)
        }
    })
}

/**
 * 压缩加密打包
 * @param response 要发送的对象
 * @param callback 处理函数
 */
export function packageResponse(response: Response<any>, callback: Function) {
    let msg = JSON.stringify(response)
    gZipService.deflate(msg, (result: Buffer) => {
        callback(result)
    })
}

export function calculatedLength(buffer: Buffer | string): string {
    return buffer.length / 1024 + " kb"
}