var cars = require ('./../DriveFunctions/WavestoneCar.js');
var rpio = require('rpio');

const io = require('socket.io')();

var WavestoneCar = cars.WavestoneCar;
var myCar = new WavestoneCar();

/*	

console.log("BEFORE MPU INIT");
if (myCar.Accelerometer.initialize()) {
	console.log("MPU INIT SUCCESS");	
}

setInterval(function(){
	var values = myCar.Accelerometer.getMotion9();
	var pitch = myCar.Accelerometer.getPitch(values);
	var roll = myCar.Accelerometer.getRoll(values);
	var yaw = myCar.Accelerometer.getYaw(values);
	console.log('pitch value : ', pitch);
	console.log('roll value : ', roll);
	console.log('yaw value : ', yaw);
}, 200);




setInterval(function(){console.log(myCar.Accelerometer.getTemperatureCelsiusDigital());}, 200);
var timer = 0;

setInterval(function(){
	var values = myCar.Accelerometer.getMotion9();
//	console.log(values);
	var pitch = myCar.Accelerometer.getPitch(values);
	var roll = myCar.Accelerometer.getRoll(values);
	var yaw = myCar.Accelerometer.getYaw(values);
	console.log('pitch value : ', pitch);
	console.log('roll value : ', roll);
	console.log('yaw value : ', yaw);
}, 200);
	

	var kalmanX = new myCar.Accelerometer.Kalman_filter();
	var kalmanY = new myCar.Accelerometer.Kalman_filter();

	kalmanX.setAngle(roll);
	kalmanY.setAngle(pitch);

	var micros = function() {
		return new Date().getTime();
	};
	var dt = 0;

	timer = micros();

	var interval;

	var kalAngleX = 0,
		kalAngleY = 0,
		kalAngleZ = 0,
		gyroXangle = roll,
		gyroYangle = pitch,
		gyroZangle = yaw,
		gyroXrate = 0,
		gyroYrate = 0,
		gyroZrate = 0,
		compAngleX = roll,
		compAngleY = pitch,
		compAngleZ = yaw;




interval = setInterval(function() {
	var values = myCar.Accelerometer.getMotion9();

	var dt = (micros() - timer) / 1000000;
	timer = micros();

	pitch = myCar.Accelerometer.getPitch(values);
	roll = myCar.Accelerometer.getRoll(values);
	yaw = myCar.Accelerometer.getYaw(values);

	var gyroXrate = values[3] / 131.0;
	var gyroYrate = values[4] / 131.0;
	var gyroZrate = values[5] / 131.0;

	if ((roll < -90 && kalAngleX > 90) || (roll > 90 && kalAngleX < -90)) {
		kalmanX.setAngle(roll);
		compAngleX = roll;
		kalAngleX = roll;
		gyroXangle = roll;
	} else {
		kalAngleX = kalmanX.getAngle(roll, gyroXrate, dt);
	}

	if (Math.abs(kalAngleX) > 90) {
		gyroYrate = -gyroYrate;
	}
	kalAngleY = kalmanY.getAngle(pitch, gyroYrate, dt);

	gyroXangle += gyroXrate * dt;
	gyroYangle += gyroYrate * dt;
	compAngleX = 0.93 * (compAngleX + gyroXrate * dt) + 0.07 * roll;
	compAngleY = 0.93 * (compAngleY + gyroYrate * dt) + 0.07 * pitch;

	if (gyroXangle < -180 || gyroXangle > 180) gyroXangle = kalAngleX;
	if (gyroYangle < -180 || gyroYangle > 180) gyroYangle = kalAngleY;

	var accel = {
		pitch: compAngleY,
		roll: compAngleX
	};
	console.log(accel);
}, 300);
*/





io.on('connection', (client) => {
    console.log('a user connected'); 
		
	client.on('MOVE UP', (speed) => {
		speed = parseFloat(speed.toFixed(0));
		myCar.moveUp(speed);
		console.log ("speed", speed);
		client.emit('forward distance', 15);
    });
		
	client.on('MOVE DOWN', (speed) => {
		myCar.moveDown(speed);
    });
	
	client.on('ROTATE RIGHT', (speed) => {
		myCar.rotateRight(speed);
    });
		
	client.on('ROTATE LEFT', (speed) => {
		myCar.rotateLeft(speed);
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
		console.log("STOP");
		myCar.stop();
		if (myCar.autoPilotOn) {
			console.log("STOP AUTOPILOT");
			myCar.autoPilotOn = false;
			clearInterval(myCar.intervalUltrasonicSensorObj);
			clearInterval(myCar.intervalAutoPilotObj);
		}
	});
	
	client.on('AUTO PILOT', () => {
		myCar.intervalUltrasonicSensorObj = setInterval(function(){myCar.measureDistances();}, 100);
		myCar.intervalAutoPilotObj = setInterval(function(){myCar.autoPilot();}, 300);
    });
});


const port = 8000;
io.listen(port);
console.log('listening on port ', port);