var constants = require("./WavestoneCarConstants");
var rpio = require('rpio');
var Gpio = require('pigpio').Gpio;
var mcpadc = require('mcp-spi-adc');
var mpu9250 = require('mpu9250');
var awsIot = require('aws-iot-device-sdk');
var isOnline = require('is-online');


var options = {
	gpiomem: false,
};

rpio.init(options);


function WavestoneCar () {
	//Move Information
	this.currentMoveMutex = null;
	this.currentDirection = "";
	this.speed = 0; // meter per second
	this.totalDistance = 0; //meter
	this.totalTicks = 0;
	this.autoPilotOn = false;
	this.ultraSoundReflexion = false;
		
	//Motor engine instanciation
	this.LeftMotorEngine = new MotorEngine(constants.LEFT_MOTOR_ENGINE_DIR_PIN, constants.LEFT_MOTOR_ENGINE_PWM_PIN);
	this.RightMotorEngine = new MotorEngine(constants.RIGHT_MOTOR_ENGINE_DIR_PIN, constants.RIGHT_MOTOR_ENGINE_PWM_PIN);
	
	
	//Encoder instanciation
	this.RightEncoder = new Encoder ("RIGHT ENCODER", constants.RIGHT_ENCODER_PINA, constants.RIGHT_ENCODER_PINB);
	this.LeftEncoder = new Encoder ("LEFT ENCODER", constants.LEFT_ENCODER_PINA, constants.LEFT_ENCODER_PINB);
	
	//Ultrason sensor instanciation
	this.FrontUltrasonicSensor = new UltrasonicSensor ("US FRONT SENSOR", constants.FRONT_ULTRASONIC_SENSOR_ECHO_GPIO, constants.FRONT_ULTRASONIC_SENSOR_TRIG_GPIO);
	this.FrontRightUltrasonicSensor = new UltrasonicSensor ("US FRONT RIGHT SENSOR", constants.FRONT_RIGHT_ULTRASONIC_SENSOR_ECHO_GPIO, constants.FRONT_RIGHT_ULTRASONIC_SENSOR_TRIG_GPIO);
	this.FrontLeftUltrasonicSensor = new UltrasonicSensor ("US FRONT LEFT SENSOR", constants.FRONT_LEFT_ULTRASONIC_SENSOR_ECHO_GPIO, constants.FRONT_LEFT_ULTRASONIC_SENSOR_TRIG_GPIO);
	this.BackUltrasonicSensor = new UltrasonicSensor ("US BACK SENSOR", constants.BACK_ULTRASONIC_SENSOR_ECHO_GPIO, constants.BACK_ULTRASONIC_SENSOR_TRIG_GPIO);

	//Shartp IR Sensor instanciation
	this.RightSharpIRSensor = new SharpIRSensor("IR RIGHT SIDE", constants.RIGHT_IR_SENSOR_PIN);
	this.LeftSharpIRSensor = new SharpIRSensor("IR LEFT SIDE", constants.LEFT_IR_SENSOR_PIN);

	//Accelerometer
	this.Accelerometer = new Accelerometer();
	
	//AWS connexion
	this.AWS = null;
	this.connectToAWS();
	
	//DEBUG variable
	this.testCM = null;
	this.testEncoder = null;
}

WavestoneCar.prototype.connectToAWS = function () {
	var car = this;
	
	isOnline().then(online => {
		console.log("Connected to Internet");
				
		//AWS connection
		car.AWS = awsIot.device({
			keyPath: "../Certificate/AWS/b3f40a045c-private.pem.key",
			certPath: "../Certificate/AWS/b3f40a045c-certificate.pem.crt",
			caPath: "../Certificate/AWS/CA.pem",
			clientId: "meetech-autonomous-car",
			host: "a2dzov8l2fnckl.iot.eu-west-2.amazonaws.com"
		 });
		
		car.AWS.on('connect', function() {
			console.log('Connected to AWS');
			//Inform AWS that the vehicule is UP
			car.AWS.publish('carStatus', JSON.stringify({car_status: 1}));
			car.AWS.subscribe('Vehicle/Order');
		});

		this.AWSOrderListener();

	});
}

