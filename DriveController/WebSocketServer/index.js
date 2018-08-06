var cars = require ('./../DriveFunctions/WavestoneCar.js');
var rpio = require('rpio');
const io = require('socket.io')();
//var isOnline = require('is-online');
const isReachable = require('is-reachable');

var WavestoneCar = cars.WavestoneCar;
var myCar = new WavestoneCar();
//myCar.measureAll();


//////////////////////////////////////////////////////////////// TEST ////////////////////////////////////////////////////////////////

myCar.stop();
//myCar.moveUpCM(20, 255);
//myCar.moveDownCM(100, 255);
//setInterval(function(){myCar.Accelerometer.measureOnce();}, 5);

//myCar.rotateRightDegree(360, 255);

//////////////////////////////////////////////////////////////// TEST ////////////////////////////////////////////////////////////////


io.on('connection', (client) => {
    client.on('MOVE UP', (pwmSpeed) => {
		//pwmSpeed = parseFloat(pwmSpeed.toFixed(0));
		myCar.moveUp(pwmSpeed);
    });
		
	client.on('MOVE DOWN', (pwmSpeed) => {
		myCar.moveDown(pwmSpeed);
    });
	
	client.on('ROTATE RIGHT', (pwmSpeed) => {
		myCar.rotateRight(pwmSpeed);
    });
		
	client.on('ROTATE LEFT', (pwmSpeed) => {
		myCar.rotateLeft(pwmSpeed);
    });
		
	client.on('MOVE UP RIGHT', (pwmSpeed) => {
		myCar.moveUpRight(pwmSpeed);
    });
		
	client.on('MOVE UP LEFT', (pwmSpeed) => {
		myCar.moveUpLeft(pwmSpeed);
    });
		
	client.on('MOVE DOWN RIGHT', (pwmSpeed) => {
		myCar.moveDownRight(pwmSpeed);
    });
		
	client.on('MOVE DOWN LEFT', (pwmSpeed) => {
		myCar.moveDownLeft(pwmSpeed);
    });
		
	client.on('STOP', () => {
		console.log("STOP");
		myCar.stopAutoPilot();	
	});
	
	client.on('AUTO PILOT', () => {	
		myCar.startAutoPilot();
    });
});


const port = 8000;
io.listen(port);
console.log('listening on port ', port);