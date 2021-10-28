import React from 'react'
import {db} from '../firebase.js'

import {Typography, Paper, List, ListItem, ListItemIcon, ListItemText} from '@material-ui/core';
import PersonIcon from '@material-ui/icons/Person';

export default class GameOverScreen extends React.Component{

    constructor() {
        super();
        this.state = {
            scores: []
        }
    }

    componentDidMount() {
        // Listens for scoreboard updates
        this.unsubscribe_players = db.collection('players').doc(this.props.GameID).onSnapshot(
            (snapshot) => {
                const scores = snapshot.get("scores")
                scores.sort((a, b) => {return b.score - a.score})
                this.setState({scores: scores})
        }, (errorObject) => {
            console.log('The read failed: ' + errorObject.name);
        })
    }

    componentWillUnmount() {
        this.unsubscribe_players()
    }

    render() {
        return(
            <div>
                <Typography variant="h1">
                    Game Over
                </Typography>
                <Paper>
                        <Typography variant="h3">
                            {this.props.anagram.toUpperCase()}
                        </Typography>
                </Paper>
                <Paper style={{marginTop: window.innerHeight * 1/40}}>
                        <Typography variant="h3">
                            {this.props.originalWord.toUpperCase()}
                        </Typography>
                </Paper>
                <List style={{paddingLeft: window.innerWidth * (1/16), paddingBottom:0}}>
                    {this.state.scores.map((scoreObject) => {
                        return(
                            <ListItem key={scoreObject.key}>
                                <ListItemIcon><PersonIcon fontSize="large"/></ListItemIcon>
                                <ListItemText key={scoreObject.key} primary={<Typography variant="h5">{`${scoreObject.nickname}: ${scoreObject.score}`}</Typography>}/>
                            </ListItem>)
                    })}
                </List>
            </div>
        )
    }
}