WavestoneCar.prototype.AWSOrderListener = function ()
{
	car = this;

	isOnline().then(online => {
		car.AWS.on ('message', function(topic, payload) {
			console.log('message', topic, payload.toString());
			var messageID = JSON.parse(payload).id;
			console.log ("Message ID : ", messageID);
			car.AWS.publish('ACK_topic', JSON.stringify({ACK: messageID}));
		});
	});
}

WavestoneCar.prototype.isNewDirection = function (direction, pwmSpeed) {
	//if (this.currentDirection == direction && pwmSpeed == Math.max(this.RightMotorEngine.pwmSpeed, this.LeftMotorEngine.pwmSpeed)) {
	if (this.currentDirection == direction) {
		return false;
	}

	this.currentDirection = direction;
	this.LeftEncoder.nbTicks = 0;
	this.RightEncoder.nbTicks = 0;
	return true;
}

WavestoneCar.prototype.moveUpCM = function (distanceInCM, pwmSpeed){
	var ticks = this.LeftEncoder.convertDistanceToTicks(distanceInCM/100);
	console.log("ticks objective", ticks);
	var car = this;

	car.currentMoveMutex = setInterval(function(){
		if (car.LeftEncoder.nbTicks >= ticks || car.RightEncoder.nbTicks >= ticks) {
			clearInterval(car.currentMoveMutex);
			car.stop();
		}
		else {
			car.moveUp(pwmSpeed);
		}
	}, 1);
}

WavestoneCar.prototype.moveUp = function (pwmSpeed) {
	if (this.isNewDirection("MOVE UP", pwmSpeed)) {
		var pwmSpeed = 255;
		this.LeftMotorEngine.moveForward(pwmSpeed);
		this.RightMotorEngine.moveForward(pwmSpeed);
		console.log('MOVE UP');
	}
}

WavestoneCar.prototype.moveDownCM = function (distanceInCM, pwmSpeed){
	var ticks = this.LeftEncoder.convertDistanceToTicks(distanceInCM/100);
	var car = this;

	car.currentMoveMutex = setInterval(function(){
		if (car.LeftEncoder.nbTicks >= ticks || car.RightEncoder.nbTicks >= ticks) {
			clearInterval(car.currentMoveMutex);
			car.stop();
		}
		else {
			car.moveDown(pwmSpeed);
		}
	}, 1);
}

WavestoneCar.prototype.moveDown = function (pwmSpeed) {
	if (this.isNewDirection("MOVE DOWN", pwmSpeed)) {
		var pwmSpeed = 255;
		this.LeftMotorEngine.moveBackward(pwmSpeed);
		this.RightMotorEngine.moveBackward(pwmSpeed);
		console.log('MOVE DOWN'); 
	}
}

WavestoneCar.prototype.rotateRightDegree = function (degree, pwmSpeed){
	var ticks = this.LeftEncoder.convertDistanceToTicks();
	var startDegree = this.Accelerometer.values[6];
	var endDegree = startDegree + degree;
	var car = this;

	car.currentMoveMutex = setInterval(function(){
		if (car.Accelerometer.values[9] != endDegree) {
			clearInterval(car.currentMoveMutex);
			car.stop();
		}
		else {
			car.rotateRight(pwmSpeed);
		}
	}, 1);
}

WavestoneCar.prototype.rotateRight = function (pwmSpeed) {
	if (this.isNewDirection("ROTATE RIGHT", pwmSpeed)) {
		var pwmSpeed = 255;
		this.LeftMotorEngine.moveForward(pwmSpeed);
		this.RightMotorEngine.moveBackward(pwmSpeed);
		console.log('ROTATE RIGHT');
	}
}

