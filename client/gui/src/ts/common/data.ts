/**
 * 顶级数据返回模型
 */
export class AResponse<T> {
  constructor(public data?: T,
              public message?: string,
              public serverTime?: string,
              public status?: string) {
  }
}

/**
 * 分页返回信息模型
 */
class PageInfo {
  constructor(public isLastPage?: boolean, //是否是最后一页
              public pageIndex?: number, //当前页码(从1开始)
              public pageSize?: number, //每页记录数
              public total?: number, //总记录数
              public pageTotal?: number) {
  }
}

/**
 * 分页返回对象模型
 */
export class PageResult<T> {
  constructor(public pageInfo?: PageInfo, //分页信息
              public result?: Array<T>, //数据集
              public message?: number, //消息
              public serverTime?: string //处理时间
  ) {
  }
}

/**
 * 分页请求入参模型
 */
export class APageRequest {
  constructor(public pageIndex?: number, //页码，即第几页，从1开始
              public pageSize?: number, //每页记录数，默认20，最大100
              public query?: string, //搜索词
              public sort?: string //排序
  ) {
  }
}
