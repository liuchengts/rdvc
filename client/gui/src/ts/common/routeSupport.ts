import {AUTH} from "@/ts/common/auth";
import LoginView from '../../views/LoginView.vue'
import {clearPending} from "@/ts/common/http"
import {VIEWS} from "@/ts/common/views";
import {
  NavigationGuardNext,
  RouteLocationNormalized, Router,
  RouteRecordRaw
} from "vue-router";


/**
 * 定义一个作用域局部的 map ，承载所有的路由配置
 */
const globalRouteRaw: Map<VIEWS, RouteRecordRaw> = initGlobalRouteRaw()

/***
 * 在这里定义全局的路由配置
 */
function initGlobalRouteRaw() {
  const routeRawMap: Map<VIEWS, RouteRecordRaw> = new Map()
  /**
   * 路由页面：路由配置
   */
  routeRawMap.set(VIEWS.LoginView, {
    path: "/",
    name: 'login',
    component: LoginView,
    meta: {
      title: "登录页",
      requireAuth: false // 标识该路由是否需要登录
    }
  })
  return routeRawMap
}

/**
 * 在跳转路由之前，先清除所有的请求
 * @param next 下一个路由
 */
function clearNext(next: NavigationGuardNext) {
  clearPending()
  next()
}

/**
 * 公布一个只读的map公布所有的路由配置
 */
export const readonlyRoutesMap: ReadonlyMap<VIEWS, RouteRecordRaw> = globalRouteRaw
/**
 * 公布一个只读的数组包含所有的路由配置
 */
export const routes: Array<RouteRecordRaw> = Array.from(readonlyRoutesMap.values())

/**
 * 强制根据 VIEW 获取一个 RouteRecordRaw 配置
 * 即使这个页面可能没有在 readonlyRoutesMap 中
 * @param view view
 */
export function getRouteRecordRaw(view: VIEWS): RouteRecordRaw {
  return readonlyRoutesMap.get(view)!!
}

/**
 * 公布路由卫士
 */
export const routesDefender = (to: RouteLocationNormalized,
                               from: RouteLocationNormalized,
                               next: NavigationGuardNext) => {
  /**
   * 未登录则跳转到登录页
   * 未登录跳转到登录页,也可以通过axios的响应拦截器去实现,但是会先在当前页面渲染一下,再跳转到登录页,会有个闪动的现象
   * 这里通过路由守卫的方式,不会在当前页闪现一下,但是需要在每个路由组件添加一个是否需要登录的标识位,如本项目中的requireAuth字段
   */
  if (to.matched.some((auth) => auth.meta.requireAuth)) {
    if (AUTH.isXtoken()) {
      clearNext(next);
    } else {
      console.log("未登录")
      next({
        // 从只读的 map 中取出对应的路由
        path: getRouteRecordRaw(VIEWS.LoginView).path
      });
    }
  } else {
    clearNext(next);
  }
}
/**
 * 声明的全局路由
 */
let router: Router

/**
 * 托管全局路由，不允许更改
 * @param r 全局路由
 */
export function escrowRouter(r: Router) {
  // 不允许修改
  if (router != null) return
  router = r
}

/**
 * 获取路由对象
 */
export function getRouter() {
  return router
}

/**
 * 跳转到指定的路由
 * @param view 枚举定义的页面
 * @param failedCallback 跳转失败的处理函数，可以为空
 */
export function to(view: VIEWS, failedCallback?: Function) {
  getRouter()
    .push({
      name: getRouteRecordRaw(view).name
    }).catch(err => {
    if (failedCallback != null) failedCallback(err)
  })
}