WavestoneCar.prototype.rotateRightDegree = function (degree, pwmSpeed){
	var ticks = this.LeftEncoder.convertDistanceToTicks();
	var startDegree = this.Accelerometer.values[6];
	var endDegree = startDegree + degree;
	var car = this;

	car.currentMoveMutex = setInterval(function(){
		if (car.Accelerometer.values[9] != endDegree) {
			clearInterval(car.currentMoveMutex);
			car.stop();
		}
		else {
			car.rotateLeft(pwmSpeed);
		}
	}, 1);
}

WavestoneCar.prototype.rotateLeft = function (pwmSpeed) {
	if (this.isNewDirection("ROTATE LEFT", pwmSpeed)) {
		var pwmSpeed = 255;
		this.LeftMotorEngine.moveBackward(pwmSpeed);
		this.RightMotorEngine.moveForward(pwmSpeed);
		console.log('ROTATE LEFT'); 
	}
}

WavestoneCar.prototype.moveUpLeft = function (pwmSpeed) {
	if (this.isNewDirection("MOVE UP LEFT", pwmSpeed)) {
		var pwmSpeed = 255;
		this.LeftMotorEngine.moveForward(pwmSpeed/5);
		this.RightMotorEngine.moveForward(pwmSpeed);
		console.log('MOVE UP LEFT');
	}
}

WavestoneCar.prototype.moveUpRight = function (pwmSpeed) {
	if (this.isNewDirection("MOVE UP RIGHT", pwmSpeed)) {
		var pwmSpeed = 255;
		this.LeftMotorEngine.moveForward(pwmSpeed);
		this.RightMotorEngine.moveForward(pwmSpeed/5);
		console.log('MOVE UP RIGHT'); 
	}
}

WavestoneCar.prototype.moveDownLeft = function (pwmSpeed) {
	if (this.isNewDirection("MOVE DOWN LEFT", pwmSpeed)) {
		var pwmSpeed = 255;
		this.LeftMotorEngine.moveBackward(pwmSpeed/5);
		this.RightMotorEngine.moveBackward(pwmSpeed);
		console.log('MOVE DOWN LEFT');
	}
}

WavestoneCar.prototype.moveDownRight = function (pwmSpeed) {
	if (this.isNewDirection("MOVE DOWN RIGHT", pwmSpeed)) {
		var pwmSpeed = 255;
		this.LeftMotorEngine.moveBackward(pwmSpeed);
		this.RightMotorEngine.moveBackward(pwmSpeed/5);
		console.log('MOVE DOWN RIGHT');
	}
}

WavestoneCar.prototype.stop = function () {
	if (this.isNewDirection("STOP", 0)) {
		this.RightMotorEngine.stop();
		this.LeftMotorEngine.stop();
		console.log('STOP fonction STOP');
	}
};

WavestoneCar.prototype.measureUltraSonicDistance = function () {
	this.FrontUltrasonicSensor.measureDistanceOnce();
	this.FrontRightUltrasonicSensor.measureDistanceOnce();
	this.FrontLeftUltrasonicSensor.measureDistanceOnce();
	this.BackUltrasonicSensor.measureDistanceOnce();
}

WavestoneCar.prototype.measureIRDistance = function () {
	//SharpIR sensor
	this.RightSharpIRSensor.measureDistanceOnce();
	this.LeftSharpIRSensor.measureDistanceOnce();
}

WavestoneCar.prototype.measureAccelerometer = function () {
	//Accelerometer
	//this.Accelerometer.measureOnceWithKalimantan();
	this.Accelerometer.measureOnce();
	
}


WavestoneCar.prototype.measureAllDistances = function () {
	this.measureUltraSonicDistance();
	this.measureIRDistance();
}

WavestoneCar.prototype.measureAll = function () {
	this.measureUltraSonicDistance();
	this.measureIRDistance();
	this.measureAccelerometer();
}


WavestoneCar.prototype.isFrontObstacle = function(){
	var frontDistance = this.FrontUltrasonicSensor.distance;
	
	if (frontDistance < 70) //Appart
		return true;
	else if (this.isFrontRightObstacle())
		return true;
	else if (this.isFrontLeftObstacle())
		return true;

	return false;
}

