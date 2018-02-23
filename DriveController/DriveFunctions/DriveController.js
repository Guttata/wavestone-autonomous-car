module.exports.Move = function () {
   var rpio = require('rpio');
   rpio.open(7, rpio.OUTPUT, rpio.LOW);

         rpio.write(7, rpio.HIGH);
}


module.exports.Stop = function () {
   var rpio = require('rpio');
   rpio.open(7, rpio.OUTPUT, rpio.LOW);

   rpio.write(7, rpio.LOW);
}

