var constants = require("./WavestoneCarConstants");
var rpio = require('rpio');
var Gpio = require('pigpio').Gpio;
var mcpadc = require('mcp-spi-adc');
var mpu9250 = require('mpu9250');


var options = {
	gpiomem: false,
};

rpio.init(options);


function WavestoneCar () {
	//Motor engine instanciation
	this.LeftMotorEngine = new MotorEngine(constants.LEFT_MOTOR_ENGINE_DIR_PIN, constants.LEFT_MOTOR_ENGINE_PWM_PIN);
	this.RightMotorEngine = new MotorEngine(constants.RIGHT_MOTOR_ENGINE_DIR_PIN, constants.RIGHT_MOTOR_ENGINE_PWM_PIN);
	this.currentDirection = "";
	
	//Ultrason sensor instanciation
	this.FrontUltrasonicSensor = new UltrasonicSensor ("US FRONT SENSOR", constants.FRONT_ULTRASONIC_SENSOR_ECHO_GPIO, constants.FRONT_ULTRASONIC_SENSOR_TRIG_GPIO);
	this.FrontRightUltrasonicSensor = new UltrasonicSensor ("US FRONT RIGHT SENSOR", constants.FRONT_RIGHT_ULTRASONIC_SENSOR_ECHO_GPIO, constants.FRONT_RIGHT_ULTRASONIC_SENSOR_TRIG_GPIO);
	this.FrontLeftUltrasonicSensor = new UltrasonicSensor ("US FRONT LEFT SENSOR", constants.FRONT_LEFT_ULTRASONIC_SENSOR_ECHO_GPIO, constants.FRONT_LEFT_ULTRASONIC_SENSOR_TRIG_GPIO);
	this.BackUltrasonicSensor = new UltrasonicSensor ("US BACK SENSOR", constants.BACK_ULTRASONIC_SENSOR_ECHO_GPIO, constants.BACK_ULTRASONIC_SENSOR_TRIG_GPIO);

	//Shartp IR Sensor instanciation
	this.RightSharpIRSensor = new SharpIRSensor("IR RIGHT SIDE", constants.RIGHT_IR_SENSOR_PIN);
	//this.LeftSharpIRSensor = new SharpIRSensor("IR LEFT SIDE", constants.LEFT_IR_SENSOR_PIN);

	//Accelerometer
	this.Accelerometer = new mpu9250({UpMagneto: true, DEBUG: true, GYRO_FS: 0, ACCEL_FS: 1});

	this.autoPilotOn = false;
}

WavestoneCar.prototype.moveUp = function (speed) {
	if (this.currentDirection != "MOVE UP") {
		this.currentDirection = "MOVE UP";
		var speed = 255;
		this.LeftMotorEngine.moveForward(speed);
		this.RightMotorEngine.moveForward(speed);
		console.log('MOVE UP'); 
	}
}

WavestoneCar.prototype.moveDown = function (speed) {
	if (this.currentDirection != "MOVE DOWN") {
		this.currentDirection = "MOVE DOWN";
		var speed = 255;
		this.LeftMotorEngine.moveBackward(speed);
		this.RightMotorEngine.moveBackward(speed);
		console.log('MOVE DOWN'); 
	}
}

WavestoneCar.prototype.rotateRight = function (speed) {
	if (this.currentDirection != "ROTATE RIGHT") {
		this.currentDirection = "ROTATE RIGHT";
		var speed = 255;
		this.LeftMotorEngine.moveBackward(speed);
		this.RightMotorEngine.moveForward(speed);
		console.log('ROTATE RIGHT');
	}
}

WavestoneCar.prototype.rotateLeft = function (speed) {
	if (this.currentDirection != "ROTATE LEFT") {
		this.currentDirection = "ROTATE LEFT";
		var speed = 255;
		this.LeftMotorEngine.moveForward(speed);
		this.RightMotorEngine.moveBackward(speed);
		console.log('ROTATE LEFT'); 
	}
}

WavestoneCar.prototype.moveUpLeft = function (speed) {
	if (this.currentDirection != "MOVE UP LEFT") {
		this.currentDirection = "MOVE UP LEFT";
		var speed = 255;
		this.LeftMotorEngine.moveForward(speed);
		this.RightMotorEngine.moveForward(speed/5);
		console.log('MOVE UP LEFT');
	}
}

