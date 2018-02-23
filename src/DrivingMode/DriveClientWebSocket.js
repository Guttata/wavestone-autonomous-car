import openSocket from 'socket.io-client';
const  socket = openSocket('http://10.3.141.1:8000');

function MoveJoystick(degree, speed) {
    socket.emit('moveJoystick', {degree: degree, speed: speed});
}

function MoveAccelerometer(x, y) {
    socket.emit('moveAccelerometer', {x: x, y: y});
}

function Stop(x, y) {
    socket.emit('stop');
}

export { MoveJoystick };
export { MoveAccelerometer };
export { Stop };
