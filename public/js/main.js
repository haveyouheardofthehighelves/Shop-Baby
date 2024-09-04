/**
 * Socket.io socket
 */
let socket;
/**
 * The stream object used to send media
 */
let localStream = null;
/**
 * All peer connections
 */
let peers = {}
// redirect if not https
if(location.href.substr(0,5) !== 'https') 
    location.href = 'https' + location.href.substr(4, location.href.length - 4)
let peersize = 0


//////////// CONFIGURATION //////////////////

/**
 * RTCPeerConnection configuration 
 */

const configuration = {
    // Using From https://www.metered.ca/tools/openrelay/
    "iceServers": [
    {
      urls: "stun:openrelay.metered.ca:80"
    },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject"
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject"
    },
    {
      urls: "turn:openrelay.metered.ca:443?transport=tcp",
      username: "openrelayproject",
      credential: "openrelayproject"
    }
  ]
}

/**
 * UserMedia constraints
 */
let constraints = {
    audio: false,
    video: {
        height: 500,
    }
}

/////////////////////////////////////////////////////////

constraints.video.facingMode = {
    ideal: "user"
}

// enabling the camera at startup
navigator.mediaDevices.getUserMedia(constraints).then(stream => {
    localVideo.srcObject = stream;
    localVideo.style.height = '250px'
    localStream = stream;
    init()

}).catch(e => alert(`getusermedia error ${e.name}`))

/**
 * initialize the socket connections
 */
function init() {
    socket = io()

    socket.on('initReceive', socket_id => {
        console.log('INIT RECEIVE ' + socket_id)
        console.log('hello')
        addPeer(socket_id, false)
        socket.emit('initSend', socket_id)
    })

    socket.on('switch', () => {
        switchMedia()
        console.log('switching camera')
    })

    socket.on('toggleAudio', () =>{
        toggleMute()
        console.log('toggle audio')
    })

    socket.on('initSend', socket_id => {
        console.log('INIT SEND ' + socket_id)
        addPeer(socket_id, true)
    })

    socket.on('removePeer', socket_id => {
        console.log('removing peer ' + socket_id)
        removePeer(socket_id)
    })

    socket.on('disconnect', () => {
        console.log('GOT DISCONNECTED')
        for (let socket_id in peers) {
            removePeer(socket_id)
        }
    })

    socket.on('signal', data => {
        peers[data.socket_id].signal(data.signal)
    })
}

/**
 * Remove a peer with given socket_id. 
 * Removes the video element and deletes the connection
 * @param {String} socket_id 
 */
function removePeer(socket_id) {

    let videoEl = document.getElementById(socket_id)
    if (videoEl) {

        const tracks = videoEl.srcObject.getTracks();

        tracks.forEach(function (track) {
            track.stop()
        })

        videoEl.srcObject = null
        let children = videoEl.parentNode.children; // Use childNodes if you want to include text nodes as well
        for (let i = 0; i < children.length; i++) {
            if(children[i] != videoEl){
                videoEl.parentNode.removeChild(children[i])
            }
        }
        videoEl.parentNode.removeChild(videoEl)
        peersize-=1
    }
    if (peers[socket_id]) peers[socket_id].destroy()
    delete peers[socket_id]
}

/**
 * Creates a new peer connection and sets the event listeners
 * @param {String} socket_id 
 *                 ID of the peer
 * @param {Boolean} am_initiator 
 *                  Set to true if the peer initiates the connection process.
 *                  Set to false if the peer receives the connection. 
 */
function addPeer(socket_id, am_initiator) {
    peers[socket_id] = new SimplePeer({
        initiator: am_initiator,
        stream: localStream,
        config: configuration
    })
    
    peers[socket_id].on('signal', data => {
        socket.emit('signal', {
            signal: data,
            socket_id: socket_id
        })
    })

    peers[socket_id].on('stream', stream => {
        peersize+=1
        // Create a container for the video and label
            let videoContainer = document.createElement('div');
            videoContainer.className = 'video-container';
            videoContainer.style.position = 'relative';
            videoContainer.style.display = 'inline-block';
        
        // Create the video element
        let newVid = document.createElement('video');
        newVid.srcObject = stream;
        newVid.id = socket_id;
        newVid.playsinline = false;
        newVid.autoplay = true;
        newVid.className = "vid";
        newVid.onclick = () => openPictureMode(newVid);
        newVid.ontouchstart = (e) => openPictureMode(newVid);
        
        newVid.addEventListener('loadedmetadata', () => {
            if (newVid.videoWidth < newVid.videoHeight) {
                newVid.style.transform = 'rotate(90deg)';
                /*let temp = newVid.videoWidth
                newVid.videoWidth = newVid.videoHeight
                newVid.videoHeight = temp*/
                console.log(newVid.videoWidth)
                console.log(newVid.videoHeight)
                videoContainer.style.padding = `0 ${(newVid.videoHeight - newVid.videoWidth)}`
            }
        });

        // Create the label for the socket_id
        let label = document.createElement('div');
        label.textContent = ""
        if(peersize == 1){
            label.textContent += "FrontView: "
        }

        if(peersize == 2){
            label.textContent += "Elevator Arm: "
        }
        label.id = `label: ${socket_id}`
        label.className = 'video-label';
        label.textContent += socket_id;
        label.style.position = 'absolute';
        label.style.top = '5px';
        label.style.left = '5px';
        label.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        label.style.color = 'white';
        label.style.padding = '2px 5px';
        label.style.borderRadius = '3px';
        label.style.fontSize = '12px';
    
        // Append the label and video to the container
        videoContainer.appendChild(newVid);
        videoContainer.appendChild(label);
    
        // Append the container to the videos element
        videos.appendChild(videoContainer);
    });
}