WavestoneCar.prototype.moveUpRight = function (speed) {
	if (this.currentDirection != "MOVE UP RIGHT") {
		this.currentDirection = "MOVE UP RIGHT";
		var speed = 255;
		this.LeftMotorEngine.moveForward(speed/5);
		this.RightMotorEngine.moveForward(speed);
		console.log('MOVE UP RIGHT'); 
	}
}

WavestoneCar.prototype.moveDownLeft = function (speed) {
	if (this.currentDirection != "MOVE DOWN LEFT") {
		this.currentDirection = "MOVE DOWN LEFT";
		var speed = 255;
		this.LeftMotorEngine.moveBackward(speed);
		this.RightMotorEngine.moveBackward(speed/5);
		console.log('MOVE DOWN LEFT');
	}
}

WavestoneCar.prototype.moveDownRight = function (speed) {
	if (this.currentDirection != "MOVE DOWN RIGHT") {
		this.currentDirection = "MOVE DOWN RIGHT";
		var speed = 255;
		this.LeftMotorEngine.moveBackward(speed/5);
		this.RightMotorEngine.moveBackward(speed);
		console.log('MOVE DOWN RIGHT');
	}
}

WavestoneCar.prototype.stop = function () {
	if (this.currentDirection != "STOP") {
		this.currentDirection = "STOP";
		this.RightMotorEngine.stop();
		this.LeftMotorEngine.stop();
		console.log('STOP');
	}
};

WavestoneCar.prototype.measureDistances = function () {
	
	//Ultrasonic sensor
	this.FrontUltrasonicSensor.measureDistanceOnce();
	this.FrontRightUltrasonicSensor.measureDistanceOnce();
	this.FrontLeftUltrasonicSensor.measureDistanceOnce();
	this.BackUltrasonicSensor.measureDistanceOnce();

	//SharpIR sensor
	this.RightSharpIRSensor.measureDistanceOnce();
	//this.LeftSharpIRSensor.measureDistanceOnce();
}

WavestoneCar.prototype.isFrontObstacle = function(){
	var frontDistance = this.FrontUltrasonicSensor.distance;
	
	if (frontDistance < 70)
		return true;
	else if (this.isFrontRightObstacle())
		return true;
	else if (this.isFrontLeftObstacle())
		return true;

	return false;
}

WavestoneCar.prototype.isFrontRightObstacle = function(){
	var frontRightDistance = this.FrontRightUltrasonicSensor.distance;
	
	if (frontRightDistance < 50)
		return true;
	return false;
}

WavestoneCar.prototype.isFrontLeftObstacle = function(){
	var frontLeftDistance = this.FrontLeftUltrasonicSensor.distance;
	
	if (frontLeftDistance < 50)
		return true;
	return false;
}

WavestoneCar.prototype.isBackObstacle = function(){
	var backDistance = this.BackUltrasonicSensor.distance;
	
	if (backDistance < 10)
		return true;
	return false;
}

WavestoneCar.prototype.moveUpRightStrategy = function(){
	var frontDistance = this.FrontUltrasonicSensor.distance;
	var frontRightDistance = this.FrontRightUltrasonicSensor.distance;
	var frontLeftDistance = this.FrontLeftUltrasonicSensor.distance;

	if (frontRightDistance < 50) {
		//If front right distance not enough to move up
		return this.rotateStrategy();
	} else if (frontDistance > 25 && frontLeftDistance > 25) {
		//If front right distance is enough and enough front and front left space then try to move UP
		return "MOVE UP RIGHT";
	} else {
		// If we are in a front obstacle
		return this.backwardStrategy();
	}
}

WavestoneCar.prototype.moveUpLeftStrategy = function(){
	var frontDistance = this.FrontUltrasonicSensor.distance;
	var frontRightDistance = this.FrontRightUltrasonicSensor.distance;
	var frontLeftDistance = this.FrontLeftUltrasonicSensor.distance;

	if (frontLeftDistance < 50) {
		//If front left distance not enough to move up
		return this.rotateStrategy();
	} else if (frontDistance > 25 && frontRightDistance > 25) {
		//If front left distance is enough and enough front and front right space then try to move UP
		return "MOVE UP LEFT";
	} else {
		// If we are in a front obstacle
		return this.backwardStrategy();
	}

}

