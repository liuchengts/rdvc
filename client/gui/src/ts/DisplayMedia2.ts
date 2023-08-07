// @ts-ignore
import {clientSocketService} from "./socket/client"

// https://webrtc.org/getting-started/turn-server?hl=zh-cn
class Configuration implements RTCConfiguration {
  // bundlePolicy?: RTCBundlePolicy = 'max-bundle';
  // iceCandidatePoolSize?: 2;
  iceTransportPolicy?: RTCIceTransportPolicy = "relay";
  // rtcpMuxPolicy?: RTCRtcpMuxPolicy = "require";
  iceServers?: RTCIceServer[] = [
    {
      urls: ['turn:localhost:3478?transport=udp'],
      username: 'clenet',
      credential: 'clenet123',
      credentialType: "password"
    },
    {
      urls: ['stun:localhost:3478']
    },
  ];
}

let peerConnection: RTCPeerConnection
const TOPIC = "offer"

export function init() {
  peerConnection = turnServer()
  webSocket()
}

function webSocket() {
  clientSocketService.subscribe(TOPIC, (data: any) => {
    peerConnection.setRemoteDescription(data).then(r => {
      console.log("设置接收时的 setRemoteDescription ", data)
    })
  })
}

function turnServer(): RTCPeerConnection {
  let peerConnection = new RTCPeerConnection(new Configuration());
  connectionState(peerConnection)
  return peerConnection
}

function connectionState(peerConnection: RTCPeerConnection) {
  peerConnection.addEventListener('icecandidateerror', (event: Event) => {
    console.log("与服务器 ICE 协商错误:", event)
  });
  peerConnection.addEventListener('iceconnectionstatechange', (event: Event) => {
    console.log("服务器 ICE 连接状态发送改变:", event)
  });
  peerConnection.addEventListener('icegatheringstatechange', (event: Event) => {
    console.log("服务器 ICE 候选收集过程状态改变:", event)
  });
  peerConnection.addEventListener('negotiationneeded', (event: Event) => {
    console.log("服务器 ICE 信令通道协商:", event)
  });
  peerConnection.addEventListener('connectionstatechange', (event: Event) => {
    console.log("新 track 添加到连接:", event)
  });

}

export function pushClient(localStream: MediaStream) {
  // 本地显示
  let localVideo = document.querySelector("#localVideo") as HTMLMediaElement;
  localVideo!!.srcObject = localStream;
  // 开始推送
  localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, localStream);
    console.log("推流任务 :", track)
  });
  // 多媒体协商
  peerConnection.createOffer()
    .then(offer => {
      console.log("设置推送时的 setLocalDescription ", offer)
      clientSocketService.send(TOPIC, offer)
      return peerConnection.setLocalDescription(offer);
    })
  acceptClient()
}

export function acceptClient() {
  peerConnection.addEventListener('track', (event: RTCTrackEvent) => {
    console.log("接受流任务 :", event)
    let acceptVideoMediaElement = document.querySelector("#acceptVideo") as HTMLMediaElement
    const [remoteStream] = event.streams;
    acceptVideoMediaElement.srcObject = remoteStream;
  });
}
