/**
 * 顶级数据返回模型
 */
export class Response<T> {
  constructor(public successful: boolean,
              public data?: T,
              public message?: string) {
  }
}
