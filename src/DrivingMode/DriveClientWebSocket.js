import openSocket from 'socket.io-client';
const  socket = openSocket('http://10.3.141.1:8000');
var forwardDistance = 20;

function MoveJoystick(degree, speed) {
    
	var driveOrder = "";
	
	if ((degree >= 0 && degree <= 22.5) || (degree > 337.5 && degree <= 360)){
		//Rotate RIGHT
		driveOrder = "ROTATE RIGHT";		
	} 
	else if (degree > 22.5 && degree <= 67.5) {
		//Move UP RIGHT
		driveOrder = "MOVE UP RIGHT";
	} else if (degree > 67.5 && degree <= 112.5) {
		//Move UP
		driveOrder = "MOVE UP"
	} else if (degree > 112.5 && degree <= 157.5) {
		//Move UP LEFT
		driveOrder = "MOVE UP LEFT";
	} else if (degree > 157.5 && degree <= 202.5) {
		// Rotate LEFT
		driveOrder = "ROTATE LEFT";
	} else if (degree > 202.5 && degree <= 247.5) {
		// Move DOWN LEFT 
		driveOrder = "MOVE DOWN LEFT";
	} else if (degree > 247.5 && degree <= 292.5) {
		// Move DOWN
		driveOrder = "MOVE DOWN";
	} else if (degree > 292.5 && degree <= 337.5) {
		//Move DOWN RIGHT
		driveOrder = "MOVE DOWN RIGHT";
	}
	
	socket.emit(driveOrder, 5.1 * speed);
	console.log('Joystick :', driveOrder);
	socket.on('forward distance', function(distance) {forwardDistance = distance;});
	return forwardDistance;
}

function MoveAccelerometer(x, y, counter) {
	var driveOrder = "";
	if (counter < 50)
		return counter + 1;
	
	if (x > -2 && x < 2 && y > -2 && y < 2) {
		//STOP
			driveOrder = "STOP";
		}else if (x > 2 && y > - 2 && y < 2){
			//Rotate RIGHT
			driveOrder = "ROTATE RIGHT";
		} else if (x > 2 && y > 2) {
			//Move UP RIGHT
			driveOrder = "MOVE UP RIGHT";		
		} else if (x > -2 && x < 2 && y > 2) {
			//Move UP
			driveOrder = "MOVE UP";		
		} else if (x < -2 && y > 2) {
			//Move UP LEFT
			driveOrder = "MOVE UP LEFT";		
		} else if (x < -2 && y > -2 && y < 2) {
			// Rotate LEFT
			driveOrder = "ROTATE LEFT";		
		} else if (x < -2 && y < -2) {
			// Move DOWN LEFT 
			driveOrder = "MOVE DOWN LEFT";		
		} else if (x > -2 && x < 2 && y < -2) {
			// Move DOWN
			driveOrder = "MOVE DOWN";		
		} else if (x > 2 && y < -2) {
			//Move DOWN RIGHT
			driveOrder = "MOVE DOWN RIGHT";		
		}
		var speed = x;
		socket.emit(driveOrder, speed);
		console.log('Accelerometer :', driveOrder);	
		return 0;
}

function Stop() {
    socket.emit('STOP');
}

function AutoPilot() {
    socket.emit('AUTO PILOT');
}


export { MoveJoystick };
export { MoveAccelerometer };
export { Stop };
export { AutoPilot };
export { forwardDistance };
