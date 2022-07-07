// @ts-ignore
import express from 'express';
import {desktopService, screenService} from "../desktop/screenshot";
import {clientSocketService} from "../socket/client";
import {Response, Screen, ScreenBase64} from "../../../../common/data";
import fs from "fs";

export let router = express.Router();


/**
 * 启动截屏&推送任务
 */
router.get('/desktop_init', function (req, res) {
    desktopService.desktopInit()
    resJson(res)
});

/**
 * 暂停本地截屏&推送任务
 */
router.get('/desktop_suspend', function (req, res) {
    screenService.suspend()
    resJson(res)
});

/**
 * 恢复本地截屏&推送任务
 */
router.get('/desktop_continued', function (req, res) {
    screenService.continued()
    resJson(res)
});
/**
 * 申请加入房间
 */
router.get('/apply_join_room/:roomId', function (req, res) {
    clientSocketService.joinRoom(req.params.roomId)
    resJson(res)
});
/**
 * 拉取一帧桌面画面
 */
router.get('/pull_desktop/:roomId', function (req, res) {
    const screen = clientSocketService.shiftScreenCache(req.params.roomId)
    let data: any
    if (screen != null) {
        data = new ScreenBase64(screen.socketId, Buffer.from(screen.imgBuffer).toString('base64'),
            screen.quality, screen.extension, screen.width, screen.height)
    }
    console.log("pull_desktop=>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>roomId:", req.params.roomId)
    resJson(res, data)
});

//GET home page.s
router.get('/', function (req, res) {
    // res.header("Access-Control-Allow-Headers", "content-type");
    res.render('index', {
        layout: false,
        title: "登录页",
        indexInfo: "index paper"
    });
    // let sql = 'select * from user';
    // connection.query(sql, function(err, result) {
    //     if (err) {
    //         console.log('[SELECT ERROR] - ', err.message);
    //         return;
    //     }
    //     res.render('index', {
    //         layout: false,
    //         title: "登录页",
    //         indexInfo: "index paper"
    //     });
    // });
});

//get main paper
router.get('/main', function (req, res) {
    res.render('main', {
        layout: false,
        title: "主页",
        mainInfo: 'main paper'
    });
});

function resJson(result: any, obj?: any) {
    result.setHeader('Content-Type', 'application/json');
    result.json(new Response(true, obj, "ok"))
    // result.end(JSON.stringify(new Response(true, obj, "ok")));
}