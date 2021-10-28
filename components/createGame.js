import React from 'react'
import {db, auth} from '../firebase.js'
import {generateAnagramLetters} from '../utils/anagramTools.js'

import {CircularProgress, Button} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

export default class CreateGame extends React.Component{

    constructor() {
        super();
        this.state = {
            loading: false
        }
    }

    // Generates a random alphanumeric string of length 'length'
    generateGameID = (length) => {
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var gameID = '';
        for ( var i = 0; i < length; i++ ) {
            gameID += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return gameID;
    }

    // Generates a game ID and creates relevant documents in firestore
    gameCreate = async() => {
        var id = this.generateGameID(5)

        this.setState({loading: true})

        await db.collection('games').doc(id).get().then((doc) => {
            if (doc.exists) {
                console.log("yes")
                id = this.generateGameID(5)
            }
        }).catch((error) => {
            console.log(error)
        })
        

        const anagramObj = generateAnagramLetters();
        
        // Creates a document for the players
        db.collection("players").doc(id).set({
            playerList: [{key: auth.currentUser.uid, nickname: this.props.nickname}]
        }).catch((error) => {
            console.error("Error Creating Game", error);
        })
        
        // Creates a word list document for the user
        db.collection('words').doc(auth.currentUser.uid).update({
            wordList: []
        })
        
        // Creates a document for the game
        db.collection("games").doc(id).set({
           host: auth.currentUser.uid,
           gameStarted: false,
           anagram: anagramObj.anagram,
           originalWord: anagramObj.originalWord,
           gameRestarted: false,
           scores: [],
           latestTime: Date.now()
        }).then(() => {
            this.props.updateGameID(id);
        })
        .catch((error) => {
            console.error("Error Creating Game", error);
        })
    }


    render() {
        return(<div>
            {this.state.loading ? <CircularProgress/> : 
            <Button onClick={this.gameCreate} endIcon={<AddIcon/>} variant="contained" color="primary" style={{margin: 5}}>Create Game</Button>}
        </div>)
    }
}
