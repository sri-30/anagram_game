import React from 'react';
import Typography from '@material-ui/core/Typography';
import '../css/countDown.css'

export default class CountDown extends React.Component{

    constructor() {
        super();
        this.state = {
            countNum: 3
        }
    }

    // Called every second from this.timerID
    CountDown = () => {
        var countNum = this.state.countNum;
        if (countNum === 0) {
            // Starts the game on the parent component
            this.props.endCountDown();
        }
        else {
           this.setState({countNum: countNum - 1}); 
        }
        return;
    }

    componentDidMount() {
        this.timerID = setInterval(this.CountDown, 1000);

        this.setState({countNum: this.props.countDownTime})
    }

    componentWillUnmount() {
        clearInterval(this.timerID)
    }

    render() {
        return(<div>
                    <Typography variant="h4">
                        {this.state.countNum}
                    </Typography>
            </div>)
    }
}
