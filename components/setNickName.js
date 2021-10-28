import React from 'react';
import {db, auth} from '../firebase.js';

import {Button, TextField} from '@material-ui/core'
import SaveIcon from '@material-ui/icons/Save'

export default class SetNickName extends React.Component{
    constructor() {
        super();
        this.state = {
            nickname: ''
        }
    }

    componentDidMount() {
        db.collection('words').doc(auth.currentUser.uid).get().then((doc) => {
            if (doc.exists) {
                this.setState({nickname: doc.data().nickname})
                this.props.updateNickName(doc.data().nickname)
            }
            else {
                this.setState({nickname: this.props.default})
                db.collection('words').doc(auth.currentUser.uid).set({nickname: this.props.default, wordList: []})
            }
        })
        
    }

    handleChange = (event) => {
        this.setState({nickname: event.target.value});
    }

    // Updates nickname on app component
    handleSubmit = (event) => {
        this.props.updateNickName(this.state.nickname)
        event.preventDefault();
    }

    // Updates Nickname on the app
    handleSaveNickname = (event) => {
        this.props.updateNickName(this.state.nickname)
        db.collection('words').doc(auth.currentUser.uid).get().then((doc) => {
            if (doc.exists) {
                db.collection('words').doc(auth.currentUser.uid).update({nickname: this.state.nickname})
            }
            else {
                db.collection('words').doc(auth.currentUser.uid).set({nickname: this.state.nickname, wordList: []})
            }
        })
        return;
    }

    render() {
        return(
            <div>
                <TextField id="nickname" label="Nickname" value={this.state.nickname} size="small" onInput={this.handleChange} variant="outlined" color="primary" style={{margin: 5}}></TextField>
                <Button onClick={this.handleSaveNickname} endIcon={<SaveIcon/>}variant="contained" color="primary" style={{margin: 5}}>Save</Button>
            </div>
        )
    }
}