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
define("RIGHT_MOTOR_ENGINE_DIR_PIN", 13);
define("RIGHT_MOTOR_ENGINE_PWM_PIN", 32);
define("RIGHT_MOTOR_ENGINE_CURRENT_PIN", 19);

// Left Motor Engine
define("LEFT_MOTOR_ENGINE_DIR_PIN", 23);
define("LEFT_MOTOR_ENGINE_PWM_PIN", 33);
define("LEFT_MOTOR_ENGINE_CURRENT_PIN", 21);


define("ULTRASONIC_SENSOR_SENSING_INTERVAL", 1000); //1 measure per second



//Front UltraSonic Sensor
define("FRONT_ULTRASONIC_SENSOR_ECHO_GPIO", 24);
define("FRONT_ULTRASONIC_SENSOR_TRIG_GPIO", 20);
define("FRONT_ULTRASONIC_SENSOR_OBSTACLE_LIMIT", 70);

//Front right UltraSonic Sensor
define("FRONT_RIGHT_ULTRASONIC_SENSOR_ECHO_GPIO", 23);
define("FRONT_RIGHT_ULTRASONIC_SENSOR_TRIG_GPIO", 21);
define("FRONT_RIGHT_ULTRASONIC_SENSOR_OBSTACLE_LIMIT", 65);

//Front left UltraSonic Sensor
define("FRONT_LEFT_ULTRASONIC_SENSOR_ECHO_GPIO", 18);
define("FRONT_LEFT_ULTRASONIC_SENSOR_TRIG_GPIO", 15);
define("FRONT_LEFT_ULTRASONIC_SENSOR_OBSTACLE_LIMIT", 65);

//Back UltraSonic Sensor
define("BACK_ULTRASONIC_SENSOR_ECHO_GPIO", 25);
define("BACK_ULTRASONIC_SENSOR_TRIG_GPIO", 17);
define("BACK_ULTRASONIC_SENSOR_OBSTACLE_LIMIT", 50);

//RIGHT IR Sensor
define("RIGHT_IR_SENSOR_PIN", 8);
