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
			
			let xOut = (data.x * 50).toFixed(0);
			let yOut = (data.y * 50).toFixed(0);
			
			// Output to Arduino
			sendMove(xOut, yOut);
			
			alertClients(JSON.stringify({command: "position", x: xOut, y: yOut}));
		} else if (data.command === "position") {
			console.log(data);
			
			let xOut = (data.x * 50).toFixed(0);
			let yOut = (data.y * 50).toFixed(0);
			
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

// REST API
app.get("/robot/pos/", (req, res) => {
	getPos();
});
app.post("/robot/move/", (req, res) => {
	sendMove(x,y);
});


// Listen on port 3003 for incomming HTTP connections
server.listen(3003, () => {
	console.log('Listening on %d', server.address().port);
});

// Send X,Y to Arduino
function sendMove(x, y){
	// Output to Arduino
	port.write(`${x},${y}\n`, portErrorCB);
}
function getPos(){
	port.write("pos", portErrorCB);
}
// Read data that is available but keep the stream from entering "flowing mode"
port.on('readable', function () {
  console.log('Data:', port.read().toString());
});

function portErrorCB(err){
	if(err){
		console.error(err);
	}
}