WavestoneCar.prototype.isFrontRightObstacle = function(){
	var frontRightDistance = this.FrontRightUltrasonicSensor.distance;
	
	if (frontRightDistance < 50) //Appart
		return true;
	return false;
}

WavestoneCar.prototype.isFrontLeftObstacle = function(){
	var frontLeftDistance = this.FrontLeftUltrasonicSensor.distance;
	
	if (frontLeftDistance < 50) //Appart
		return true;
	return false;
}

WavestoneCar.prototype.isLeftObstacle = function(){
	var leftDistance = this.LeftSharpIRSensor.distance;
	var numberOfDecreasingMeasure = this.LeftSharpIRSensor.numberOfDecreasingMeasure;
	
	if (numberOfDecreasingMeasure >= 5 && leftDistance < 26) 
		return true;
	return false;
}

WavestoneCar.prototype.isRightObstacle = function(){
	var rightDistance = this.RightSharpIRSensor.distance;
	var numberOfDecreasingMeasure = this.RightSharpIRSensor.numberOfDecreasingMeasure;
	
	if (numberOfDecreasingMeasure >= 5 && rightDistance < 26) 
		return true;
	return false;
}

WavestoneCar.prototype.isBackObstacle = function(){
	var backDistance = this.BackUltrasonicSensor.distance;
	
	if (backDistance < 10)//Appart
		return true;
	return false;
}

WavestoneCar.prototype.moveUpRightStrategy = function(){
	var frontDistance = this.FrontUltrasonicSensor.distance;
	var frontRightDistance = this.FrontRightUltrasonicSensor.distance;
	var frontLeftDistance = this.FrontLeftUltrasonicSensor.distance;

	if (frontRightDistance < 50) { //Appart
		//If front right distance not enough to move up
		return this.rotateStrategy();
	} else if (frontDistance > 25 && frontLeftDistance > 25) { //Appart
		//If front right distance is enough and enough front and front left space then try to move UP
		return "MOVE UP RIGHT";
	} else {
		// If we are in a front obstacle
		return this.rotateStrategy();
	}
}

