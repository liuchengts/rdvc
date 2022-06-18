import {desktopService, screenService} from "../desktop";

/**
 * 启动截屏&推送任务
 */

export function desktopInit() {
    desktopService.desktopInit()
}
export function suspend() {
    screenService.suspend()
}
export function continued() {
    screenService.continued()
}
export function joinRoom(){

}