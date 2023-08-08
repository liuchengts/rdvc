import {WebSocket} from "ws";
import * as https from "https";
import * as fs from "fs";
import path from "path";

const SOCKET_PORT = 8000;
const pathCertificati = "/root/wss"

// 创建request请求监听器
const processRequest = (req: any, res: any) => {
    res.writeHead(200);
    res.end('ok');
};

let serverHttps = https.createServer({
    key: fs.readFileSync(path.join(pathCertificati, 'privkey.key')),
    cert: fs.readFileSync(path.join(pathCertificati, 'fullchain.crt'))
}, processRequest).listen(SOCKET_PORT, () => {
    console.log('WebRTC信令中继服务器已启动，正在监听端口 ',SOCKET_PORT);
})
const wss = new WebSocket.Server({server: serverHttps});
// 保存所有连接的客户端
const clients = new Set();

// 处理连接请求
wss.on('connection', ws => {
    console.log('客户端已连接');
    // 将新连接的客户端加入到集合中
    clients.add(ws);
    // 处理消息接收
    ws.on('message', (message) => {
        console.log('接收到消息:', message);
        if (message === undefined) return
        // 解析消息
        // @ts-ignore
        const data = JSON.parse(message);
        const {type, offer, answer, candidate} = data;

        // 根据消息类型进行处理
        switch (type) {
            case 'offer':
                handleOffer(offer, ws);
                break;
            case 'answer':
                handleAnswer(answer, ws);
                break;
            case 'candidate':
                handleIceCandidate(candidate, ws);
                break;
            default:
                console.log('未知的消息类型:', type);
                break;
        }
    });

    // 处理连接关闭
    ws.on('close', () => {
        console.log('客户端已关闭连接');
        // 将关闭的客户端从集合中移除
        clients.delete(ws);
    });
});

// 处理offer消息
function handleOffer(offer: any, sender: any) {
    // 将offer转发给其他连接的客户端
    broadcastMessage(JSON.stringify({type: 'offer', offer}), sender);
}

// 处理answer消息
function handleAnswer(answer: any, sender: any) {
    // 将answer转发给其他连接的客户端
    broadcastMessage(JSON.stringify({type: 'answer', answer}), sender);
}

// 处理iceCandidate消息
function handleIceCandidate(candidate: any, sender: any) {
    // 将iceCandidate转发给其他连接的客户端
    broadcastMessage(JSON.stringify({type: 'candidate', candidate}), sender);
}

// 广播消息给所有连接的客户端，除了发送者
function broadcastMessage(message: any, sender: any) {
    clients.forEach((client) => {
        // @ts-ignore
        if (client !== sender && client.readyState === WebSocket.OPEN) {
            // @ts-ignore
            client.send(message);
        }
    });
}