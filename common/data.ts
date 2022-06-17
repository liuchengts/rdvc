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
 * 解析 Response
 * @param data 压缩加密后的数据
 * @param callback 处理函数
 */
export function processResponse<T>(data: string, callback: Function) {
    gZipService.inflate(data, (result: string) => {
        let response = JSON.parse(result) as Response<T>
        if (response.successful) {
            callback(response)
        } else {
            console.error("失败:", response)
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
    gZipService.deflate(msg, (result: string) => {
        callback(result)
    })
}