WavestoneCar.prototype.backwardStrategy = function (){
	var frontDistance = this.FrontUltrasonicSensor.distance;
	var frontRightDistance = this.FrontRightUltrasonicSensor.distance;
	var frontLeftDistance = this.FrontLeftUltrasonicSensor.distance;
	var backDistance = this.BackUltrasonicSensor.distance;
	
	//If there is no back obstacle	
	if (!this.isBackObstacle()) {
		//If there is more space front right, then move back left to go front right after
		if (frontRightDistance > 20 && frontRightDistance > frontLeftDistance) {
			return "MOVE DOWN LEFT"
		} else if (frontLeftDistance > 20 && frontRightDistance < frontLeftDistance) {
			//If there is more space front left, then move back right to go front left after
			return "MOVE DOWN RIGHT"
		} else {
			return "MOVE DOWN";
		}
	} else {
		//If there is a back obstacle then rotate
		return this.rotateStrategy();
	}
}

WavestoneCar.prototype.rotateStrategy = function(){
	var frontDistance = this.FrontUltrasonicSensor.distance;
	var frontRightDistance = this.FrontRightUltrasonicSensor.distance;
	var frontLeftDistance = this.FrontLeftUltrasonicSensor.distance;
	var backDistance = this.BackUltrasonicSensor.distance;

	if (frontDistance > 5 && frontRightDistance > 5 && frontLeftDistance > 5 && backDistance > 5) {
		if (this.currentDirection == "ROTATE RIGHT" || this.currentDirection == "MOVE UP RIGHT" || this.currentDirection == "MOVE DOWN LEFT") {
			return "ROTATE RIGHT";
		} else if (this.currentDirection == "ROTATE LEFT" || this.currentDirection == "MOVE UP LEFT" || this.currentDirection == "MOVE DOWN RIGHT") {
			return "ROTATE LEFT";
		} else if (frontRightDistance > frontLeftDistance) {
			return "ROTATE RIGHT";
		} else {
			return "ROTATE LEFT";
		}
	} else if (!this.isBackObstacle()){
		return this.backwardStrategy();
	} else {
		return "STOP";
	}

}


WavestoneCar.prototype.chooseDirection = function(){
	var frontDistance = this.FrontUltrasonicSensor.distance;
	var frontRightDistance = this.FrontRightUltrasonicSensor.distance;
	var frontLeftDistance = this.FrontLeftUltrasonicSensor.distance;
	var backDistance = this.BackUltrasonicSensor.distance;
	
	console.log(this.FrontUltrasonicSensor.name, ": " , this.FrontUltrasonicSensor.distance);
	console.log(this.FrontRightUltrasonicSensor.name, ": " , this.FrontRightUltrasonicSensor.distance);
	console.log(this.FrontLeftUltrasonicSensor.name, ": " , this.FrontLeftUltrasonicSensor.distance);
	console.log(this.BackUltrasonicSensor.name, ": " , this.BackUltrasonicSensor.distance);

	//No front obstacle, move up
	if (!this.isFrontObstacle()) {
		return "MOVE UP";
	}
	//Front obstacle detected and we are to close to move up / move up right left / move up right
	else if (frontDistance < 10 || frontRightDistance < 10 || frontLeftDistance < 10) {
		return this.rotateStrategy();
	}
	//If there is more space front right
	else if (frontRightDistance > frontLeftDistance) {
		return this.moveUpRightStrategy();
	} else {
		//If there is more space front left
		return this.moveUpLeftStrategy();
	}
}


WavestoneCar.prototype.autoPilot = function (){
	console.log("------------ BEGIN AUTO PILOT FUNCTION ------------");
	this.autoPilotOn = true;
	
	var direction = this.chooseDirection();
	console.log("Auto pilot: ", direction);
	switch (direction) {
		case "MOVE UP" :
			this.moveUp();
			break;
		case "MOVE UP RIGHT" :
			this.moveUpRight();
			break;
		case "MOVE UP LEFT" :
			this.moveUpLeft();
			break;
		case "ROTATE RIGHT" :
			this.rotateRight();
			break;
		case "ROTATE LEFT" :
			this.rotateLeft();
			break;
		case "MOVE DOWN" :
			this.moveDown();
			break;
		case "MOVE DOWN RIGHT" :
			this.moveDownRight();
			break;
		case "MOVE DOWN LEFT" :
			this.moveDownLeft();
			break;
		case "STOP" :
			this.stop();
			break;
	}
		console.log("------------ END AUTO PILOT FUNCTION ------------");
}

