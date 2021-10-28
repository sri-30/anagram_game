import React from 'react'
import firebase from 'firebase'
import CountDown from './countDown.js'
import {db, auth} from '../firebase.js'
import '../css/gameScreen.css'
import {verifyAnagram, generateAnagramLetters, shuffle} from '../utils/anagramTools.js'
import VerticalList from './vList.js'
import GameOverScreen from './gameOver.js'

import {Button, TextField, Typography, LinearProgress} from '@material-ui/core'

import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';

import Axios from "axios"

const defaultState = {
    connected: 0,
    totalPlayers: 0,
    gameStatus: 'NotStarted',
    word: '',
    score: 0,
    correctWords: [],
    gameRestarted: false,
    errorState: false,
    loading: false
}

const restartState = {
    connected: 0,
    gameStatus: 'NotStarted',
    word: '',
    score: 0,
    correctWords: [],
    gameRestarted: true,
    errorState: false,
    loading: false
}


export default class GameScreen extends React.Component{

    constructor() {
        super();
        this.state = {...defaultState}
    }

    exitGame = () => {
    }

    // Called when another player leaves the game
    disconnectPlayer = () => {
        return db.collection('games').doc(this.props.GameID).update({
            connected: firebase.firestore.FieldValue.increment(-1),
            totalPlayers: firebase.firestore.FieldValue.increment(-1),
        })
    }

    // Called when before game timer ends and game starts
    startGame = () => {
        this.setState({gameStatus: 'Started', gameRestarted: false})
        db.collection('games').doc(this.props.GameID).update({gameRestarted: false,
                                                            latestTime: Date.now()})
    }

    // Called when game timer ends
    endGame = async() => {
        await db.collection('players').doc(this.props.GameID).update({
            scores: firebase.firestore.FieldValue.arrayUnion({
                key: auth.currentUser.uid,
                nickname: this.props.nickname,
                score: this.state.score})
        })
        this.setState({gameStatus: 'Ended'})
        return;
    }

