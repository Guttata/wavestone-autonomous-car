function define(name, value) {
    Object.defineProperty(exports, name, {
        value:      value,
        enumerable: true
    });
}


//
define("PWM_RANGE_JOYSTICK", 50); // Set the maximum pulse width
define("PWM_RANGE_ACCELEROMETER", 9);
define("PWM_CLOCK_DIV", 64); // Set PWM refresh rate to 300kHz


// Right Motor Engine
define("RIGHT_MOTOR_ENGINE_DIR_PIN", 13);
define("RIGHT_MOTOR_ENGINE_PWM_PIN", 32);
define("RIGHT_MOTOR_ENGINE_CURRENT_PIN", 19);

// Left Motor Engine
define("LEFT_MOTOR_ENGINE_DIR_PIN", 23);
define("LEFT_MOTOR_ENGINE_PWM_PIN", 33);
define("LEFT_MOTOR_ENGINE_CURRENT_PIN", 21);

//Front UltraSonic Sensor
define("FRONT_ULTRASONIC_SENSOR_ECHO_PIN", 12);
define("FRONT_ULTRASONIC_SENSOR_TRIG_PIN", 10);
define("FRONT_ULTRASONIC_SENSOR_TIMEOUT", 1000); // //Measurement timeout in µs
define("FRONT_ULTRASONIC_SENSOR_DELAY", 60); //Measurement delay in ms
define("FRONT_ULTRASONIC_SENSOR_RATE", 5); //Measurements per sample