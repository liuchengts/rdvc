// https://webrtc.org/getting-started/turn-server?hl=zh-cn

let pushPeerConnection: RTCPeerConnection
let acceptPeerConnection: RTCPeerConnection
let OFFER: RTCSessionDescriptionInit

export function init() {
  pushPeerConnection = turnServer()
  acceptPeerConnection = turnServer()
}

function turnServer(): RTCPeerConnection {
  let peerConnection = new RTCPeerConnection(iceConfiguration);
  connectionState(peerConnection)
  return peerConnection
}

function connectionState(peerConnection: RTCPeerConnection) {
  console.log("peerConnection", peerConnection)
  peerConnection.addEventListener('connectionstatechange', event => {
    if (peerConnection.connectionState === 'connected') {
      console.log("RTCPeerConnection 连接成功")
    }
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
    mediaElement.srcObject = event.streams[0];
    // const [remoteStream] = event.streams;
    // mediaElement.srcObject = remoteStream;
  });
  console.log("accept OFFER:", OFFER)
  acceptPeerConnection.setRemoteDescription(OFFER).then(r => {
    console.log("accept RemoteDescription")
  })
}
