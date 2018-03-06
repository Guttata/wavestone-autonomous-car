import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AccelerometerDrivingIcon from 'material-ui/svg-icons/device/screen-rotation';
import JoystickDrivingIcon from 'material-ui/svg-icons/toggle/radio-button-checked';
import AutoPilotDrivingIcon from 'material-ui/svg-icons/maps/navigation';

import AccelerometerDrivingMode from '../DrivingMode/AccelerometerDrivingMode';
import JoystickDrivingMode from '../DrivingMode/JoystickDrivingMode';
import AutoPilotDrivingMode from '../DrivingMode/AutoPilotDrivingMode';

const AccelerometerDrivingModeStyle = {
	marginTop: 20,
};

const JoystickDrivingModeStyle = {
    
};

const AutoPilotDrivingModeStyle = {
    marginTop: 20,
};








class DrivingModeButtons extends Component {
	showAccelerometerDrivingModal() {
		 ReactDOM.render(<AccelerometerDrivingMode />, document.getElementById('root'));
	}

	showJoystickDrivingModal() {
		ReactDOM.render(<JoystickDrivingMode />, document.getElementById('root'));	
	}

	showAutoPilotDrivingModal() {
		ReactDOM.render(<AutoPilotDrivingMode />, document.getElementById('root'));	
	}

	render(){
		return (
			<MuiThemeProvider>
				
				<div>
					<FloatingActionButton mini={true} style={JoystickDrivingModeStyle} onClick={() => this.showJoystickDrivingModal()}>
					<JoystickDrivingIcon />
					</FloatingActionButton>
				</div>
				
				<div>
					<FloatingActionButton mini={true} style={AccelerometerDrivingModeStyle} onClick={() => this.showAccelerometerDrivingModal()}>
						<AccelerometerDrivingIcon />
					</FloatingActionButton>
				</div>
				

				<div>
					<FloatingActionButton mini={true} secondary={true} style={AutoPilotDrivingModeStyle} onClick={() => this.showAutoPilotDrivingModal()}>
						<AutoPilotDrivingIcon />
					</FloatingActionButton>
				</div>
			</MuiThemeProvider>

		);
	}
}


export default DrivingModeButtons;
