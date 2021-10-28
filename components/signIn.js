import React, {useState} from 'react';
import firebase from 'firebase'
import {db, auth} from '../firebase.js';

import {Button, CircularProgress} from '@material-ui/core'

export default function SignIn() {

  const [loading, setLoading] = useState(false)

    const signInWithGoogle = async() => {
      setLoading(true)
      const provider = new firebase.auth.GoogleAuthProvider();
      await auth.signInWithPopup(provider);
      db.collection('words').doc(auth.currentUser.uid).get().then((doc) => {
        if (!doc.exists) {
            db.collection('words').doc(auth.currentUser.uid).set({nickname: auth.currentUser.displayName, wordList: []})
        }
    })
    }
    if (!loading){
      return (<Button onClick={signInWithGoogle} variant="contained" color="primary" style={{margin: 5}}>Sign in with Google</Button>)
    }
    else {
      return (<CircularProgress/>)
    }
  }