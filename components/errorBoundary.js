import React from 'react'

import {Button, Typography} from '@material-ui/core'

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {hasError: false};
    }

    static getDerivedStateFromError(error) {
        return {hasError: true}
    }

    componentDidCatch(error, errorInfo) {
        console.log(error)
        console.log(errorInfo)
    }

    render() {
        if (this.state.hasError) {
            return <div>
                    <Typography variant={"h3"}>
                        Something went wrong
                    </Typography>
                        <Button onClick={() => {
                            this.props.resetAll()
                            this.setState({hasError: false})
                        }} variant="contained" color="secondary" style={{margin: 5}}>Return to Menu</Button>
                    </div>
        }

        return this.props.children
    }
}