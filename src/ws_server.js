const fs = require('fs');
const https = require('https');
const WebSocket = require('ws');
const path = require('path'); 

const port = process.env.PORT || 3013

// Load SSL certificate and key
const server = https.createServer({
    key: fs.readFileSync(path.join(__dirname,'..','ssl','key.pem'), 'utf-8'),
    cert: fs.readFileSync(path.join(__dirname,'..','ssl','cert.pem'), 'utf-8')
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
        console.log(message)
    
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message.toString());
            }
        });
    });
});

server.listen(port, () => {
    console.log(`Secure WebSocket server is running on wss://localhost:${port}`);
});

