var cars = require ('./../DriveFunctions/WavestoneCar.js');
var rpio = require('rpio');
const io = require('socket.io')();
var isOnline = require('is-online');

var WavestoneCar = cars.WavestoneCar;
var myCar = new WavestoneCar();
myCar.measureAll();
//myCar.moveUpCM(100, 255);
//myCar.moveDownCM(100, 255);
//myCar.intervalAccelerometer = setInterval(function(){myCar.measureAccelerometer();}, 500);


//myCar.printEncoderRight = setInterval(function(){console.log("Right encoder", myCar.RightEncoder.nbTicks)}, 100);
//myCar.printEncoderLeft = setInterval(function(){console.log("Left encoder", myCar.LeftEncoder.nbTicks)}, 100);



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
		myCar.stop();
		if (myCar.autoPilotOn) {
			console.log("STOP AUTOPILOT");
			myCar.autoPilotOn = false;
			clearInterval(myCar.intervalDistance);
			clearInterval(myCar.intervalAccelerometer);
			clearInterval(myCar.intervalAutoPilot);
			isOnline().then(online => {
				console.log("isOnline");
				//myCar.AWS.publish('autoPilot', JSON.stringify({ auto_pilot: 0}));
			});
	 		
		}
	});
	
	client.on('AUTO PILOT', () => {	
		myCar.intervalAutoPilot = setInterval(function(){myCar.autoPilot();}, 200);
		myCar.intervalDistance = setInterval(function(){myCar.measureAllDistances();}, 100);
		myCar.intervalAccelerometer = setInterval(function(){myCar.measureAccelerometer();}, 500);
		isOnline().then(online => {
			//myCar.AWS.publish('autoPilot', JSON.stringify({ auto_pilot: 1}));
			console.log("isOnline");
		});
    });
});


const port = 8000;
io.listen(port);
console.log('listening on port ', port);