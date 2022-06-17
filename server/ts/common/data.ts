
export enum Status {
    OK = "ok",
    ERROR = "error",
}

/**
 * 顶级数据返回模型
 */
export class Response<T> {
    constructor(public status: Status,
                public data?: T,
                public message?: string) {
    }
}