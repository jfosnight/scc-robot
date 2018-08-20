const SerialPort = require('serialport');
const port = new SerialPort('/dev/ttyACM0', {
  baudRate: 57600
});


port.on('open', () => {
	console.log("Connected");
});

port.write("500\n", (error) => {
	if(error){
		console.log(error);
	}
});

// Switches the port into "flowing mode"
//~ port.on('data', function (data) {
  //~ console.log('Data:', data.toString());
//~ });

// Read data that is available but keep the stream from entering "flowing mode"
port.on('readable', function () {
  console.log('Data:', port.read().toString());
});
