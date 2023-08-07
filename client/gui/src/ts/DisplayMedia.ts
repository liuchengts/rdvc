// // https://webrtc.org/getting-started/turn-server?hl=zh-cn
// class Configuration implements RTCConfiguration {
//   // bundlePolicy?: RTCBundlePolicy = 'max-bundle';
//   // iceCandidatePoolSize?: 2;
//   iceTransportPolicy?: RTCIceTransportPolicy = "relay";
//   // rtcpMuxPolicy?: RTCRtcpMuxPolicy = "require";
//   iceServers?: RTCIceServer[] = [
//     {
//       urls: ['turn:localhost:3478?transport=udp'],
//       username: 'clenet',
//       credential: 'clenet123',
//       credentialType: "password"
//     },
//     {
//       urls: ['stun:localhost:3478']
//     },
//   ];
// }
//
// let pushPeerConnection: RTCPeerConnection
// let acceptPeerConnection: RTCPeerConnection
// let OFFER: RTCSessionDescriptionInit
//
// export function init() {
//   pushPeerConnection = turnServer("push")
//   acceptPeerConnection = turnServer("accept")
// }
//
// function turnServer(tag: string): RTCPeerConnection {
//   let peerConnection = new RTCPeerConnection(new Configuration());
//   connectionState(peerConnection, tag)
//   return peerConnection
// }
//
// function connectionState(peerConnection: RTCPeerConnection, tag: string) {
//   peerConnection.addEventListener('icecandidateerror', event => {
//     console.log(tag + " >>与服务器 ICE 协商错误:", event)
//   });
//   peerConnection.addEventListener('iceconnectionstatechange', event => {
//     console.log(tag + " >>服务器 ICE 连接状态发送改变:", event)
//   });
//   peerConnection.addEventListener('icegatheringstatechange', event => {
//     console.log(tag + " >>服务器 ICE 候选收集过程状态改变:", event)
//   });
//   peerConnection.addEventListener('negotiationneeded', event => {
//     console.log(tag + " >>服务器 ICE 信令通道协商:", event)
//   });
//   peerConnection.addEventListener('connectionstatechange', event => {
//     console.log(tag + " >> 新 track 添加到连接:", event)
//   });
// }
//
//
// //==============
//
// export function pushClient2(localStream: MediaStream, acceptMediaElement: HTMLMediaElement) {
//   localStream.getTracks().forEach(track => {
//     pushPeerConnection.addTrack(track, localStream);
//     console.log("推流任务 :", track)
//   });
//   pushPeerConnection.createOffer()
//     .then(offer => {
//       OFFER = offer
//       console.log("设置推送方的 setLocalDescription ", OFFER)
//       return pushPeerConnection.setLocalDescription(offer);
//     }).finally(() => {
//       acceptClient(acceptMediaElement)
//     }
//   )
// }
//
// export function pushClient(localStream: MediaStream) {
//   console.log("开始推流", pushPeerConnection)
//   localStream.getTracks().forEach(track => {
//     pushPeerConnection.addTrack(track, localStream);
//     console.log("push...", track)
//   });
//   pushPeerConnection.createOffer()
//     .then(offer => {
//       OFFER = offer
//       console.log("push OFFER:", OFFER)
//       return pushPeerConnection.setLocalDescription(offer);
//     })
// }
//
// export function acceptClient(mediaElement: HTMLMediaElement) {
//   acceptPeerConnection.addEventListener('track', event => {
//     console.log("接受流任务 :", event)
//     const [remoteStream] = event.streams;
//     mediaElement.srcObject = remoteStream;
//   });
//   acceptPeerConnection.setRemoteDescription(OFFER).then(r => {
//     console.log("设置接收方的 setRemoteDescription ", OFFER)
//   })
// }