WavestoneCar.prototype.moveUpLeftStrategy = function(){
	var frontDistance = this.FrontUltrasonicSensor.distance;
	var frontRightDistance = this.FrontRightUltrasonicSensor.distance;
	var frontLeftDistance = this.FrontLeftUltrasonicSensor.distance;

	if (frontLeftDistance < 50) { //Appart
		//If front left distance not enough to move up
		return this.rotateStrategy();
	} else if (frontDistance > 25 && frontRightDistance > 25) { //Appart
		//If front left distance is enough and enough front and front right space then try to move UP
		return "MOVE UP LEFT";
	} else {
		// If we are in a front obstacle
		return this.rotateStrategy();
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
		if (frontRightDistance > 20 && frontRightDistance > frontLeftDistance) { //Appart
			return "MOVE DOWN LEFT"
		} else if (frontLeftDistance > 20 && frontRightDistance < frontLeftDistance) {//Appart
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

WavestoneCar.prototype.moreSpaceRightOrLeft = function() {
	var leftDistance = this.LeftSharpIRSensor.distance;
	var rightDistance = this.RightSharpIRSensor.distance;

	if (leftDistance > 22 && leftDistance > rightDistance) {
		return "LEFT";
	}
	else if (rightDistance > 22) {
		return "RIGHT";
	}
	return "NONE";
}

WavestoneCar.prototype.rotateStrategy = function(){
	var frontDistance = this.FrontUltrasonicSensor.distance;
	var frontRightDistance = this.FrontRightUltrasonicSensor.distance;
	var frontLeftDistance = this.FrontLeftUltrasonicSensor.distance;
	var backDistance = this.BackUltrasonicSensor.distance;
	var leftDistance = this.LeftSharpIRSensor.distance;
	var rightDistance = this.RightSharpIRSensor.distance;

	if (frontDistance > 5 && frontRightDistance > 5 && frontLeftDistance > 5 && backDistance > 5) {//Appart
		if ((this.currentDirection == "ROTATE RIGHT" || this.currentDirection == "MOVE UP RIGHT" || this.currentDirection == "MOVE DOWN LEFT") && this.moreSpaceRightOrLeft() == "RIGHT") {
			return "ROTATE RIGHT";
		} else if ((this.currentDirection == "ROTATE LEFT" || this.currentDirection == "MOVE UP LEFT" || this.currentDirection == "MOVE DOWN RIGHT") && this.moreSpaceRightOrLeft() == "LEFT") {
			return "ROTATE LEFT";
		} else if (rightDistance > leftDistance) {
			return "ROTATE RIGHT";
		} else {
			return "ROTATE LEFT";
		}
	} else if (!this.isBackObstacle()){
		return this.backwardStrategy();
	} else {
		console.log("STOP ROTATE STRATEGY");
		return "STOP";
	}

}

WavestoneCar.prototype.notYetStarted = function (){
	var frontDistance = this.FrontUltrasonicSensor.distance;
	console.log("NOT YET STARTED" . frontDistance);
	var frontRightDistance = this.FrontRightUltrasonicSensor.distance;
	console.log("NOT YET STARTED" . frontDistance);
	var frontLeftDistance = this.FrontLeftUltrasonicSensor.distance;
	console.log("NOT YET STARTED" . frontDistance);
	var backDistance = this.BackUltrasonicSensor.distance;
	console.log("NOT YET STARTED" . frontDistance);
	
	if (frontDistance == -1 || frontRightDistance == -1 || frontLeftDistance == -1 || backDistance == -1){
		return true;
	}
	return false;
}

WavestoneCar.prototype.isNotStable = function () {
	if (!this.Accelerometer.isStable) {
		return true;
	}
	return false;
}

WavestoneCar.prototype.chooseDirection = function(){
	var frontDistance = this.FrontUltrasonicSensor.distance;
	var frontRightDistance = this.FrontRightUltrasonicSensor.distance;
	var frontLeftDistance = this.FrontLeftUltrasonicSensor.distance;
	var backDistance = this.BackUltrasonicSensor.distance;
	var leftDistance = this.LeftSharpIRSensor.distance;
	var rightDistance = this.RightSharpIRSensor.distance;

	
	console.log(this.FrontUltrasonicSensor.name, ": " , this.FrontUltrasonicSensor.distance);
	console.log(this.FrontRightUltrasonicSensor.name, ": " , this.FrontRightUltrasonicSensor.distance);
	console.log(this.FrontLeftUltrasonicSensor.name, ": " , this.FrontLeftUltrasonicSensor.distance);
	console.log(this.BackUltrasonicSensor.name, ": " , this.BackUltrasonicSensor.distance);
	console.log(this.LeftSharpIRSensor.name, ": " , this.LeftSharpIRSensor.distance);
	console.log(this.RightSharpIRSensor.name, ": " , this.RightSharpIRSensor.distance);

	
	if (leftDistance > 25 && rightDistance > 25) {
		this.ultraSoundReflexion = false;
	}
	
	//No front obstacle, move up
	if (!this.isFrontObstacle()) {
		//In case of ultrasound reflexion ==> no dectection of the fron obstacle
		if (!this.ultraSoundReflexion && (this.isRightObstacle() || this.isLeftObstacle())) {
			this.ultraSoundReflexion = true;
			return this.rotateStrategy();
		}
		return "MOVE UP";
	}
	//Front obstacle detected and we are to close to move up / move up right left / move up right
	else if (frontDistance < 20 || frontRightDistance < 20 || frontLeftDistance < 20) {
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
	var direction = "";
	
	if (this.notYetStarted()) {
		direction = "STOP";
		console.log("STOP NOT YET STARTED");
	}
	//If no current long move (rotate 360, move up 20cm, ...)
	else if (!this.onMoveMutex){
		direction = this.chooseDirection();
	}

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



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



function MotorEngine(dirPin, pwmPin){
	this.dirPin = dirPin;
	this.pwmPin = pwmPin;
	this.direction = 0; //0 is forward and 1 is backward
	this.pwmSpeed = 0; //from 0 to 255
}


MotorEngine.prototype.moveForward = function (pwmSpeed) {
	this.pwmSpeed = pwmSpeed;
	this.direction = 0;
	
	rpio.open(this.dirPin, rpio.OUTPUT);
	rpio.open(this.pwmPin, rpio.PWM, rpio.LOW);
	
	
	rpio.write(this.dirPin, rpio.HIGH);
	
	rpio.pwmSetClockDivider(constants.PWM_CLOCK_DIV);
	rpio.pwmSetRange(this.pwmPin, constants.PWM_RANGE);
	rpio.pwmSetData(this.pwmPin, pwmSpeed);
		
};
	
MotorEngine.prototype.moveBackward = function (pwmSpeed) {
	this.pwmSpeed = pwmSpeed;
	this.direction = 1;
	
	rpio.open(this.dirPin, rpio.OUTPUT);
	rpio.open(this.pwmPin, rpio.PWM, rpio.LOW);	
	
	
	rpio.write(this.dirPin, rpio.LOW);
	
	rpio.pwmSetClockDivider(constants.PWM_CLOCK_DIV);
	rpio.pwmSetRange(this.pwmPin, constants.PWM_RANGE);
	rpio.pwmSetData(this.pwmPin, pwmSpeed); 
};

MotorEngine.prototype.stop = function () {
	this.pwmSpeed = 0;
	this.direction = 0;
	
	rpio.open(this.dirPin, rpio.OUTPUT);
	rpio.open(this.pwmPin, rpio.OUTPUT);	
	
	rpio.write(this.dirPin, rpio.LOW);
	rpio.write(this.pwmPin, rpio.LOW);
};


module.exports.MotorEngine = MotorEngine;



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function Encoder(name, pinA, pinB) {
	this.name = name;
	this.pinA = pinA
	this.pinB = pinB;
	this.nbTicks = 0;
	this.traveledDistance = 0; //distance in meter

	var encoder = this;

	rpio.open(pinA, rpio.INPUT);
	rpio.poll(pinA, function countTickPinA(pinA){
		encoder.nbTicks = encoder.nbTicks + 1; //CW
		//encoder.setTraveledDistance();
		} 
	);

	rpio.open(pinB, rpio.INPUT);
	rpio.poll(pinB, function countTickPinB(pinB){
		encoder.nbTicks = encoder.nbTicks + 1; //CW
		//encoder.setTraveledDistance();
	} );
}

/*
function Encoder(name, pinA, pinB) {
	this.name = name;
	this.pinA = pinA
	this.pinB = pinB;
	this.nbTicks = 0;
	this.traveledDistance = 0; //distance in meter

	var encoder = this;

	rpio.open(pinA, rpio.INPUT);
	rpio.poll(pinA, function countTickPinA(pinA){
		//Returns either 0 for LOW or 1 for HIGH
		var statePinA = rpio.read(pinA);
		var statePinB = rpio.read(encoder.pinB);
		
		// look for a low-to-high on channel A
		if (statePinA == 1){
			// check channel B to see which way encoder is turning
			if (statePinB == 0) {
				encoder.nbTicks = encoder.nbTicks + 1; //CW
			}
			else {
				encoder.nbTicks = encoder.nbTicks - 1; // CCW
			}
		}
		// must be a high-to-low edge on channel A
		else {
			// check channel B to see which way encoder is turning
			if (statePinB == 1) {
				encoder.nbTicks = encoder.nbTicks + 1; //CW
			}
			else {
				encoder.nbTicks = encoder.nbTicks - 1; //CCW
			}
		}
		//console.log(name, " ", encoder.nbTicks);
		encoder.setTraveledDistance();
		} 
	);

	rpio.open(pinB, rpio.INPUT);
	rpio.poll(pinB, function countTickPinB(pinB){
		//Returns either 0 for LOW or 1 for HIGH
		var statePinA = rpio.read(encoder.pinA);
		var statePinB = rpio.read(pinB);

		// look for a low-to-high on channel B
		if (statePinB == 1){
			// check channel A to see which way encoder is turning
			if (statePinA == 1) {
				encoder.nbTicks = encoder.nbTicks + 1; //CW
			}
			else {
				encoder.nbTicks = encoder.nbTicks - 1; //CCW
			}
		}
		// Look for a high-to-low on channel B
		else {
			// check channel B to see which way encoder is turning
			if (statePinA == 0) {
				encoder.nbTicks = encoder.nbTicks + 1; //CW
			}
			else {
				encoder.nbTicks = encoder.nbTicks - 1; //CCW
			}
		}
		//console.log(name, " ", encoder.nbTicks);
		encoder.setTraveledDistance();
		} );
}

*/

//Process the distance in meter
Encoder.prototype.setTraveledDistance = function (){
	//Rover 5 encoder performs 333 ticks per Wheel Turn (20cm)
	this.traveledDistance = (this.nbTicks * 0.2) / 333;
	//console.log("Traveled Distance: ", this.traveledDistance, "m");
}

//Param : distance in meter
Encoder.prototype.convertDistanceToTicks = function (distance){
	//Rover 5 encoder performs 333 ticks per Wheel Turn (20cm)
	return (distance * 333) / 0.2; 
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




function UltrasonicSensor (name, echoGpio, trigGpio){
	this.name = name;
	this.echo = new Gpio(echoGpio, {mode: Gpio.INPUT, alert: true});
	this.trigger = new Gpio(trigGpio, {mode: Gpio.OUTPUT});
	this.rawDistance = -1;
	this.distance = -1;
}

UltrasonicSensor.prototype.setDistance = function (distance){
	this.rawDistance = distance;
	if (distance < 0) {
		distance = 0;
	}
	else if (distance > 150) {
		distance = 100;
	}
	if (this.distance == -1) {
		this.distance = distance;
	}
	else {
		this.distance = (this.distance + distance) / 2; //Perform an average between the precedent value and the new one.
	}
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
			sensor.echo.removeListener('alert', alertHandler);
		}
	}
  	sensor.echo.on('alert', alertHandler);
}

module.exports.UltrasonicSensor = UltrasonicSensor;



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



function SharpIRSensor(name, pin){
	this.name = name;
	this.pin = pin;
	this.rawDistance = -1;
	this.distance = -1;
	this.numberOfDecreasingMeasure = 0;
}

SharpIRSensor.prototype.setDistance = function (distance){
	this.rawDistance = distance;
	if (distance < 0) {
		distance = 0;
	} else if (distance > 30) {
		distance = 35;
	}
	
	//If previous measure is greater than the new one
	if (this.distance > distance)
		this.numberOfDecreasingMeasure++;
	else	
		this.numberOfDecreasingMeasure = 0;

	if (this.distance == -1) {
		this.distance = distance;
	} else {
		this.distance = (this.distance + distance) / 2; //Perform an average between the precedent value and the new one.
	}
	
	
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
		  });
	  });
}

