let localStream;
let remoteStream;
let peerConnection;

const startCallButton = document.getElementById("start-call");
const endCallButton = document.getElementById("end-call");
const localVideo = document.getElementById("local-video");
const remoteVideo = document.getElementById("remote-video");

// ICE (Interactive Connectivity Establishment) servers
const iceServers = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'turn:your.turn.server', username: 'user', credential: 'password' }
    ]
};

// Video va audio olish
async function startCall() {
    try {
        // Video va audio olish
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = localStream;

        // PeerConnection yaratish
        peerConnection = new RTCPeerConnection(iceServers);

        // Local video va audio ni peer connectionga qo'shish
        localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

        // Remote video qabul qilish
        peerConnection.ontrack = event => {
            remoteStream = event.streams[0];
            remoteVideo.srcObject = remoteStream;
        };

        // Offer yuborish
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        // Bu yerda signalizatsiya serveri kerak (bu misolda signalizatsiya yo'q)
        // signalize(offer);  // signalizatsiya serveriga yuborish

    } catch (err) {
        console.error("Media olishda xato:", err);
    }
}

// Chaqiruvni to'xtatish
function endCall() {
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
        localStream.getTracks().forEach(track => track.stop());
        remoteStream.getTracks().forEach(track => track.stop());
        localVideo.srcObject = null;
        remoteVideo.srcObject = null;
    }
}

// Boshlash va to'xtatish tugmalarini sozlash
startCallButton.onclick = startCall;
endCallButton.onclick = endCall;
const socket = io.connect('http://localhost:3000');

// Chaqiruv boshlash
async function startCall() {
    // Media olish
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.srcObject = stream;

    // PeerConnection yaratish
    const peerConnection = new RTCPeerConnection(iceServers);
    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

    peerConnection.ontrack = event => {
        remoteVideo.srcObject = event.streams[0];
    };

    // Offer yaratish va serverga yuborish
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit('offer', offer);

    socket.on('answer', answer => {
        peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    });
}

// End Call
function endCall() {
    // Qo'ng'iroqni to'xtatish va video streamni to'xtatish
    peerConnection.close();
    localStream.getTracks().forEach(track => track.stop());
    remoteStream.getTracks().forEach(track => track.stop());
    localVideo.srcObject = null;
    remoteVideo.srcObject = null;
}

// Signalizatsiya serveridan taklif (offer) olish
socket.on('offer', async offer => {
    const peerConnection = new RTCPeerConnection(iceServers);
    peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit('answer', answer);

    peerConnection.ontrack = event => {
        remoteVideo.srcObject = event.streams[0];
    };
});

// Tugmalarni sozlash
startCallButton.onclick = startCall;
endCallButton.onclick = endCall;
