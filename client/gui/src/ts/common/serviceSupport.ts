import {ElMessage} from "element-plus";
import {to} from "@/ts/common/routeSupport";
import {VIEWS} from "@/ts/common/views";

/**
 * 定义一个公共业务接口
 */
export interface BaseServiceInterface {
  /**
   * 设置即将执行的渲染回调
   * @param successCallback 成功回调
   * @param failedCallback 失败回调
   */
  nextCallback(successCallback?: Function, failedCallback?: Function): void;

  /**
   * promise 处理
   * 当 nativeCallback 不为 null 时具有最高优先级
   * @param promise 基于http请求的promise对象
   * @param nativeCallback 用promise原本的方式回调处理
   */
  promiseHandle(promise: Promise<any>, nativeCallback?: Function): void;

  /**
   * 跳转到指定页面
   * @param view 要跳转的页面
   * @param failedCallback 跳转失败的处理函数
   */
  to(view: VIEWS, failedCallback?: Function): void;
}

/**
 * 默认实现公共业务接口
 */
export class BaseService implements BaseServiceInterface {

  constructor(
    public successCallback?: Function,
    public failedCallback?: Function
  ) {
  }

  /**
   * 将回调函数设置值
   * @param successCallback 成功回调
   * @param failedCallback 失败回调
   */
  nextCallback(successCallback?: Function, failedCallback?: Function) {
    this.successCallback = successCallback
    this.failedCallback = failedCallback
  }

  /**
   * promise 默认处理
   * 当 nativeCallback 不为 null 时覆盖 promiseHandle 默认处理，直接执行 nativeCallback
   * @param promise 基于 http 请求的 promise 对象
   * @param nativeCallback 用 promise 原本的方式回调处理
   */
  promiseHandle(promise: Promise<any>, nativeCallback?: Function) {
    if (nativeCallback != null) {
      nativeCallback(promise)
    } else {
      promise.then(res => {
        //成功回调
        if (this.successCallback != null) {
          this.successCallback(res)
          this.successCallback = () => {
          }
        }
      }).catch(err => {
        //失败回调
        if (this.failedCallback != null) {
          this.failedCallback(err)
          this.failedCallback = () => {
          }
        }
        ElMessage.error(err.message)
      })
    }
  }

  /**
   * 页面跳转 由 routeSupport.ts 实现
   * @param view 要跳转的页面
   * @param failedCallback 跳转失败的处理函数
   */
  to(view: VIEWS, failedCallback?: Function) {
    to(view, failedCallback)
  }
}
