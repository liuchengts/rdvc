import express from 'express';

export let router = express.Router();

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
