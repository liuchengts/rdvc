import {Events} from "../common/events";
import {serverSocketService} from "../socket/server";
import {compressionService} from "../common/images";
// @ts-ignore
import screenshotDesktop from "screenshot-desktop";
import {Response, Status} from "../common/data";

export class DesktopScreen {
    constructor(public rooms: string[],
                public events: Events,
                public screen: Screen,
                public time: Date) {
    }
}

export class Screen {
    constructor(
        public imgBuffer: Buffer,
        public quality: number,
        public extension: string,
        public width?: number,
        public height?: number) {
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
    createScreenshot = (): Promise<Buffer> => {
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
    startScreenshotTimer = (callback: Function): {} => {
        return setInterval((): void => {
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
        }, SCREENSHOT_INTERVAL)
    }

    /**
     * 暂停截取
     */
    suspend() {
        this.isSuspend = true;
        console.log("截屏任务暂停")
    }

    /**
     * 恢复截取
     */
    continued() {
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

    /**
     * 存储需要推的桌面图像（在这里进行图像压缩转码）
     * @param events 事件
     * @param imgBuffer 原始图像buffer
     */
    storage(events: Events, imgBuffer: Buffer): void

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
     */
    desktopInit(): void
}

class DesktopServiceImpl implements DesktopService {
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

    async storage(events: Events, imgBuffer: Buffer, quality?: number, width?: number, height?: number) {
        if (this.desktops.length >= this.desktopsMax) {
            console.warn("desktops超过上限,放弃本次增加:", new Date())
            screenService.suspend()
            return
        }
        if (quality == null) quality = this.quality
        //将图片编码压缩 imgStr
        let promise = await compressionService.compImg(imgBuffer, quality, width, height)
        let buffer = Buffer.from(promise.binary.buffer)
        let extension = promise.extension
        let screen = new Screen(buffer, quality, extension, width, height)
        this.desktops.push(new DesktopScreen(this.rooms, events, screen, new Date()))
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

        serverSocketService.pushToClients(desktopScreen.rooms, desktopScreen.events,
            new Response(Status.OK, desktopScreen.screen))
        if (this.desktops.length < this.desktopsMax) {
            screenService.continued()
        }
    }

    desktopInit() {
        screenService.startScreenshotTimer(((imgBuffer: Buffer): void => {
            this.storage(Events.SCREEN, imgBuffer).then(() => {
                console.log("压缩存储成功")
                this.push()
            })
        }))
    }

}

const screenService = new ScreenService()
export const desktopService = new DesktopServiceImpl()