    componentDidMount() {
        // Updates connected users in firestore

        const GameID = this.props.GameID

        db.collection('games').doc(this.props.GameID).update({
            connected: firebase.firestore.FieldValue.increment(1)
        })

        // Updates the current game
        db.collection('games').doc(this.props.GameID).get().then((doc) => {
            var anagram = doc.data().anagram
            var timeLimit = doc.data().timeLimit
            this.setState({anagram: anagram, timeLimit: timeLimit})
        }).catch((err) => {console.log(err)})

        this.unsubscribe_games = db.collection('games').doc(GameID).onSnapshot((snapshot) => {
            if (snapshot.get("host")) {
                this.setState({connected: snapshot.get("connected"),
                            totalPlayers: snapshot.get("totalPlayers"),
                            anagram: snapshot.get("anagram"), 
                            originalWord: snapshot.get("originalWord")})
                if (snapshot.get("gameRestarted") && !this.state.gameRestarted) {
                    this.resetGame()
                }
                if (!snapshot.get("gameStarted") && !this.props.host) {
                    this.props.returnToLobby()
            }
            }
            
          }, (errorObject) => {
            console.log('The read failed: ' + errorObject.name);
        });

        // Checks for players leaving the game
        this.unsubscribe_players = db.collection('players').doc(GameID).onSnapshot((snapshot) => {
            if (!snapshot.get("playerList")) {
                this.props.destroyGame()
            }
            else if (snapshot.get("playerList").length < this.state.totalPlayers && this.props.host) {
                this.disconnectPlayer()
            }
            else {
                this.setState({playerList: snapshot.get("playerList")})
            }
        }, (errorObject) => {
            console.log('The read failed: ' + errorObject.name);
        })

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

    handleChange = (event) => {
        this.setState({'word': event.target.value});
    }

    // Called when the user submits an anagram solution
    handleSubmit = (event) => {
        const word = this.state.word.toLowerCase()
        this.setState({loading: true})
        Axios.post("https://aqueous-savannah-38596.herokuapp.com/api/exists", {
            word: this.state.word.toLowerCase()
        }).then((response) => {
            const isReal = response.data
            if (verifyAnagram(word, this.state.anagram) & isReal & !this.state.correctWords.includes(word)){
                var words =  db.collection('words').doc(auth.currentUser.uid)
    
                var score = this.state.score
    
                score += word.length
            
                words.update({
                    wordList: firebase.firestore.FieldValue.arrayUnion(this.state.word)
                }).then(() => {
                this.setState({word: '', 
                                score: score,
                                errorState: false,
                                correctWords: [...this.state.correctWords, word],
                                loading: false}) 
                }).catch((error) => {console.log(error)})
            }
            else {
                this.setState({word: '', errorState: true, loading: false}) 
            }
        }).catch((error) => {
            console.log("server error")
            throw error;
        })
        event.preventDefault();
    }

    // Called when the user presses rematch
    resetGameHost = () => {
        const anagramObj = generateAnagramLetters()

        db.collection('games').doc(this.props.GameID).update({
            anagram: anagramObj.anagram,
            originalWord: anagramObj.originalWord,
            connected: 0,
            totalPlayers: this.state.totalPlayers,
            gameRestarted: true,
        })

        db.collection('players').doc(this.props.GameID).update({
            scores: []
        })
    }

    // Called for all players in the lobby when the host presses rematch
    resetGame = () => {
        this.setState({...restartState})

        db.collection('words').doc(auth.currentUser.uid).update({
            wordList: []
        })

        db.collection('games').doc(this.props.GameID).update({
            connected: firebase.firestore.FieldValue.increment(1)
        })
    }

    // Called when host presses 'Return to Lobby'
    returnToLobby = async() => {
        const anagramObj = generateAnagramLetters()

        await db.collection('games').doc(this.props.GameID).update({
            anagram: anagramObj.anagram,
            originalWord: anagramObj.originalWord,
            gameStarted: false,
            connected: 0,
            totalPlayers: this.state.totalPlayers
        })
        this.props.returnToLobby()
        return;
    }

    shuffle = () => {
        var newAnagram = shuffle(this.state.anagram)
        this.setState({anagram: newAnagram})
    }

    // Called when non-host player presses 'Leave Game' after game has ended
    handleLeaveGame = () => {
        let playerList = this.state.playerList.filter((player) => player.key !== auth.currentUser.uid)

        //db.collection('words').doc(auth.currentUser.uid).delete()
        db.collection('players').doc(this.props.GameID).update({
        playerList: playerList
        }).then(() => {
            this.unsubscribe_players()
            this.unsubscribe_games()
        }).then(() => {
            this.props.destroyGame()
        }).catch((error) => {console.log(error)})
    }
    
    render() {
        if (this.state.connected !== this.state.totalPlayers){
            return (<div>
                <Typography variant="h2">Waiting for Players to connect</Typography>
                <LinearProgress/>
                </div>)
        }
        else {
            switch(this.state.gameStatus) {
                case 'NotStarted':
                    return(<CountDown endCountDown={this.startGame} countDownTime={3}></CountDown>) 
                case 'Started':
                    return(<div>
                        <div className="topright">
                            <CountDown endCountDown={this.endGame} countDownTime={this.state.timeLimit}></CountDown>
                        </div>
                        <div className="topleft">
                            Score: {this.state.score}
                            <VerticalList List={this.state.correctWords}></VerticalList>
                        </div>
                        <Typography variant="h3">
                            Find as many words as you can!
                        </Typography>
                        <Typography variant="h2">
                            <p>
                                {this.state.anagram.toUpperCase()}
                            </p>
                        </Typography>
                        <form onSubmit={this.handleSubmit}>
                        {this.state.errorState ? <TextField error id="word" label="Enter Word Here" value={this.state.word} size="small" onInput={this.handleChange} variant="outlined" color="primary" style={{margin: 5}}></TextField>:
                        <TextField id="word" label="Enter Word Here" value={this.state.word} size="small" onInput={this.handleChange} variant="outlined" color="primary" style={{margin: 5}}></TextField>}
                        <Button onClick={this.handleSubmit} variant="contained" color="primary" style={{margin: 5}}>Submit</Button>
                        <Button onClick={this.shuffle} variant="contained" color="primary" style={{margin: 5}}>Shuffle</Button>
                        {this.state.loading ? <LinearProgress/> : <div></div>}
                        {this.props.host ? <Button onClick={this.endGame} variant="contained" color="secondary" style={{margin: 5}}>End Game</Button> : null}
                    </form>
                    </div>)
                case 'Ended':
                    return(<div>
                            <GameOverScreen anagram={this.state.anagram} originalWord={this.state.originalWord} score={this.state.score} GameID={this.props.GameID}/>
                            {this.props.host ? <div>
                                <Button onClick={this.resetGameHost} endIcon={<PlayArrowIcon/>} variant="contained" color="primary" style={{margin: 5}}>Rematch</Button>
                                <Button onClick={this.returnToLobby} endIcon={<ExitToAppIcon/>} variant="contained" color="secondary" style={{margin: 5}}>Return to Lobby</Button>
                            </div> : <div>
                                        <Button onClick={this.handleLeaveGame} endIcon={<ExitToAppIcon/>} variant="contained" color="secondary" style={{margin: 5}}>Leave Game</Button>
                                    </div>}
                        </div>)
                default:
                    return null
            }
        }
    }
}
