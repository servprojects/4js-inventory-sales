import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';

const useStyles = makeStyles((theme) => ({
    root: {
        width: 'fit-content',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: theme.shape.borderRadius,
        backgroundColor: theme.palette.background.paper,
        // color: theme.palette.text.secondary,
        fontSize: '16px',
        '& svg': {
            margin: theme.spacing(1.5),
        },
        '& hr': {
            margin: theme.spacing(0, 0.5),
        },
    },
}));

export default function VerticalDividers(props) {
    const classes = useStyles();

    return (
        <div>
            <Grid container alignItems="center" className={classes.root}>
                <div style={{padding: props.valpadding ? props.valpadding: '10px', width: props.valwidth ? props.valwidth : '175px', textAlign: 'center'}}>{props.desc}</div>
                <Divider orientation="vertical" flexItem />
                <div style={{width: props.descwidth ? props.descwidth : '190px'}}><center>{props.value}</center></div>
            </Grid>
        </div>
    );
}
