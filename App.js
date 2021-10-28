import './App.css';
import React, {useState, useEffect} from 'react'

import {auth, db} from './firebase.js'
import {useAuthState} from 'react-firebase-hooks/auth'

import Axios from "axios"

import SignIn from './components/signIn.js'
import CreateGame from './components/createGame.js'
import JoinGame from './components/joinGame.js'
import Lobby from './components/lobby.js'
import GameScreen from './components/gameScreen.js'
import SetNickName from './components/setNickName.js'
import SignOut from './components/signOut'
import ErrorBoundary from './components/errorBoundary'

import { ThemeProvider } from '@material-ui/styles';
import { createTheme } from '@material-ui/core/styles';
import {ReactComponent as Logo} from './iconmonstr-github-1.svg'


const darkTheme = createTheme({
  palette: {
    type: 'dark',
  }
});

function App() {

  const [user] = useAuthState(auth);
  const [gameID, setGameID] = useState('');
  const [screen, setScreen] = useState('Home');
  const [host, setHost] = useState(false);
  const [nickname, setNickname] = useState('')

  // Deletes all database records related to the user and resets to Home screen
  const errorReset = () => {
    db.collection('words').doc(auth.currentUser.uid).delete().catch((error) => {
      console.log(error)
    })
    db.collection('players').doc(gameID).delete().catch((error) => {
      console.log(error)
    })
    db.collection('games').doc(gameID).delete().catch((error) => {
      console.log(error)
    })
    setScreen('Home')
    return;
  }

  // Checks for expired Games when the user joins
  useEffect(() => {
    Axios.post("https://aqueous-savannah-38596.herokuapp.com/api/exists", {
        word: "hello"
    }).then((response) => {
        if (response.data) {
          console.log("Connected to server successfully")
        }
    }).catch((error) => {
      throw error
    })

    var gameRef = db.collection('games')
    var playerRef = db.collection('players')

    var expiredTime = Date.now() - 3600000

    gameRef.where("latestTime", "<", expiredTime).get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        gameRef.doc(doc.id).delete()
        playerRef.doc(doc.id).delete()
      })
    }).catch((error) => {
      console.log(error)
    })
  }, [])

  return (
    <ThemeProvider theme={darkTheme}>
        <div className="App">
          <header className="App-header">
            <section>
            {user ?
            <div>
              <ErrorBoundary resetAll={errorReset}>
                {{
                    'Home': <div>
                                <SetNickName default={nickname} errorFunc={() => errorReset()} updateNickName={(nickname) => {setNickname(nickname)}}></SetNickName>
                                <JoinGame errorFunc={() => errorReset()} updateGameID={(id) => {setGameID(id); setScreen('Lobby');}} nickname={nickname}/>
                                <CreateGame errorFunc={() => errorReset()} updateGameID={(id) => {setGameID(id); setScreen('Lobby'); setHost(true);}} nickname={nickname}/>
                                <SignOut/>
                            </div>,
                    'Lobby': <Lobby errorFunc={() => errorReset()} GameID={gameID} host={host} destroyGame={() => {setGameID(''); setScreen('Home'); setHost(false)}} startGame={() => {setScreen('Game')}}/>,
                    'Game': <GameScreen errorFunc={() => errorReset()} GameID={gameID} host={host} destroyGame={() => {setGameID(''); setScreen('Home');; setHost(false)}} returnToLobby={() => {setScreen('Lobby')}} nickname={nickname}/>,
                  }[screen]
                }
                <a href="https://github.com/sri-30">
                  <button className="bottomright">
                    <Logo/>
                  </button>
                </a>
              </ErrorBoundary>
            </div>
            : <SignIn/>}
            </section>
          </header>
        </div>
      </ThemeProvider>
  );
}

export default App;