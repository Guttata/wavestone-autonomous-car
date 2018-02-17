import React, {Component} from 'react';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AccelerometerDrivingIcon from 'material-ui/svg-icons/device/screen-rotation';
import JoystickDrivingIcon from 'material-ui/svg-icons/toggle/radio-button-checked';
import AutoPilotDrivingIcon from 'material-ui/svg-icons/maps/navigation';

const AccelerometerDrivingModeStyle = {

};

const JoystickDrivingModeStyle = {
    marginTop: 20,
};

const AutoPilotDrivingModeStyle = {
    marginTop: 20,
};


class DrivingModeButtons extends Component {
    render(){
	return (
<MuiThemeProvider>
	<div>
	<FloatingActionButton mini={true} style={AccelerometerDrivingModeStyle}>
	<AccelerometerDrivingIcon />
	</FloatingActionButton>

	<div>
	<FloatingActionButton mini={true} style={JoystickDrivingModeStyle}>
	<JoystickDrivingIcon />
	</FloatingActionButton>
	</div>

	<div>
	<FloatingActionButton mini={true} secondary={true} style={AutoPilotDrivingModeStyle}>
	<AutoPilotDrivingIcon />
	</FloatingActionButton>
	</div>

    </div>
</MuiThemeProvider>

	);
    }
}


export default DrivingModeButtons;
