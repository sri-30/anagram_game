import React from 'react'
import {db, auth} from '../firebase.js'

import {Button, List, ListItem, ListItemIcon, ListItemText, 
    Paper, Typography, TextField, CircularProgress} from '@material-ui/core'

import PersonIcon from '@material-ui/icons/Person';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';

export default class Lobby extends React.Component{

    constructor() {
        super();
        this.state = {
            playerList: -1,
            gameStarted: false,
            timeLimit: 20,
            loading: false,
            timeLimitError: false
        }
    }

    // Called when a user closes the window or tab with the game open
    exitGame = () => {

        const GameID = this.GameID

        if (this.props.host) {
            // Deletes all data relating to the current game and the user's wordlist if the leaving player is host
            var batch = db.batch()
            //var words = db.collection("words").doc(auth.currentUser.uid)
            var games = db.collection("games").doc(GameID)
            var players = db.collection("players").doc(GameID)

            //batch.delete(words)
            batch.delete(games)
            batch.delete(players)
            batch.commit()
        }
        else {
            // Removes the current player from the current game player list and the user's wordlist if the leaving player is not host
            //db.collection('words').doc(auth.currentUser.uid).delete()
            db.collection('players').doc(GameID).update({
                playerList: this.state.playerListminus
            })
        }
        return null
    }

    componentDidMount() {
        const GameID = this.props.GameID ? this.props.GameID : "hello"
        const playerRef = db.collection('players').doc(GameID)

        this.GameID = GameID

        // Listens for players joining and leaving
        this.unsubscribe_players = playerRef.onSnapshot((snapshot) => {
            if (snapshot.get("playerList")) {
                let playerList = snapshot.get("playerList")
                let playerListminus = playerList.filter((player) => player.key !== auth.currentUser.uid)
                this.setState({playerList: playerList, playerListminus: playerListminus});
            }
            else {
                this.props.destroyGame()
            }
          }, (errorObject) => {
            console.log('The read failed: ' + errorObject.name);
        });

        // Listen for host starting the game
        this.unsubscribe_games = db.collection('games').doc(GameID).onSnapshot((snapshot) => {
            this.setState({gameStarted: snapshot.get("gameStarted")});
            if (snapshot.get("gameStarted")) {
                this.props.startGame();
            }
          }, (errorObject) => {
            console.log('The read failed: ' + errorObject.name);
        });
        
        // Check for players leaving the game
        window.addEventListener("beforeunload", (ev) => {
            ev.preventDefault();
            return this.exitGame();
        });
    }

    // Unsubscribes all listeners
    componentWillUnmount() {
        this.unsubscribe_games()
        this.unsubscribe_players()
    }

    // Called when host presses 'Start Game'
    handleStartGame = async() => {
        this.setState({loading: true})

        var timeLimit = this.state.timeLimit

        if (timeLimit < 1 || isNaN(timeLimit)) {
            timeLimit = 20
        }

        await db.collection('games').doc(this.props.GameID).update({
            gameStarted: true,
            totalPlayers: this.state.playerList.length,
            connected: 0,
            latestTime: Date.now(),
            timeLimit: timeLimit
        })

        await db.collection('players').doc(this.props.GameID).update({
            scores: []
        })

        this.props.startGame();
    }

    // Called when non-host players press 'Leave Lobby'
    handleLeaveLobby = async() => {
        this.setState({loading: true})

        let playerList = this.state.playerList.filter((player) => player.key !== auth.currentUser.uid)

        //await db.collection('words').doc(auth.currentUser.uid).delete()
        await db.collection('players').doc(this.props.GameID).update({
            playerList: playerList
        })
        this.props.destroyGame()
    }

    // Called when host presses 'Main Menu'
    handleDeleteGame = async() => {
        this.setState({loading: true})

        var batch = db.batch()
        //var words = db.collection("words").doc(auth.currentUser.uid)
        var games = db.collection("games").doc(this.props.GameID)
        var players = db.collection("players").doc(this.props.GameID)

        //batch.delete(words)
        batch.delete(games)
        batch.delete(players)
        await batch.commit()
        this.props.destroyGame()
        return;
    }

    // Verifies that the input time limit is a number and is valid
    handleChange = (event) => {
        if (!isNaN(event.target.value) & (event.target.value > -1)){
            this.setState({timeLimit: event.target.value, timeLimitError: false});
        }
        else {
            this.setState({timeLimitError: true})
        }
    }

    render() {
        if (this.state.gameStarted) {
            return null;
        }
        else if (this.state.loading) {
            return (<div>
                <CircularProgress/>
            </div>)
        }
        else {
        return(
        <div>
            <Paper elevation={3} style={{padding: 10}}>
                <Typography variant="h5">
                    Game ID: {this.props.GameID}
                </Typography>
                <Typography variant="h5">
                    Players Joined: {this.state.playerList.length}
                </Typography>
            </Paper>
            <List>
            {
                this.state.playerList === -1 ? null
                : this.state.playerList.map((player) => {
                    return(<ListItem key={player.key} alignItems="center" style={{justifyContent: 'center'}}>
                        <ListItemIcon><PersonIcon fontSize="large"/></ListItemIcon>
                        <ListItemText primary={<Typography variant="h5">{player.nickname}</Typography>}/>
                    </ListItem>)
                })
            }
            </List>
            {this.props.host ? <div>
                {
                    this.state.timeLimitError ? <TextField error id="timeLimit" helperText="Must be a number greater than 0" label="Round Time Limit (s)" value={this.state.timeLimit} size="small" onInput={this.handleChange} variant="outlined" color="primary" style={{margin: 3}}></TextField> :
                    <TextField id="timeLimit" label="Round Time Limit (s)" value={this.state.timeLimit} size="small" onInput={this.handleChange} variant="outlined" color="primary" style={{margin: 3}}></TextField>
                }
                <Button onClick={this.handleStartGame} endIcon={<PlayArrowIcon/>} variant="contained" color="primary" style={{margin: 5}}>Start Game</Button>
                <Button onClick={this.handleDeleteGame} endIcon={<ExitToAppIcon/>} variant="contained" color="secondary" style={{margin: 5}}>Main Menu</Button>
            </div> : 
            <div>
                <Typography variant="h5">
                    Waiting for host
                </Typography>
                <Button onClick={this.handleLeaveLobby} endIcon={<ExitToAppIcon/>} variant="contained" color="secondary" style={{marginTop: 15}}>Leave Lobby</Button>
            </div>}
        </div>)
        }
    }
}
