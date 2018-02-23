var DriveController = require ('./../DriveFunctions/DriveController.js');
var cars = require ('./../DriveFunctions/WavestoneCar.js');
var WavestoneCar = cars.WavestoneCar;
var myCar = new WavestoneCar();
var rpio = require('rpio');

const io = require('socket.io')();

io.on('connection', (client) => {
    console.log('a user connected'); 
	client.on('moveJoystick', (data) => {
		var degree = parseFloat(data.degree.toFixed(1));
		var speed = parseFloat(data.speed.toFixed(1));
		myCar.moveJoystick(degree, speed);
    });
	
	client.on('stop', () => {
		myCar.stop();
    });
	
	client.on('moveAccelerometer', (data) => {
		var x = parseFloat(data.x.toFixed(1));
		var y = parseFloat(data.y.toFixed(1));
		myCar.moveAccelerometer(x, y);
    });
	
});


const port = 8000;
io.listen(port);
console.log('listening on port ', port);