module.exports.WavestoneCar = WavestoneCar;


/*
WavestoneCar.prototype.chooseDirection = function(){
	var frontDistance = this.FrontUltrasonicSensor.distance;
	var frontRightDistance = this.FrontRightUltrasonicSensor.distance;
	var frontLeftDistance = this.FrontLeftUltrasonicSensor.distance;
	var backDistance = this.BackUltrasonicSensor.distance;
	
	console.log(this.FrontUltrasonicSensor.name, ": " , this.FrontUltrasonicSensor.distance);
	console.log(this.FrontRightUltrasonicSensor.name, ": " , this.FrontRightUltrasonicSensor.distance);
	console.log(this.FrontLeftUltrasonicSensor.name, ": " , this.FrontLeftUltrasonicSensor.distance);
	console.log(this.BackUltrasonicSensor.name, ": " , this.BackUltrasonicSensor.distance);

	//No front obstacle
	if (!this.isFrontObstacle()) {
		return "MOVE UP";
	}
	//Front obstacle detected
	else if (frontDistance < 10 || frontRightDistance < 10 || frontLeftDistance < 10) {
		// If we are in a front obstacle
		if (!this.isBackObstacle()) {
			//If there is no back obstacle	
			if (frontRightDistance > 20 && frontRightDistance > frontLeftDistance) {
				//If there is more space front right, then move back left to go front right after
				return "MOVE DOWN LEFT"
			} else if (frontLeftDistance > 20 && frontRightDistance < frontLeftDistance) {
				//If there is more space front left, then move back right to go front left after
				return "MOVE DOWN RIGHT"
			} else {
			return "MOVE DOWN";
			}
		} else {
			//If there is a back obstacle then rotate
			return "ROTATE RIGHT";
		}
	}
	else if (frontRightDistance > frontLeftDistance) {
		//If there is more space front right
		if (frontRightDistance < 45) {
			//If front right distance not enough to move up
			if (this.currentDirection == "ROTATE LEFT") {
				return "ROTATE LEFT";
			}
			return "ROTATE RIGHT";
		} else if (frontDistance > 30 && frontLeftDistance > 30) {
			//If front right distance is enough and enough front and front left space then try to move UP
			return "MOVE UP RIGHT";
		} else {
			if (!this.isBackObstacle()) {
				//If there is no back obstacle	
				if (frontRightDistance > 20 && frontRightDistance > frontLeftDistance) {
					//If there is more space front right, then move back left to go front right after
					return "MOVE DOWN LEFT"
				} else if (frontLeftDistance > 20 && frontRightDistance < frontLeftDistance) {
					//If there is more space front left, then move back right to go front left after
					return "MOVE DOWN RIGHT"
				} else {
				return "MOVE DOWN";
				}
			} else {
				//If there is a back obstacle then rotate
				return "ROTATE RIGHT";
			}
		}
	} else {
		//If there is more space front left
		if (frontLeftDistance < 45) {
			//If front left distance not enough to move up
			if (this.currentDirection == "ROTATE RIGHT"){
				return "ROTATE RIGHT";
			}
			return "ROTATE LEFT";
		} else if (frontDistance > 30 && frontRightDistance > 30) {
			//If front left distance is enough and enough front and front right space then try to move UP
			return "MOVE UP LEFT";
		} else {
			if (!this.isBackObstacle()) {
				//If there is no back obstacle	
				if (frontRightDistance > 20 && frontRightDistance > frontLeftDistance) {
					//If there is more space front right, then move back left to go front right after
					return "MOVE DOWN LEFT"
				} else if (frontLeftDistance > 20 && frontRightDistance < frontLeftDistance) {
					//If there is more space front left, then move back right to go front left after
					return "MOVE DOWN RIGHT"
				} else {
				return "MOVE DOWN";
				}
			} else {
				//If there is a back obstacle then rotate
				return "ROTATE RIGHT";
			}
		}
	}
}

*/

