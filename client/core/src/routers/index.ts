// @ts-ignore
import express from 'express';
import {desktopService, screenService} from "../desktop/screenshot";
import {clientSocketService} from "../socket/client";
import {Response} from "../../../../common/data";

export let router = express.Router();


/**
 * 启动截屏&推送任务
 */
router.get('/desktop_init', function (req, res) {
    desktopService.desktopInit()
    resJson(req)
});

/**
 * 暂停本地截屏&推送任务
 */
router.get('/desktop_suspend', function (req, res) {
    screenService.suspend()
    resJson(req)
});

/**
 * 恢复本地截屏&推送任务
 */
router.get('/desktop_continued', function (req, res) {
    screenService.continued()
    resJson(req)
});
/**
 * 申请加入房间
 */
router.get('/apply_join_room', function (req, res) {
    clientSocketService.joinRoom(req.get("roomId"))
    resJson(req)
});
/**
 * 拉取一帧桌面画面
 */
router.get('/pull_desktop', function (req, res) {
    resJson(req, clientSocketService.shiftScreenCache(<string>req.get("roomId")))
});

//GET home page.
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
    result.end(JSON.stringify(new Response(true, obj, "ok")));
}