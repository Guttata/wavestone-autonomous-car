function define(name, value) {
    Object.defineProperty(exports, name, {
        value:      value,
        enumerable: true
    });
}


//
define("PWM_RANGE", 255); // Set the maximum pulse width
define("PWM_CLOCK_DIV", 8); // Set PWM refresh rate to 300kHz


// Right Motor Engine
define("RIGHT_MOTOR_ENGINE_DIR_PIN", 31);
define("RIGHT_MOTOR_ENGINE_PWM_PIN", 33);
define("RIGHT_MOTOR_ENGINE_CURRENT_PIN", 29);

// Left Motor Engine
define("LEFT_MOTOR_ENGINE_DIR_PIN", 35);
define("LEFT_MOTOR_ENGINE_PWM_PIN", 32);
define("LEFT_MOTOR_ENGINE_CURRENT_PIN", 37);

//Front UltraSonic Sensor
define("FRONT_ULTRASONIC_SENSOR_ECHO_GPIO", 24);
define("FRONT_ULTRASONIC_SENSOR_TRIG_GPIO", 20);

//Front right UltraSonic Sensor
define("FRONT_RIGHT_ULTRASONIC_SENSOR_ECHO_GPIO", 23);
define("FRONT_RIGHT_ULTRASONIC_SENSOR_TRIG_GPIO", 21);

//Front left UltraSonic Sensor
define("FRONT_LEFT_ULTRASONIC_SENSOR_ECHO_GPIO", 18);
define("FRONT_LEFT_ULTRASONIC_SENSOR_TRIG_GPIO", 15);

//Back UltraSonic Sensor
define("BACK_ULTRASONIC_SENSOR_ECHO_GPIO", 25);
define("BACK_ULTRASONIC_SENSOR_TRIG_GPIO", 17);


//IR Sensor, connected to the MCP
define("RIGHT_IR_SENSOR_PIN", 0);
define("LEFT_IR_SENSOR_PIN", 1);
