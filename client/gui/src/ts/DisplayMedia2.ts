// @ts-ignore
import {clientSocketService} from "./socket/client"

// https://webrtc.org/getting-started/turn-server?hl=zh-cn
class Configuration implements RTCConfiguration {
  // bundlePolicy?: RTCBundlePolicy = 'max-bundle';
  // iceCandidatePoolSize?: 0;
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
let ANSWER: any
let OFFER: any

export function init() {
  peerConnection = turnServer()
  webSocket()
}

function webSocket() {
  clientSocketService.subscribe(TOPIC, (description: Description) => {
    if (description.type == "offer") {
      OFFER = description.data
      peerConnection.setRemoteDescription(OFFER).then(() => {
        console.log("设置 offer ", OFFER)
        peerConnection.createAnswer()
          .then(answer => {
            ANSWER = answer
            peerConnection.setLocalDescription(ANSWER).then(r => {
              console.log("设置 answer ", ANSWER)
              clientSocketService.send(TOPIC, new Description("answer", ANSWER))
            })
          })
      })
    } else if (description.type == "answer") {
      ANSWER = description.data
      peerConnection.setRemoteDescription(description.data).then(() => {
        console.log("设置 answer ", ANSWER)
      })
    }
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
  peerConnection.addEventListener('icecandidate', (event: any) => {
    console.log("ICE 收集均已完成:", event)
    let tmpPeerConnection = event.target;
    let iceCandidate = event.candidate
    if (iceCandidate) {
      let newIceCandidate = new RTCIceCandidate(iceCandidate);
      let otherPeer = (tmpPeerConnection == peerConnection) ? tmpPeerConnection : peerConnection
      otherPeer.addIceCandidate(newIceCandidate)
        .then(() => {
          console.log("添加 iceCandidate 完成")
        })
    }
  });
  peerConnection.addEventListener('track', (event: RTCTrackEvent) => {
    console.log("接受流任务 :", event)
    acceptClient(event.streams)
  });
}

function acceptClient(streams: ReadonlyArray<MediaStream>) {
  let acceptVideoMediaElement = document.querySelector("#acceptVideo") as HTMLMediaElement
  const [remoteStream] = streams;
  acceptVideoMediaElement.srcObject = remoteStream;
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
  if (OFFER != undefined) {
    console.warn("已经存在 offer，跳过协商")
    return
  }
  // 多媒体协商
  peerConnection.createOffer()
    .then(offer => {
      OFFER = offer
      return peerConnection.setLocalDescription(offer);
    }).then(() => {
    console.log("设置推送时的 setLocalDescription ", OFFER)
    clientSocketService.send(TOPIC, new Description("offer", OFFER))
  })
}

export class Description {
  constructor(public type: string, // offer answer
              public data: any,
  ) {
  }
}