///////////////////////////////////////////////////////////////////


function MotorEngine(dirPin, pwmPin){
	this.dirPin = dirPin;
	this.pwmPin = pwmPin;
}


MotorEngine.prototype.moveForward = function (speed) {
	rpio.open(this.dirPin, rpio.OUTPUT);
	rpio.open(this.pwmPin, rpio.PWM, rpio.LOW);
	
	rpio.write(this.dirPin, rpio.LOW);
	
	rpio.pwmSetClockDivider(constants.PWM_CLOCK_DIV);
	rpio.pwmSetRange(this.pwmPin, constants.PWM_RANGE);
	rpio.pwmSetData(this.pwmPin, speed);
		
};
	
MotorEngine.prototype.moveBackward = function (speed) {
	rpio.open(this.dirPin, rpio.OUTPUT);
	rpio.open(this.pwmPin, rpio.PWM, rpio.LOW);	
	
	rpio.write(this.dirPin, rpio.HIGH);
	
	rpio.pwmSetClockDivider(constants.PWM_CLOCK_DIV);
	rpio.pwmSetRange(this.pwmPin, constants.PWM_RANGE);
	rpio.pwmSetData(this.pwmPin, speed); 
};

MotorEngine.prototype.stop = function () {
	rpio.open(this.dirPin, rpio.OUTPUT);
	rpio.open(this.pwmPin, rpio.OUTPUT);	
	
	rpio.write(this.dirPin, rpio.LOW);
	rpio.write(this.pwmPin, rpio.LOW);
};


module.exports.MotorEngine = MotorEngine;

//////////////////////////////////////////////////////////////////

function UltrasonicSensor (name, echoGpio, trigGpio){
	this.name = name;
	this.echo = new Gpio(echoGpio, {mode: Gpio.INPUT, alert: true});
	this.trigger = new Gpio(trigGpio, {mode: Gpio.OUTPUT});
	this.distance = 0;
}

UltrasonicSensor.prototype.setDistance = function (distance){
	if (distance < 0 || distance > 200) {
		distance = 0;
	}
	this.distance = (this.distance + distance) / 2; //Perform an average between the precedent value and the new one.
}

UltrasonicSensor.prototype.measureDistanceOnce = function (){
	var sensor = this;
	sensor.trigger.digitalWrite(0); // Make sure trigger is low
	var startTick;
	var distance;
	// The number of microseconds it takes sound to travel 1cm at 20 degrees celcius
	var MICROSECDONDS_PER_CM = 1e6/34321;

	sensor.trigger.trigger(10, 1); // Set trigger high for 10 microseconds

	function alertHandler(level, tick) {
		var endTick,
		diff;

		if (level == 1) {
			startTick = tick;
		} else {
			endTick = tick;
			diff = (endTick >> 0) - (startTick >> 0); // Unsigned 32 bit arithmetic
			distance = diff / 2 / MICROSECDONDS_PER_CM;
			sensor.setDistance(distance);
			console.log(sensor.name, ": " , sensor.distance);
			sensor.echo.removeListener('alert', alertHandler);
		}
	}
  	sensor.echo.on('alert', alertHandler);
}

module.exports.UltrasonicSensor = UltrasonicSensor;

////////////////////////////////////////////////////////////////


function SharpIRSensor(name, pin){
	this.name = name;
	this.pin = pin;
	this.distance = 0;
}

SharpIRSensor.prototype.setDistance = function (distance){
	if (distance < 0) {
		distance = 0;
	} else if (distance > 30) {
		distance = 35;
	}
	this.distance = (this.distance + distance) / 2; //Perform an average between the precedent value and the new one.
}

SharpIRSensor.prototype.measureDistanceOnce = function (){
	var sensor = this;
	var tempSensor = mcpadc.open(sensor.pin, function (err) {
		if (err) throw err;
	  
		tempSensor.read(function (err, reading) {
			if (err) throw err;
	  		var  volts = reading.value; 
			var distance = 13 / (volts*3.8);
			sensor.setDistance(distance);
			console.log(sensor.name, ": " , sensor.distance);
		  });
	  });
}

module.exports.SharpIRSensor = SharpIRSensor;

////////////////////////////////////////////////////////////////

