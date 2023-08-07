// @ts-ignore
import express from "express";
// @ts-ignore
import {engine} from "express-handlebars";
// @ts-ignore
import {router} from "./routers";
// @ts-ignore
// import {createServer} from "http";
import {createServer} from "https";
import {serverSocketService} from "./ts/socket/server";

const app = express();
const PORT = 3000;
const SOCKET_PORT = 443;
app.use(express.static('public'))
app.use(express.static('node_modules'))
// app.engine('html', engine({
//     layoutsDir: 'views',
//     defaultLayout: 'layout',
//     extname: '.html'
// }))
// app.set('view engine', 'html')
// app.use('/', router)

serverSocketService.init(SOCKET_PORT, createServer(app))
app.listen(PORT, () => {
    console.log("Express:", PORT);
});