module.exports.SharpIRSensor = SharpIRSensor;



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



function Accelerometer () {
	this.sensor = new mpu9250({UpMagneto: true, DEBUG: false, GYRO_FS: 0, ACCEL_FS: 1});
	this.values = [];
	this.pitch = 0;
	this.roll = 0;
	this.yaw = 0;
	this.sensor.initialize();
	this.notStableCount = 0;
	this.isStable = true;
}

Accelerometer.prototype.isNotStable = function () {
	if (this.pitch >= 20 || this.pitch <= -20 || this.roll >= 20 || this.roll <= -20) {
		this.notStableCount = this.notStableCount + 1;
		if (this.notStableCount > 5) {
			this.isStable = false;
		}
	}
	else {
		this.notStableCount = 0;
		this.isStable = true;
	}
}

Accelerometer.prototype.measureOnce = function () {
	this.values = this.sensor.getMotion9();
	this.pitch = this.sensor.getPitch(this.values);
	this.roll = this.sensor.getRoll(this.values);
	this.yaw = this.sensor.getYaw(this.values);

	this.isNotStable();

	//console.log("values x : ", this.values[6]," -- y: ",this.values[7]," -- z ",this.values[8]);
	console.log("pitch: ", this.pitch);
	console.log("roll: ", this.roll);
}

