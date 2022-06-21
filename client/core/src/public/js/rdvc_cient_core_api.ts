const baseUrl = "http://192.168.50.71:3001/"

/**
 * 启动截屏&推送任务
 */
export function desktopInit() {
    let url = baseUrl + "desktop_init"

}

/**
 * 暂停本地截屏&推送任务
 */
export function desktopSuspend() {
    let url = baseUrl + "desktop_suspend"
}

/**
 * 恢复本地截屏&推送任务
 */
export function desktopContinued() {
    let url = baseUrl + "desktop_continued"
}

/**
 * 申请加入房间
 */
export function applyJoinRoom(roomId: string) {
    let url = baseUrl + "apply_join_room?roomId=" + roomId
}
