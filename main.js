let localStream;
let localDisplayStream;
let remoteStream;
let peerConnection;
const APP_ID = "59402908069946a59af975578a750580";
const token = null;
let client;
let channel;
const uid = String(Math.floor(Math.random() * 10000));
const servers = {
    iceServers: [
        {
            urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
        }
    ]
};

const socket = new WebSocket('wss://192.168.0.77:8080');

let audio_check = true;
let video_check = true;
let pswrd = `!<3wumPus`

const init = async () => {
    client = await AgoraRTM.createInstance(APP_ID);
    await client.login({ uid, token });

    channel = client.createChannel('main');
    await channel.join();

    channel.on('MemberJoined', handleUserJoined);

    client.on('MessageFromPeer', handleMessageFromPeer);

    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localDisplayStream = new MediaStream();
    localStream.getVideoTracks().forEach(track => {
        localDisplayStream.addTrack(track);
    });

    document.getElementById('user-1').srcObject = localDisplayStream;
};

const handleMessageFromPeer = async (message, MemberId) => {
    message = JSON.parse(message.text);
    if (message.type === 'offer') {
        createAnswer(MemberId, message.offer);
    }

    if (message.type === 'answer') {
        addAnswer(message.answer);
    }

    if (message.type === 'candidate') {
        if (peerConnection) {
            peerConnection.addIceCandidate(message.candidate);
        }
    }
};

const handleUserJoined = async (MemberId) => {
    console.log('A new user joined the room', MemberId);
    createOffer(MemberId);
};

const createPeerConnection = async (MemberId) => {
    peerConnection = new RTCPeerConnection(servers);
    remoteStream = new MediaStream();
    document.getElementById('user-2').srcObject = remoteStream;

    if (!localStream) {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localDisplayStream = new MediaStream();
        localStream.getVideoTracks().forEach(track => {
            localDisplayStream.addTrack(track);
        });
        document.getElementById('user-1').srcObject = localDisplayStream;
    }

    localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
    });

    peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
            remoteStream.addTrack(track);
        });
    };

    peerConnection.onicecandidate = async (event) => {
        if (event.candidate) {
            client.sendMessageToPeer({ text: JSON.stringify({ 'type': 'candidate', 'candidate': event.candidate }) }, MemberId);
        }
    };
};

const createOffer = async (MemberId) => {
    await createPeerConnection(MemberId);

    let offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    client.sendMessageToPeer({ text: JSON.stringify({ 'type': 'offer', 'offer': offer }) }, MemberId);
    console.log('Offer: ', offer);
};

const createAnswer = async (MemberId, offer) => {
    await createPeerConnection(MemberId);
    await peerConnection.setRemoteDescription(offer);

    let answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    client.sendMessageToPeer({ text: JSON.stringify({ 'type': 'answer', 'answer': answer }) }, MemberId);
};

const addAnswer = async (answer) => {
    if (!peerConnection.currentRemoteDescription) {
        peerConnection.setRemoteDescription(answer);
    }
};

init();

const display = document.getElementById('keypress-display');
const dialogues = document.getElementById('talkers');
const inputField = document.getElementById('Dialogue');
const submitButton = document.getElementById('submitButton');
const audioButton = document.getElementById('audioButton');
const videoButton = document.getElementById('videoButton');
const did = document.getElementById('DID');

document.addEventListener('keydown', (event) => {
    if (inputField != document.activeElement) {
        const keyName = event.key;
        const message = `keypress: ${keyName}`;
        display.textContent = message;
        socket.send(message);
    }
});

submitButton.addEventListener('click', () => {
    let message = `message: ${inputField.value}`;
    dialogues.textContent = `Sent '${inputField.value}' to other client`;
    socket.send(message);
    const ID = String(Math.floor(Math.random() * 10000));
    did.textContent = `msgID: ${ID}`;
    socket.send(did.textContent);
});

audioButton.addEventListener('click', () => {
    audio_check = !audio_check;
    if (!audio_check) {
        audioButton.textContent = `enable audio`;
    } else {
        audioButton.textContent = `disable audio`;
    }
    localStream.getAudioTracks().forEach(track => track.enabled = audio_check);
});

videoButton.addEventListener('click', () => {
    video_check = !video_check;
    if (!video_check) {
        videoButton.textContent = `enable video`;
    } else {
        videoButton.textContent = `disable video`;
    }
    localStream.getVideoTracks().forEach(track => track.enabled = video_check);
});

document.addEventListener('keyup', (event) => {
    const keyName = event.key;
    if (display.textContent === `keypress: ${keyName}` && inputField != document.activeElement) {
        display.textContent = `keypress: `;
        socket.send(display.textContent);
    }
});

socket.addEventListener('message', (event) => {
    console.log('received message');
    const data = event.data;
    if (data.startsWith('message: ')) {
        let check = String(data).slice(9);
        console.log(check);
        console.log(pswrd);
        if (check === pswrd) {
            console.log('match');
            document.getElementById('client_media_adjustment').style.display = 'none';
            document.getElementById('Dialogue').style.display = 'none';
            document.getElementById('submitButton').style.display = 'none';
            document.getElementById('keypress-display').style.display = 'none';
            document.getElementById('talkers').style.display = 'none';
            document.getElementById('DID').style.display = 'none';
            document.getElementById('user-1').style.display = 'none';
            document.getElementById('LS').style.display = 'none';
            document.getElementById('RS').textContent = 'Controller POV:';

        }

    }
});