Accelerometer.prototype.measureOnceWithKalimantan = function () {
	var timer = 0;
	var kalmanX = new this.sensor.Kalman_filter();
	var kalmanY = new this.sensor.Kalman_filter();

	this.measureOnce();
	kalmanX.setAngle(this.roll);
	kalmanY.setAngle(this.pitch);

	var micros = function() {
		return new Date().getTime();
	};

	var dt = 0;

	timer = micros();

	var interval;

	var kalAngleX = 0,
		kalAngleY = 0,
		kalAngleZ = 0,
		gyroXangle = this.roll,
		gyroYangle = this.pitch,
		gyroZangle = this.yaw,
		gyroXrate = 0,
		gyroYrate = 0,
		gyroZrate = 0,
		compAngleX = this.roll,
		compAngleY = this.pitch,
		compAngleZ = this.yaw;


	this.values = this.sensor.getMotion9();

	var dt = (micros() - timer) / 1000000;
	timer = micros();

	this.pitch = this.sensor.getPitch(this.values);
	this.roll = this.sensor.getRoll(this.values);
	this.yaw = this.sensor.getYaw(this.values);

	var gyroXrate = this.values[3] / 131.0;
	var gyroYrate = this.values[4] / 131.0;
	var gyroZrate = this.values[5] / 131.0;

	if ((this.roll < -90 && kalAngleX > 90) || (this.roll > 90 && kalAngleX < -90)) {
		kalmanX.setAngle(this.roll);
		compAngleX = this.roll;
		kalAngleX = this.roll;
		gyroXangle = this.roll;
	} else {
		kalAngleX = kalmanX.getAngle(this.roll, gyroXrate, dt);
	}

	if (Math.abs(kalAngleX) > 90) {
		gyroYrate = -gyroYrate;
	}
	kalAngleY = kalmanY.getAngle(this.pitch, gyroYrate, dt);

	gyroXangle += gyroXrate * dt;
	gyroYangle += gyroYrate * dt;
	compAngleX = 0.93 * (compAngleX + gyroXrate * dt) + 0.07 * this.roll;
	compAngleY = 0.93 * (compAngleY + gyroYrate * dt) + 0.07 * this.pitch;

	if (gyroXangle < -180 || gyroXangle > 180) gyroXangle = kalAngleX;
	if (gyroYangle < -180 || gyroYangle > 180) gyroYangle = kalAngleY;

	this.pitch = (this.pitch + compAngleY) / 2;
	this.roll = (this.roll + compAngleX) / 2;

	this.isNotStable();
	
	console.log("pitch: ", this.pitch);
	console.log("roll: ", this.roll);
}

module.exports.Accelerometer = Accelerometer;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function LIDAR () {
	this.serial = new SerialPort('/dev/ttyS0', {
		baudrate: 115200,
		parser: SerialPort.parsers.byteDelimiter([0xfa])
	  });
}

LIDAR.prototype.measure = function () {
	serial.on('open', function (err) {
		console.log('serial is open', err)
	  });
	   
	  serial.on('data', function (data) {
		this.data = new Uint8Array([0xFA].concat(data.slice(0, 21)));
	   
		try {
		  let lp = new LidarPacket(this.data);
		  lp.measures
			.filter((m) => !m.invalid)
			.forEach((m) => console.log(m.index + 'Â° -> ' + m.distance + 'mm'));
		} catch (e) {
		  console.error(e);
		}
	  })
}