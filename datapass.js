const socket = new WebSocket('wss://192.168.0.77:8080');

socket.addEventListener('message', (event) => {
    console.log('recieved message')
    const prefixes = ['msgID', 'message', 'keypress'];
    const data = event.data;
    console.log(event.data)
    for (const prefix of prefixes) {
        if (data.startsWith(prefix)) {
            const element = document.getElementById(prefix);
            if (element) {
                element.textContent = data;
            }
            break;
        }
    }
});

  
  