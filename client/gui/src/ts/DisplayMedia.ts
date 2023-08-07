// https://webrtc.org/getting-started/turn-server?hl=zh-cn
class Configuration implements RTCConfiguration {
  bundlePolicy?: RTCBundlePolicy = 'max-bundle';
  iceCandidatePoolSize?: 2;
  iceTransportPolicy?: RTCIceTransportPolicy = "relay";
  rtcpMuxPolicy?: RTCRtcpMuxPolicy = "require";
  iceServers?: RTCIceServer[] = [
    {
      urls: ['turn:localhost:3478?transport=udp'],
      username: 'clenet',
      credential: 'clenet123',
      credentialType: "password"
    },{
      urls: ['stun:localhost:3478']
    },
  ];
}

let pushPeerConnection: RTCPeerConnection
let acceptPeerConnection: RTCPeerConnection
let OFFER: RTCSessionDescriptionInit

export function init() {
  pushPeerConnection = turnServer()
  acceptPeerConnection = turnServer()
}

function turnServer(): RTCPeerConnection {
  let peerConnection = new RTCPeerConnection(new Configuration());
  connectionState(peerConnection)
  return peerConnection
}

function connectionState(peerConnection: RTCPeerConnection) {
  console.log("peerConnection", peerConnection)
  peerConnection.addEventListener('connectionstatechange', event => {
    console.log("RTCPeerConnection 连接状态发生改变:", event)
  });
  peerConnection.addEventListener('icecandidateerror', event => {
    console.log("RTCPeerConnection  ICE 协商错误:", event)
  });

}

export function pushClient(localStream: MediaStream) {
  console.log("开始推流", pushPeerConnection)
  localStream.getTracks().forEach(track => {
    pushPeerConnection.addTrack(track, localStream);
    console.log("push...", track)
  });
  pushPeerConnection.createOffer()
    .then(offer => {
      OFFER = offer
      console.log("push OFFER:", OFFER)
      return pushPeerConnection.setLocalDescription(offer);
    })
}

export function pushClient2(localStream: MediaStream, acceptMediaElement: HTMLMediaElement) {
  console.log("开始推流", pushPeerConnection)
  localStream.getTracks().forEach(track => {
    pushPeerConnection.addTrack(track, localStream);
    console.log("push...", track)
  });
  pushPeerConnection.createOffer()
    .then(offer => {
      OFFER = offer
      return pushPeerConnection.setLocalDescription(offer);
    }).finally(() => {
      console.log("push OFFER:", OFFER)
      acceptClient(acceptMediaElement)
    }
  )
}

export function acceptClient(mediaElement: HTMLMediaElement) {
  console.log("开始接受", acceptPeerConnection)
  acceptPeerConnection.addEventListener('track', event => {
    console.log("accept...", event)
    // mediaElement.srcObject = event.streams[1];
    const [remoteStream] = event.streams;
    mediaElement.srcObject = remoteStream;
  });
  console.log("accept OFFER:", OFFER)
  acceptPeerConnection.setRemoteDescription(OFFER).then(r => {
    console.log("accept RemoteDescription")
  })
}
