import React from 'react';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import { makeStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import * as actions from '../../../store/actions';
import { Link } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        '& > *': {
            margin: theme.spacing(1),
        },
    },
}));



function POSOpt(props) {

    function handleLogout(e) {
        if (confirm("Confirm logout")) {
            props.dispatch(actions.authLogout());
        }
    };

    function handleMenu() {
        // console.log("doing something");
        const win = window.open("/", "_blank");
        // const win = window.open("/pos/menu", "_blank");
        win.focus();
    }

    function handlePOS () {
        // console.log("doing something");
        const win = window.open("/pos", "_blank");
        win.focus();
    }

    const classes = useStyles();
    const butStyle = { outline: "none" };
    return (
        <>
            <div className={classes.root}>
                <ButtonGroup variant="contained" color="primary" aria-label="contained primary button group">
                    <Button onClick={handlePOS} style={butStyle}>Item Return</Button>
                    <Button onClick={handleMenu} style={butStyle}>Menu</Button>
                    <Button onClick={handleLogout} style={butStyle}>Logout</Button>
                </ButtonGroup>
            </div>
        </>
    );
}

const mapStateToProps = (state) => ({
    isAuthenticated: state.Auth.isAuthenticated,
});

export default connect(mapStateToProps)(POSOpt);
