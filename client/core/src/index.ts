// @ts-ignore
import express from "express";
import {engine} from "express-handlebars";
import {clientSocketService} from "./socket/client";
import {router} from "./routers";

const app = express();
const port = 3000;
app.use(express.static('node_modules'))
app.use(express.static('public'))
app.engine('html', engine({
    layoutsDir: 'views',
    defaultLayout: 'layout',
    extname: '.html'
}))
app.set('view engine', 'html')
app.use('/', router)

const client_socket_prot = 8000
const connection = "http://192.168.50.71:" + client_socket_prot
clientSocketService.init(connection)
app.listen(port, () => {
    console.log("client core express:", port);
});


