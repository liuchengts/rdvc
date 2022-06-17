// @ts-ignore
import express from "express";
import {createServer} from "http";
// import {serverSocketService} from "./ts/socket/server";
import {clientSocketService} from "./ts/socket/client";

const app = express();
const port = 3000;
const server_socket_port = 8001;
app.use(express.static('node_modules'))
const client_socket_prot = 8000
const connection = "http://localhost:" + client_socket_prot
clientSocketService.init(connection)
// serverSocketService.init(server_socket_port, createServer(app))
// app.listen(port, () => {
//     console.log("client core express:", port);
// });


