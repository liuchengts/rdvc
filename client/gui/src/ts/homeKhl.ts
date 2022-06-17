import service from "@/ts/common/http"
import {ElMessage} from "element-plus";
import {APageRequest} from "@/ts/common/data";
import {BaseService} from "@/ts/common/serviceSupport";
import qs from "qs";

//定义了当前ts的业务方法
interface HomeKhlInterface {
  search(pageRequest: APageRequest, searchBO: SearchBO, nativeCallback?: Function): void;

  images(showId: number, nativeCallback?: Function): void;
}

/**
 * 定义 搜索 请求的入参
 */
export class SearchBO {
  constructor(public pname?: string, //城市-like
              public address?: string, //地址-like
              public age?: string, //年龄-like
              public faceValue?: string, //打分-like
              public showId?: string, //详情id
              public price?: string, //价格-like
              public projects?: string //项目-like
  ) {
  }
}

/**
 * 定义 搜索 请求的业务出参，相当于 AResponse.data；http.ts 会自动转义的
 */
export class ServiceProvidersVO {
  constructor(public pid?: string, //城市区号
              public pname?: string, //城市名称
              public dname?: string, //行政区划名称
              public address?: string, //详细地址
              public age?: string, //年龄
              public browse?: number, //浏览量
              public releaseTime?: string, //发布时间
              public faceValue?: string, //打分
              public title?: string, //标题
              public showId?: number, //详情id
              public phone?: string, //手机号
              public weChat?: string, //微信
              public price?: string, //价格
              public privacy?: number, //隐私
              public process?: string, //说明
              public projects?: string, //项目
              public status?: string, //状态,
              public earnPoints?: number, //定价积分
              public mainImg?: string //主图

  ) {
  }
}

/**
 * 定义 图片获取 请求的业务出参，相当于 AResponse.data；http.ts 会自动转义的
 */
export class ImagesVO {
  constructor(public images?: Array<string>, //小图片集合
              public mainImg?: string //主图
  ) {
  }
}

/**
 * 实现 LoginInterface
 * 继承 BaseService 获得基础实现
 */
class HomeKhlService extends BaseService implements HomeKhlInterface {
  images(showId: number, nativeCallback?: Function): void {
    this.promiseHandle(service.get('/get_img/' + showId), nativeCallback)
  }

  search(pageRequest: APageRequest, searchBO: SearchBO, nativeCallback?: Function): void {
    if (searchBO != null) {
      pageRequest.query = JSON.stringify(searchBO)
    }
    this.promiseHandle(service.post('/search', pageRequest), nativeCallback)
  }
}

export let homeKhlService = new HomeKhlService()
