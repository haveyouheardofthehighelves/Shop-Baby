const fs = require('fs');
const https = require('https');
const WebSocket = require('ws');

// Load SSL certificate and key
const server = https.createServer({
    cert: fs.readFileSync("C:/Users/sethy/OneDrive/Documents/LiveUpdateTest/https/localhost.pem"),
    key: fs.readFileSync("C:/Users/sethy/OneDrive/Documents/LiveUpdateTest/https/localhost.key"),
    passphrase: "catfish533t"
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        // Broadcast the message to all clients
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message.toString());
            }
        });
    });
});

server.listen(8080, () => {
    console.log('Secure WebSocket server is running on wss://localhost:8080');
});
