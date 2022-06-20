import {desktopService, screenService} from "../desktop/screenshot";
import {clientSocketService} from "../socket/client";

/**
 * 启动截屏&推送任务
 */
export function desktopInit() {
    desktopService.desktopInit()
}

/**
 * 暂停本地截屏&推送任务
 */
export function desktopSuspend() {
    screenService.suspend()
}

/**
 * 恢复本地截屏&推送任务
 */
export function desktopContinued() {
    screenService.continued()
}

/**
 * 申请加入房间
 */
export function applyJoinRoom(roomId: string) {
    clientSocketService.joinRoom(roomId)
}
