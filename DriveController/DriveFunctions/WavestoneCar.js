var constants = require("./WavestoneCarConstants");
var rpio = require('rpio');
var Gpio = require('pigpio').Gpio;


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

	this.autoPilotOn = false;
}


module.exports.WavestoneCar = WavestoneCar;

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

WavestoneCar.prototype.moveRight = function (speed) {
	if (this.currentDirection != "MOVE RIGHT") {
		this.currentDirection = "MOVE RIGHT";
		var speed = 255;
		this.LeftMotorEngine.moveBackward(speed);
		this.RightMotorEngine.moveForward(speed);
		console.log('MOVE RIGHT');
	}
}

WavestoneCar.prototype.moveLeft = function (speed) {
	if (this.currentDirection != "MOVE LEFT") {
		this.currentDirection = "MOVE LEFT";
		var speed = 255;
		this.LeftMotorEngine.moveForward(speed);
		this.RightMotorEngine.moveBackward(speed);
		console.log('MOVE LEFT'); 
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

WavestoneCar.prototype.measureDistanceOnce =  function (sensor){
	//console.log("------- BEGIN MEASURE DISTANCES -------");
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
			sensor.distance = diff / 2 / MICROSECDONDS_PER_CM;
			//console.log(sensor.name, ": " , sensor.distance);
			sensor.echo.removeListener('alert', alertHandler);
		}
	}
  	sensor.echo.on('alert', alertHandler);
	//console.log("------- END MEASURE DISTANCES -------");
}

WavestoneCar.prototype.measureDistances = function () {
	this.measureDistanceOnce(this.FrontUltrasonicSensor);
	this.measureDistanceOnce(this.FrontRightUltrasonicSensor);
	this.measureDistanceOnce(this.FrontLeftUltrasonicSensor);
	this.measureDistanceOnce(this.BackUltrasonicSensor);
}

WavestoneCar.prototype.isFrontObstacle = function(){
	var frontDistance = this.FrontUltrasonicSensor.distance;
	
	if (frontDistance < constants.FRONT_ULTRASONIC_SENSOR_OBSTACLE_LIMIT)
		return true;
	else if (this.isFrontRightObstacle())
		return true;
	else if (this.isFrontLeftObstacle())
		return true;

	return false;
}

WavestoneCar.prototype.isFrontRightObstacle = function(){
	var frontRightDistance = this.FrontRightUltrasonicSensor.distance;
	
	if (frontRightDistance < constants.FRONT_RIGHT_ULTRASONIC_SENSOR_OBSTACLE_LIMIT)
		return true;
	return false;
}

WavestoneCar.prototype.isFrontLeftObstacle = function(){
	var frontLeftDistance = this.FrontLeftUltrasonicSensor.distance;
	
	if (frontLeftDistance < constants.FRONT_LEFT_ULTRASONIC_SENSOR_OBSTACLE_LIMIT)
		return true;
	return false;
}

WavestoneCar.prototype.isBackObstacle = function(){
	var backDistance = this.BackUltrasonicSensor.distance;
	
	if (backDistance < constants.BACK_ULTRASONIC_SENSOR_OBSTACLE_LIMIT)
		return true;
	return false;
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

	//No front obstacle
	if (!this.isFrontObstacle()) {
		return "MOVE UP";
	}
	//Front obstacle detected
	else if (frontRightDistance < 10 || frontLeftDistance < 10) {
		if (!this.isBackObstacle()) {	
			if (frontRightDistance > frontLeftDistance) {
				return "MOVE DOWN LEFT"
			} else if (frontRightDistance < frontLeftDistance) {
				return "MOVE DOWN RIGHT"
			}
			return "MOVE DOWN";
		}
	}
	else if (frontRightDistance > frontLeftDistance) {
		if (frontRightDistance < constants.FRONT_RIGHT_ULTRASONIC_SENSOR_OBSTACLE_LIMIT) {
			return "MOVE RIGHT";
		} else if (frontDistance > 30 && frontLeftDistance > 30) {
			return "MOVE UP RIGHT";
		} else {
			return "MOVE DOWN";
		}
	} else {
		if (frontLeftDistance < constants.FRONT_LEFT_ULTRASONIC_SENSOR_OBSTACLE_LIMIT) {
			return "MOVE LEFT";
		} else if (frontDistance > 30 && frontRightDistance > 30) {
			return "MOVE UP LEFT";
		} else {
			return "MOVE DOWN";
		}
	}
}


/*WavestoneCar.prototype.chooseDirection = function(){
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
	else {
		//If front right obstacle and clear view front and front left
		if (this.isFrontRightObstacle() && !this.isFrontObstacle() && !this.isFrontLeftObstacle()) {
			return "MOVE UP LEFT";
		} 
		//If front left obstacle and clear view front and front right
		else if (this.isFrontLeftObstacle() && !this.isFrontObstacle() && !this.isFrontRightObstacle()) {
			return "MOVE UP RIGHT";
		}
		//If enough space to rotate
		else if (frontDistance > 10 && frontRightDistance > 10 && frontLeftDistance > 10) {
			return "MOVE RIGHT";	
		}
		else if (backDistance > 10) {
			return "MOVE DOWN";
		}
	}
}
*/

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
		case "MOVE RIGHT" :
			this.moveRight();
			break;
		case "MOVE LEFT" :
			this.moveLeft();
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
	}
		console.log("------------ END AUTO PILOT FUNCTION ------------");
}

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

module.exports.UltrasonicSensor = UltrasonicSensor;

////////////////////////////////////////////////////////////////


