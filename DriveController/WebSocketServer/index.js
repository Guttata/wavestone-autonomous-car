var DriveController = require ('./../DriveFunctions/DriveController.js');
var cars = require ('./../DriveFunctions/WavestoneCar.js');
var WavestoneCar = cars.WavestoneCar;
var myCar = new WavestoneCar();
var rpio = require('rpio');

const io = require('socket.io')();

io.on('connection', (client) => {
    console.log('a user connected'); 
		
	client.on('MOVE UP', (speed) => {
		myCar.moveUp(speed);
		client.emit('forward distance', 15);
    });
		
	client.on('MOVE DOWN', (speed) => {
		myCar.moveDown(speed);
    });
	
	client.on('MOVE RIGHT', (speed) => {
		myCar.moveRight(speed);
    });
		
	client.on('MOVE LEFT', (speed) => {
		myCar.moveLeft(speed);
    });
		
	client.on('MOVE UP RIGHT', (speed) => {
		myCar.moveUpRight(speed);
    });
		
	client.on('MOVE UP LEFT', (speed) => {
		myCar.moveUpLeft(speed);
    });
		
	client.on('MOVE DOWN RIGHT', (speed) => {
		myCar.moveDownRight(speed);
    });
		
	client.on('MOVE DOWN LEFT', (speed) => {
		myCar.moveDownLeft(speed);
    });
		
	client.on('STOP', () => {
		myCar.stop();
    });
});


const port = 8000;
io.listen(port);
console.log('listening on port ', port);
