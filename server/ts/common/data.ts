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
        public imgBuffer: Buffer,
        public quality: number,
        public extension: string,
        public width?: number,
        public height?: number) {
    }
}

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