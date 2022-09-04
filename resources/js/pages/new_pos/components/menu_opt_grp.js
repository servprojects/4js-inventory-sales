import React from 'react';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import { makeStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Fade from '@material-ui/core/Fade';
import * as actions from '../../../store/actions';
import Http from '../../../Http';
import { Link } from 'react-router-dom';
import axios from "axios";
const gitHubUrl = "http://localhost:3000/api/v1/ex/all";

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



function MENUOpt(props) {

    function handleLogout(e) {
        if (confirm("Confirm logout")) {
            props.dispatch(actions.authLogout());
        }
    };

    const getGiHubUserWithAxios = async () => {
        const response = await axios.post(gitHubUrl);
        // setUserData(response.data);
        console.log("external")
        console.log(response.data)
        if (confirm("Are you sure you want to update master data?")) {
            updateFromLive(response.data)
        }
    };

    function updateFromLive(data) {

        console.log(data)
        console.log(JSON.stringify([data]))

        Http.post(`/api/v1/offline/data`, { data: JSON.stringify([data]) })
            .then(({ data }) => {

                console.log("data.message")
                console.log(data.message)
            })
    }

    function handleMenu() {
        const win = window.open("/pos/menu", "_blank");
        win.focus();
    }

    function setView(data) {
        props.setview(data)
    }

    const classes = useStyles();
    const butStyle = { outline: "none" };


    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    return (
        <>
            <div className={classes.root}>
                <ButtonGroup variant="contained" color="primary" aria-label="contained primary button group">
                    <Button onClick={(e) => setView('receiving')} style={butStyle}>Receiving</Button>
                    <Button onClick={(e) => setView('reports')} style={butStyle}>Reports</Button>
                    <Button onClick={(e) => setView('stocks')} style={butStyle}>Stocks</Button>
                    <Button onClick={(e) => setView('physcount')} style={butStyle}>Physical Count</Button>
                    <Button onClick={handleLogout} style={butStyle}>Logout</Button>
                    <Button onClick={handleClick} style={butStyle}>More</Button>
                </ButtonGroup>

                <Menu
                    id="fade-menu"
                    anchorEl={anchorEl}
                    keepMounted
                    open={open}
                    onClose={handleClose}
                    TransitionComponent={Fade}
                >
                    <MenuItem onClick={getGiHubUserWithAxios} >Update Data</MenuItem>
                    <Link to="/utilities/items"><MenuItem>Item Management</MenuItem></Link>
                    <Link to="/utilities/priceprint">  <MenuItem>Print Pricing</MenuItem></Link>
                    <Link to="/utilities/users"><MenuItem>User Management</MenuItem></Link>
                </Menu>
            </div>
        </>
    );
}

const mapStateToProps = (state) => ({
    isAuthenticated: state.Auth.isAuthenticated,
});

export default connect(mapStateToProps)(MENUOpt);
