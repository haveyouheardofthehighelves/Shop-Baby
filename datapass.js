const socket = new WebSocket('wss://192.168.0.77:777');
const submitButton = document.getElementById('submitButton');

window.addEventListener('storage', function(event) {
    if (event.storageArea === localStorage) {
        if (event.key === 'message' || event.key === 'msgID' || event.key == 'keypress') {
            var dialogue = localStorage.getItem('message');
            var ID = localStorage.getItem('msgID');
            submitButton.textContent = `msgID: ${ID}`
            // Process or log the values as needed
            console.log('Message:', dialogue);
            console.log('Message ID:', ID);
        }
        socket.send(`${event.key}: ${localStorage.getItem(event.key)}`);
    }
  });

  socket.addEventListener('message', (event) => {
        if (event.data.startsWith('msgID')){
            submitButton.textContent = event.data;
        }
    });
  
  