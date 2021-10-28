import React from 'react';
import {auth} from '../firebase.js';

import Button from '@material-ui/core/Button'

export default function signOut() {
    const signOut = () => {
        auth.signOut()
    }
  
    return (<Button onClick={signOut} variant="contained" color="secondary" style={{margin: 10}}>Sign Out</Button>)
  }