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

let clientCount = 0;
let uids = -1; 

wss.on('connection', (ws) => {
    uids++; 
    clientCount++; 
    console.log(`Client Connected. Total clients: ${clientCount}`);
    
    // Send UID message to the newly connected client
    
    ws.on('close', () => {
        clientCount--;
        console.log(`Client disconnected. Total clients: ${clientCount}`);
    });

    ws.on('message', (message) => {
        // Broadcast the message to all clients except the sender
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message.toString());
            }
        });
    });
});

server.listen(777, () => {
    console.log('Secure WebSocket server is running on wss://localhost:8080');
});

