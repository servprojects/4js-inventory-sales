import React from 'react';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import { makeStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import * as actions from '../../../store/actions';
import NewPos from '../components/new_pos';
import MenuOpt from '../components/menu_opt_grp';
import Paper from '@material-ui/core/Paper';
import RNRexisting from '../../transactions/RNR_existing';
import GeneralReport from '../../reports/generalReport';
import Stocks from '../../stocks/index';
import Physicalcount from '../../physicalcount';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: "100%",
        '& > *': {
            margin: theme.spacing(1),
        },
    },
    paper: {
        // height: "87vh",
        width: "100%",
    },
    control: {
        padding: theme.spacing(2),
    },
}));



function MainMenu(props) {
    const [selected, setSelected] = React.useState('receiving');
    const classes = useStyles();

    function handleLogout(e) {
        if (confirm("Confirm logout")) {
            props.dispatch(actions.authLogout());
        }
    };

    function setView(data) {
        setSelected(data)
    }

    function reports() {
        return (
            <>
                <div style={{ paddingBottom: 'min(20%)' }}>
                    <GeneralReport />
                </div>
            </>
        )
    }

    function stocks() {
        return (
            <>
                <Stocks />
                <br /><br />
                <br /><br />
            </>
        )
    }
    function phys() {
        return (
            <>
                <div style={{ paddingBottom: 'min(70%)' }}>
                    <Physicalcount />
                </div>


            </>
        )
    }

    function content() {
        console.log("selected")
        console.log(selected)
        const butStyle = { outline: "none" };
        return (
            <>
                <div className={classes.root}>
                    <MenuOpt setview={setView} />

                    <Paper className={classes.paper} style={{ padding: '10px' }} >
                        {selected == 'receiving' ? <RNRexisting /> : <></>}
                        {selected == 'physcount' ? <>{phys()}</> : <></>}
                        {selected == 'reports' ? <>{reports()}</> : <></>}
                        {selected == 'stocks' ? <>{stocks()}</> : <></>}
                    </Paper>
                    <br />
                    <br />
                </div>

            </>
        );
    }


    return (
        <>
            <NewPos main={content()} />


        </>
    );


}

const mapStateToProps = (state) => ({
    isAuthenticated: state.Auth.isAuthenticated,
});

export default connect(mapStateToProps)(MainMenu);
