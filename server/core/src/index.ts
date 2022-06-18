// @ts-ignore
import express from "express";
import {engine} from "express-handlebars";
import {router} from "./routers";
import {createServer} from "http";
import {serverSocketService} from "./ts/socket/server";

const app = express();
const PORT = 3000;
const SOCKET_PORT = 8000;
app.use(express.static('public'))
app.use(express.static('node_modules'))
app.engine('html', engine({
    layoutsDir: 'views',
    defaultLayout: 'layout',
    extname: '.html'
}))
app.set('view engine', 'html')
app.use('/', router)

serverSocketService.init(SOCKET_PORT, createServer(app))
app.listen(PORT, () => {
    console.log("Express:", PORT);
});


