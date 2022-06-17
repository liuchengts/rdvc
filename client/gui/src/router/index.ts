import {createRouter, createWebHashHistory} from 'vue-router'
import {escrowRouter, routes, routesDefender} from "@/ts/common/routeSupport";

/**
 * 创建一个路由
 */
const router = createRouter({
  history: createWebHashHistory(),
  routes
})
/**
 * 应用路由守卫
 */
router.beforeEach(routesDefender)
/**
 * 托管路由
 */
escrowRouter(router)

export default router
