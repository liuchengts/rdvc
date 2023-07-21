let peerConnection: RTCPeerConnection
// https://webrtc.org/getting-started/turn-server?hl=zh-cn
export function turnServer() {
  const iceConfiguration = {
    iceServers: [
      {
        urls: 'turn:localhost:3478',
        username: 'a',
        credential: 'b'
      }
    ]
  }
  peerConnection = new RTCPeerConnection(iceConfiguration);
  connectionState(peerConnection)
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
  console.log("开始推流", peerConnection)
  localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, localStream);
    console.log("push...", track)
  });
}

export function acceptClient(mediaElement: HTMLMediaElement) {
  const iceConfiguration = {
    iceServers: [
      {
        urls: 'turn:localhost:3478',
        username: 'a',
        credential: 'b'
      }
    ]
  }
  const acceptPeerConnection = new RTCPeerConnection(iceConfiguration);
  console.log("开始接受", acceptPeerConnection)
  acceptPeerConnection.addEventListener('track', event => {
    console.log("accept...", event)
    const [remoteStream] = event.streams;
    mediaElement.srcObject = remoteStream;
  });
}
