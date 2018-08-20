const express = require('express');
const app = express();
const http = require('http');
const WebSocket = require('ws');

const SerialPort = require('serialport');
const port = new SerialPort('/dev/ttyACM0', {
  baudRate: 57600
});

// Normal AJAX Client
app.get('/', (req, res) => {
  res.sendFile(__dirname + "/index.html");
});


const server = http.createServer(app);
const wss = new WebSocket.Server({server});

wss.on('connection', (ws, req) => {
	
	ws.on('message', (message) => {
		let data = JSON.parse(message);
		
		if(data.command === "move"){
			console.log(data);
			
			let yOut = (data.y * 50).toFixed(0);
			
			
			console.log(yOut);
			
			port.write(yOut + "\n", (error) => {
				if(error){
					console.log(error);
				}
			});
		} else {
			console.log(data);
			alertClients(message);
		}
	});
	
	ws.on('close', () => {
		console.log("Connection Closed");
	});
});

function alertClients(message){
	for(client of wss.clients){
		client.send(message);
	}
}

server.listen(3003, () => {
	console.log('Listening on %d', server.address().port);
});
