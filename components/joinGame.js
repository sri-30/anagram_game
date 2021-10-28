import React from 'react'
import {db, auth} from '../firebase.js'
import firebase from 'firebase'

import {CircularProgress, Button, TextField} from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';
import GroupAddIcon from '@material-ui/icons/GroupAdd';

export default class JoinGame extends React.Component{

    constructor() {
        super();
        this.state = {
            GameID: '',
            loading: false,
            errorState: false,
        }
    }

    handleChange = (event) => {
        this.setState({'GameID': event.target.value});
    }
    
    // Called when player joins a game
    gameJoin = async(gameID) => {
        const game = await db.collection("games").doc(gameID).get()
        if (!game.exists || game.data().gameStarted) {
            this.setState({errorState: true})
            return false
        }
        else {
            var players = db.collection("players").doc(gameID);
            players.update({
                playerList: firebase.firestore.FieldValue.arrayUnion({key: auth.currentUser.uid, nickname: this.props.nickname})
            })
            db.collection('words').doc(auth.currentUser.uid).update({wordList: []})  
            return true
        }
        
    }

    // Called when player presses 'Join Game'
    handleSubmit = (event) => {
        this.gameJoin(this.state.GameID).then((success) => {
            if (success) {
               this.props.updateGameID(this.state.GameID)
            }
        })
    }
    

    render() {
        if (this.state.loading) {
            return <CircularProgress/>
        }
        else {return(<div style={{margin: 5}}>
                {this.state.errorState ? <Alert severity="error" style={{margin: 20}}>
                    <AlertTitle>Error</AlertTitle>
                    Invalid Game ID — <strong>Game doesn't exist or is in progress</strong>
                </Alert> : null}
                <TextField id="GameID" label="GameID" value={this.state.GameID} size="small" onInput={this.handleChange} variant="outlined" color="primary" style={{margin: 5}}></TextField>
                <Button onClick={this.handleSubmit} endIcon={<GroupAddIcon/>} variant="contained" color="primary" style={{margin: 5}}>Join Game</Button>
        </div>)}
    }
}
