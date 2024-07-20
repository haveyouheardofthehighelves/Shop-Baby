let localStream;
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

const init = async () => {
    
    client = await AgoraRTM.createInstance(APP_ID);
    await client.login({ uid, token });
 
    channel = client.createChannel('main');
    await channel.join();

    channel.on('MemberJoined', handleUserJoined);

    client.on('MessageFromPeer', handleMessageFromPeer);

    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    //document.getElementById('user-1').srcObject = localStream;

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
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        //document.getElementById('user-1').srcObject = localStream;
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
const inputField = document.getElementById('Dialogue');
const submitButton = document.querySelector('button');

document.addEventListener('keydown', (event) => {
    if (inputField != document.activeElement){
        const keyName = event.key;
        const message = `Key pressed: ${keyName}`;
        display.textContent = message;
        socket.send(message);
    }
});

submitButton.addEventListener('click', () => {
    const message = `Message from ${inputField.value}`;
    socket.send(message);
});


document.addEventListener('keyup', (event) => {
    const keyName = event.key;
    const message = `Key released: ${keyName}`;
    // Check if the key released is the same as the key displayed
    if (display.textContent === `Key pressed: ${keyName}` && inputField != document.activeElement) {
        display.textContent = `Key pressed: `;
        socket.send(display.textContent);
    }
});



socket.addEventListener('message', (event) => {
    display.textContent = event.data;
});