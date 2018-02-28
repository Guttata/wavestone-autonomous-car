var constants = require("./WavestoneCarConstants");
var rpio = require('rpio');
var statistics = require('math-statistics');
var usonic = require('mmm-usonic');

var options = {
	gpiomem: false,
};

rpio.init(options);


function WavestoneCar () {
	//Motor engine instanciation
	this.LeftMotorEngine = new MotorEngine(constants.LEFT_MOTOR_ENGINE_DIR_PIN, constants.LEFT_MOTOR_ENGINE_PWM_PIN);
	this.RightMotorEngine = new MotorEngine(constants.RIGHT_MOTOR_ENGINE_DIR_PIN, constants.RIGHT_MOTOR_ENGINE_PWM_PIN);
	
	
	//Ultrason sensor instanciation
	this.FrontUltrasonicSensor = new UltrasonicSensor (constants.FRONT_ULTRASONIC_SENSOR_ECHO_PIN, constants.FRONT_ULTRASONIC_SENSOR_TRIG_PIN, constants.FRONT_ULTRASONIC_SENSOR_TIMEOUT, constants.FRONT_ULTRASONIC_SENSOR_DELAY, constants.FRONT_ULTRASONIC_SENSOR_RATE);
	//this.FrontUltrasonicSensor.init();
	
	this.FrontRightUltrasonicSensor = new UltrasonicSensor (constants.FRONT_RIGHT_ULTRASONIC_SENSOR_ECHO_PIN, constants.FRONT_RIGHT_ULTRASONIC_SENSOR_TRIG_PIN, constants.FRONT_RIGHT_ULTRASONIC_SENSOR_TIMEOUT, constants.FRONT_RIGHT_ULTRASONIC_SENSOR_DELAY, constants.FRONT_RIGHT_ULTRASONIC_SENSOR_RATE);
	this.FrontLeftUltrasonicSensor = new UltrasonicSensor (constants.FRONT_LEFT_ULTRASONIC_SENSOR_ECHO_PIN, constants.FRONT_LEFT_ULTRASONIC_SENSOR_TRIG_PIN, constants.FRONT_LEFT_ULTRASONIC_SENSOR_TIMEOUT, constants.FRONT_LEFT_ULTRASONIC_SENSOR_DELAY, constants.FRONT_LEFT_ULTRASONIC_SENSOR_RATE);
	this.BackUltrasonicSensor = new UltrasonicSensor (constants.BACK_ULTRASONIC_SENSOR_ECHO_PIN, constants.BACK_ULTRASONIC_SENSOR_TRIG_PIN, constants.BACK_ULTRASONIC_SENSOR_TIMEOUT, constants.BACK_ULTRASONIC_SENSOR_DELAY, constants.BACK_ULTRASONIC_SENSOR_RATE);
}

module.exports.WavestoneCar = WavestoneCar;

WavestoneCar.prototype.moveUp = function (speed) {
	var speed = 255;
	this.LeftMotorEngine.moveForward(speed);
	this.RightMotorEngine.moveForward(speed);
	console.log('MOVE UP'); 
}

WavestoneCar.prototype.moveDown = function (speed) {
	var speed = 255;
	this.LeftMotorEngine.moveBackward(speed);
	this.RightMotorEngine.moveBackward(speed);
	console.log('MOVE DOWN'); 
}


WavestoneCar.prototype.moveRight = function (speed) {
	var speed = 255;
	this.LeftMotorEngine.moveBackward(speed);
	this.RightMotorEngine.moveForward(speed);
	console.log('MOVE RIGHT'); 
}


WavestoneCar.prototype.moveLeft = function (speed) {
	var speed = 255;
	this.LeftMotorEngine.moveForward(speed);
	this.RightMotorEngine.moveBackward(speed);
	console.log('MOVE LEFT'); 
}


WavestoneCar.prototype.moveUpLeft = function (speed) {
	var speed = 255;
	this.LeftMotorEngine.moveForward(speed);
	this.RightMotorEngine.moveForward(speed/5);
	console.log('MOVE UP LEFT'); 
}


WavestoneCar.prototype.moveUpRight = function (speed) {
	var speed = 255;
	this.LeftMotorEngine.moveForward(speed/5);
	this.RightMotorEngine.moveForward(speed);
	console.log('MOVE UP RIGHT'); 
}


WavestoneCar.prototype.moveDownLeft = function (speed) {
	var speed = 255;
	this.LeftMotorEngine.moveBackward(speed);
	this.RightMotorEngine.moveBackward(speed/5);
	console.log('MOVE DOWN LEFT'); 
}


WavestoneCar.prototype.moveDownRight = function (speed) {
	var speed = 255;
	this.LeftMotorEngine.moveBackward(speed/5);
	this.RightMotorEngine.moveBackward(speed);
	console.log('MOVE DOWN RIGHT'); 
}

WavestoneCar.prototype.stop = function () {
	this.RightMotorEngine.stop();
	this.LeftMotorEngine.stop();
	console.log('STOP');
};


///////////////////////////////////////////////////////////////////


function MotorEngine(dirPin, pwmPin){
	this.dirPin = dirPin;
	this.pwmPin = pwmPin;
}


MotorEngine.prototype.moveForward = function (speed) {
	//console.log("PWM pin: ", this.pwmPin);
	
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

function UltrasonicSensor (echoPin, trigPin, timeout, delay, rate){
	this.echoPin = echoPin;
	this.trigPin = trigPin;
	this.timeout = timeout;
	this.delay = delay;
	this.rate = rate;
	this.distance = 0;
}


UltrasonicSensor.prototype.init = function (){
	console.log("Sensor echo pin", this.echoPin);
			console.log("Sensor trig pin", this.trigPin);
			console.log("Sensor timeout", this.timeout);
	usonic.init(function(error) {
		if (error) {
			console.log(error);
		}
		else {
			
			
			console.log("create sensor");
			var sensor = usonic.createSensor(18, 38, 1000);
			console.log("get distance");
			var distance = sensor();
			console.log("end of distance measure", distance);
		}
	})
	console.log("Exit init");
};

/*UltrasonicSensor.prototype.measureDistance = function (){
    	
			console.log("Sensor echo pin", this.echoPin);
			console.log("Sensor trig pin", this.trigPin);
			console.log("Sensor timeout", this.timeout);
			var sensor = usonic.createSensor(this.echoPin, this.trigPin, this.timeout);
			//console.log(config);
			var distances;
		 
				(function measure() {
					if (!distances || distances.length === this.rate) {
						if (distances) {
							print(distances);
						}
			 
						distances = [];
					}
			 
					setTimeout(function() {
						distances.push(sensor());
			 
						measure();
					}, this.delay);
				}());
			this.distance = statistics.median(distances);
		
};*/



/*UltrasonicSensor.prototype.measureDistance = function (){
    	
			console.log("Sensor echo pin", this.echoPin);
			console.log("Sensor trig pin", this.trigPin);
			console.log("Sensor timeout", this.timeout);
			
			
			var sensor = usonic.createSensor(this.echoPin, this.trigPin, this.timeout);
			//console.log(config);
			this.distance = sensor();
			console.log("end of distance measure");
};*/


module.exports.UltrasonicSensor = UltrasonicSensor;

////////////////////////////////////////////////////////////////


