import service from "@/ts/common/http"
import {BaseService} from "@/ts/common/serviceSupport";

interface DesktopInterface {
  /**
   * 启动截屏&推送任务
   */
  desktopInit(nativeCallback?: Function): void;

  /**
   * 暂停本地截屏&推送任务
   */
  desktopSuspend(nativeCallback?: Function): void;

  /**
   * 恢复本地截屏&推送任务
   */
  desktopContinued(nativeCallback?: Function): void;

  /**
   * 申请加入房间
   */
  applyJoinRoom(roomId: string, nativeCallback?: Function): void;

  /**
   * 根据房间id拉取一帧桌面画面
   */
  pullDesktop(roomId: string, nativeCallback?: Function): void;
}

/**
 * 实现 DesktopInterface
 * 继承 BaseService 获得基础实现
 */
class DesktopService extends BaseService implements DesktopInterface {
  desktopInit(nativeCallback?: Function): void {
    this.promiseHandle(service.get("/desktop_init"), nativeCallback)
  }

  desktopSuspend(nativeCallback?: Function): void {
    this.promiseHandle(service.get("/desktop_suspend"), nativeCallback)
  }

  desktopContinued(nativeCallback?: Function): void {
    this.promiseHandle(service.get("/desktop_continued"), nativeCallback)
  }

  applyJoinRoom(roomId: string, nativeCallback?: Function): void {
    this.promiseHandle(service.get("/apply_join_room?roomId=" + roomId), nativeCallback)
  }

  pullDesktop(roomId: string, nativeCallback?: Function): void {
    this.promiseHandle(service.get("/pull_desktop?roomId=" + roomId), nativeCallback)
  }
}

export const desktopService = new DesktopService()
