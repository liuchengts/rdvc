import service from "@/ts/common/http"
import {BaseService} from "@/ts/common/serviceSupport";
import {Md5} from 'ts-md5/dist/md5';

/**
 * 定义了当前 ts 登录模块的业务方法
 *
 */
interface LoginInterface {
  /**
   * 登录
   * @param login 登录的参数
   * @param nativeCallback 可选，用 promise 原本的方式回调处理的函数
   */
  login(login: LoginBO, nativeCallback?: Function): void;

  /**
   * 退出登录
   * @param nativeCallback 可选，用 promise 原本的方式回调处理的函数
   */
  out(nativeCallback?: Function): void;

  /**
   * 验证登录是否有效
   * @param nativeCallback 可选，用 promise 原本的方式回调处理的函数
   */
  checkToken(nativeCallback?: Function): void;
}

/**
 * 定义 login 请求的入参
 */
export class LoginBO {
  constructor(public name: string, //账号
              public pwd: string, //密码
              public platform?: number //平台(pc:1)
  ) {
  }
}

/**
 * 定义 login 请求的业务出参，相当于 AResponse.data；http.ts 会自动转义的
 */
export class UserVO {
  constructor(public code?: string, //状态码
              public userNo?: string, //用户编号
              public mobile?: string, //手机号
              public newUser?: boolean, //是新用户(是:true,否:false)
              public deletedUser?: boolean, //是已禁用用户(是:true,否:false)
              public nick?: string, //用户昵称
              public photo?: string, //用户头像
              public xtoken?: string, //X-TOKEN
              public successful?: boolean //是否登录成功
  ) {
  }
}

/**
 * 实现 LoginInterface
 * 继承 BaseService 获得基础实现
 */
class LoginService extends BaseService implements LoginInterface {

  /**
   * 注意：这个方法可以删除，不是必须的，这里写上只是演示方法重写
   * 若 base 类不满足需求，可以重写父类实现
   * 子类重写 nextCallback 方法
   */
  override nextCallback(successCallback?: Function, failedCallback?: Function) {
    console.log("LoginService nextCallback")
    super.nextCallback(successCallback, failedCallback)
  }

  /**
   * 注意：这个方法可以删除，不是必须的，这里写上只是演示方法重写
   * 若 base 类不满足需求，可以重写父类实现
   * 子类重写 promiseHandle 方法
   */
  override promiseHandle(promise: Promise<any>, nativeCallback?: Function) {
    console.log("LoginService promiseHandle")
    super.promiseHandle(promise, nativeCallback)
  }

  /**
   * 通过调用 promiseHandle 实现 login 请求
   * @param loginBO 登录参数
   * @param nativeCallback 若不为空则覆盖 promiseHandle 默认处理，直接执行 nativeCallback
   */
  login(loginBO: LoginBO, nativeCallback?: Function) {
    this.promiseHandle(service.post('/login/', encryption(loginBO)), nativeCallback)
  }

  /**
   * 通过调用 promiseHandle 实现 checkToken 请求
   * @param nativeCallback 若不为空则覆盖 promiseHandle 默认处理，直接执行 nativeCallback
   */
  checkToken(nativeCallback?: Function) {
    this.promiseHandle(service.get('/login/check_token'), nativeCallback)
  }

  /**
   * 通过调用 promiseHandle 实现 out 请求
   * @param nativeCallback 若不为空则覆盖 promiseHandle 默认处理，直接执行 nativeCallback
   */
  out(nativeCallback?: Function) {
    this.promiseHandle(service.get('/login/out'), nativeCallback)
  }
}

function encryption(loginBO: LoginBO): LoginBO {
  // 32位 小写
  loginBO.pwd = Md5.hashStr(loginBO.pwd)
  return loginBO
}

export let loginService = new LoginService()