/**
 * Opens an element in Picture-in-Picture mode
 * @param {HTMLVideoElement} el video element to put in pip mode
 */
function openPictureMode(el) {
    console.log('opening pip')
    el.requestPictureInPicture()
}

/**
 * Switches the camera between user and environment. It will just enable the camera 2 cameras not supported.
 */
function switchMedia() {
    if (constraints.video.facingMode.ideal === 'user') {
        constraints.video.facingMode.ideal = 'environment'
    } else {
        constraints.video.facingMode.ideal = 'user'
    }

    const tracks = localStream.getTracks();

    tracks.forEach(function (track) {
        track.stop()
    })

    localVideo.srcObject = null
    navigator.mediaDevices.getUserMedia(constraints).then(stream => {

        for (let socket_id in peers) {
            for (let index in peers[socket_id].streams[0].getTracks()) {
                for (let index2 in stream.getTracks()) {
                    if (peers[socket_id].streams[0].getTracks()[index].kind === stream.getTracks()[index2].kind) {
                        peers[socket_id].replaceTrack(peers[socket_id].streams[0].getTracks()[index], stream.getTracks()[index2], peers[socket_id].streams[0])
                        break;
                    }
                }
            }
        }

        localStream = stream
        localVideo.srcObject = stream

        updateButtons()
    })
}

/**
 * Enable screen share
 */
function setScreen() {
    navigator.mediaDevices.getDisplayMedia().then(stream => {
        for (let socket_id in peers) {
            for (let index in peers[socket_id].streams[0].getTracks()) {
                for (let index2 in stream.getTracks()) {
                    if (peers[socket_id].streams[0].getTracks()[index].kind === stream.getTracks()[index2].kind) {
                        peers[socket_id].replaceTrack(peers[socket_id].streams[0].getTracks()[index], stream.getTracks()[index2], peers[socket_id].streams[0])
                        break;
                    }
                }
            }

        }
        localStream = stream

        localVideo.srcObject = localStream
        socket.emit('removeUpdatePeer', '')
    })
    updateButtons()
}

/**
 * Disables and removes the local stream and all the connections to other peers.
 */
function removeLocalStream() {
    if (localStream) {
        const tracks = localStream.getTracks();

        tracks.forEach(function (track) {
            track.stop()
        })

        localVideo.srcObject = null
    }

    for (let socket_id in peers) {
        removePeer(socket_id)
    }
}

/**
 * Enable/disable microphone
 */
function toggleMute() {
    for (let index in localStream.getAudioTracks()) {
        localStream.getAudioTracks()[index].enabled = !localStream.getAudioTracks()[index].enabled
        muteButton.innerText = localStream.getAudioTracks()[index].enabled ? "Unmuted" : "Muted"
    }
}
/**
 * Enable/disable video
 */
function toggleVid() {
    for (let index in localStream.getVideoTracks()) {
        localStream.getVideoTracks()[index].enabled = !localStream.getVideoTracks()[index].enabled
        vidButton.innerText = localStream.getVideoTracks()[index].enabled ? "Video Enabled" : "Video Disabled"
    }
}

/**
 * updating text of buttons
 */
function updateButtons() {
    for (let index in localStream.getVideoTracks()) {
        vidButton.innerText = localStream.getVideoTracks()[index].enabled ? "Video Enabled" : "Video Disabled"
    }
    for (let index in localStream.getAudioTracks()) {
        muteButton.innerText = localStream.getAudioTracks()[index].enabled ? "Unmuted" : "Muted"
    }
}

function submitCheck() {
    const TTS = document.getElementById("TTS");
    const CMD = document.getElementById("commands");
    console.log(TTS.value)
    console.log(CMD.value)
    let arguments = CMD.value.split(' ')
    let socketID = arguments[1]
    console.log(arguments)
    if(socketID in peers){
        if(arguments[0] == 'swap'){
            //swap video feeds (local action)
        }

        if(arguments[0] == 'switch'){
            socket.emit('switch', socketID)
        }

        if(arguments[0] == 'toggleAudio'){
            socket.emit('toggleAudio', socketID)
        }

    }
}   