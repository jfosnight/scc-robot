const express = require('express');
const app = express();
const http = require('http');
const WebSocket = require('ws');


// SerialPort is used for communication with the Arduino
const SerialPort = require('serialport');
const port = new SerialPort('/dev/ttyACM0', {
  baudRate: 57600
});

// Send index.html to the browser
app.get('/', (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Initialize HTTP Server
const server = http.createServer(app);

// Initialize a Web Socket Server to talk with the client
const wss = new WebSocket.Server({server});

// Listen to WebSocket client connections
wss.on('connection', (ws, req) => {
	
	// Listen to messages from the WebSocketServer
	ws.on('message', (message) => {
		
		// Parse the incomming messages as JSON.  If JSON is not passed, it will crash the script
		//  TODO: Fix the script to handle errors
		let data = JSON.parse(message);
		
		// Expected data {"command": "move", "x": int, "y": int}
		if(data.command === "move"){
			console.log(data);
			
			let yOut = (data.y * 50).toFixed(0);
			console.log(yOut);
			
			// Output to Arduino
			port.write(yOut + "\n", (error) => {
				if(error){
					console.log(error);
				}
			});
		} else {
			// Log all other messages.
			console.log(data);
			
			// Parrot out to all WebSocket Clients
			alertClients(message);
		}
	});
	
	// Listen for a close from the WebSocket Clients
	ws.on('close', () => {
		console.log("Connection Closed");
	});
});

// Send out a message to all connected WebSocket Clients
function alertClients(message){
	for(client of wss.clients){
		client.send(message);
	}
}


// Listen on port 3003 for incomming HTTP connections
server.listen(3003, () => {
	console.log('Listening on %d', server.address().port);
});
