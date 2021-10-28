import React from 'react'

import {List, ListItem, ListItemText, Typography} from '@material-ui/core'

export default class VerticalList extends React.Component{

    constructor() {
        super();
        this.state = {
        }
    }

    render() {
        return(
        <List>
            {this.props.List.map((item) => {
            return(
                <ListItem key={item}>
                    <ListItemText primary={<Typography variant="h5">{item.toUpperCase()}</Typography>}/>
                </ListItem>)
            })}
        </List>
        )
    }
}
