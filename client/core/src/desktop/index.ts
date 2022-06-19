import {clientSocketService} from "../socket/client";
import {compressionService} from "../common/images";
// @ts-ignore
import screenshotDesktop from "screenshot-desktop";
import {Response, Screen} from "../../../../common/data";

export class DesktopScreen {
    constructor(public rooms: string[],
                public screen: Screen,
                public time: Date) {
    }
}


/**
 * 截取屏幕的定时，单位ms
 */
const SCREENSHOT_INTERVAL = 1000;

class ScreenService {
    /**
     * 截屏事件开关
     */
    private isSuspend: boolean = false;
    private indexSuspend: number = 0;

    /**
     * 截取屏幕
     */
    createScreenshot(): Promise<Buffer> {
        return screenshotDesktop({format: "png"})
            .then(img => {
                return img;
            }).catch(err => {
                console.log('截屏失败', err);
                return err;
            })
    }

    /**
     * 定时器触发截取屏幕
     * @param callback 回调函数处理截取的图片buffer
     */
    startScreenshotTimer(callback: Function) {
        let time = new Date();
        if (this.isSuspend) {
            if (this.indexSuspend > 0) return
            console.log("截屏暂停[", this.indexSuspend, "]", time)
            this.indexSuspend++
        } else {
            console.log("我开始截屏了", time)
            this.createScreenshot().then((img): void => {
                callback(img);
            })
        }
    }

    /**
     * 暂停截取
     */
    suspend() {
        if (this.isSuspend) return
        this.isSuspend = true;
        console.log("截屏任务暂停")
    }

    /**
     * 恢复截取
     */
    continued() {
        if (!this.isSuspend) return
        this.isSuspend = false;
        console.log("截屏任务继续开始")
    }

}

interface DesktopService {
    /***
     * 增加桌面图像要推到的房间号
     * @param roomId
     */
    addRooms(roomId: string): void

    /***
     * 删除桌面图像要推到的房间号
     * @param roomId
     */
    delRooms(roomId: string): void

    /**
     * 存储需要推的桌面图像（在这里进行图像压缩转码）
     * @param imgBuffer 原始图像buffer
     */
    storage(imgBuffer: Buffer): void

    /**
     * 获得一个即将要推送的对象
     */
    getNextDesktopScreen(): DesktopScreen | undefined

    /**
     * 开始推送到socket
     */
    push(): void

    /**
     * 模块功能初始化
     * 在这里会触发截屏定时器
     * 由截屏定时器推动本模块所有后续业务
     * @param socketId 服务器分配的 socketId
     */
    desktopInit(socketId: string): void

    setSocketId(socketId?: string): void
}

class DesktopServiceImpl implements DesktopService {
    private isTask = false
    private socketId?: string
    /**
     * 存储的待推送桌面图像
     */
    private desktops = new Array<DesktopScreen>();
    /**
     * 存储的需要接收图像的room
     */
    private rooms = new Array<string>();
    /**
     * 设置允许的最大的房间数量
     */
    private roomsMax = 100;
    /**
     * 设置允许的最大的桌面图片存储数量
     */
    private desktopsMax = 10;
    /**
     * 设置默认的压缩比
     */
    private quality = 75;

    addRooms(roomId: string) {
        if (this.rooms.length >= this.roomsMax) {
            console.warn("rooms超过上限,放弃本次增加 roomId:", roomId)
            return
        }
        this.rooms.push(roomId)
    }

    delRooms(roomId: string) {
        let index = this.rooms.indexOf(roomId)
        if (index == -1) return
        this.rooms = this.rooms.slice(index, 1)
    }

    async storage(imgBuffer: Buffer, quality?: number, width?: number, height?: number) {
        if (quality == null) quality = this.quality
        console.log("压缩前的图片大小:", imgBuffer.length / 1024, "kb")
        //将图片编码压缩 imgStr
        let promise = await compressionService.compImg(imgBuffer, quality, width, height)
        let buffer = Buffer.from(promise.binary.buffer)
        console.log("压缩后的图片大小:", buffer.length / 1024, "kb")
        let extension = promise.extension
        let screen = new Screen(this.socketId!, buffer, quality, extension, width, height)
        this.desktops.push(new DesktopScreen(this.rooms, screen, new Date()))
        this.desktops.forEach(d => {
            console.log("desktops中的元素：", d.time)
        })
    }

    getNextDesktopScreen(): DesktopScreen | undefined {
        return this.desktops.pop()
    }

    push() {
        let desktopScreen = this.getNextDesktopScreen()
        if (desktopScreen == undefined) {
            console.warn("没有要推送的数据")
            return
        }
        if (desktopScreen.rooms.length <= 0) {
            console.warn("没有要接收的rooms")
            return
        }

        clientSocketService.pushToRoom(desktopScreen.rooms,
            new Response(true, desktopScreen.screen))
        if (this.desktops.length < this.desktopsMax) {
            screenService.continued()
        }
    }

    setSocketId(socketId?: string) {
        if (socketId == null) {
            console.error("没有 socketId 不启动 desktop ")
            return
        }
        this.socketId = socketId
    }

    desktopInit() {
        if (this.isTask) {
            console.error("desktop 任务已启动")
            return
        }
        this.isTask = true
        setInterval((): void => {
            if (this.socketId == undefined) {
                console.warn("没有 socketId")
                screenService.suspend()
                return
            }
            if (this.rooms.length <= 0) {
                console.warn("没有要接收的rooms")
                screenService.suspend()
                return
            }
            if (this.desktops.length >= this.desktopsMax) {
                console.warn("desktops超过上限,放弃本次增加:", new Date())
                screenService.suspend()
                return
            }
            screenService.startScreenshotTimer(((imgBuffer: Buffer): void => {
                this.storage(imgBuffer).then(() => {
                    console.log("压缩存储成功")
                    this.push()
                })
            }))
        }, SCREENSHOT_INTERVAL)

    }

}

export const screenService = new ScreenService()
export const desktopService = new DesktopServiceImpl()


