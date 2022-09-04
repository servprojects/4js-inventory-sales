import React from 'react';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';


const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        height: "96vh",
        width: "100%",
    },
    control: {
        padding: theme.spacing(2),
    },
}));

function NewPos(props) {
    const classes = useStyles();
    
    return (
        <>
            <div style={{ padding: "1%" }} class="blueGrad">
            {/* <div style={{ padding: "1%", height: "100%" }} class="blueGrad"> */}
                <Grid container className={classes.root} spacing={2}>
                    <Grid item xs={12} >
                        <Grid container justify="center" spacing={2}>

                            {props.main}
                            {/* <Grid key="left" item xs={7} >
                                <Paper className={classes.paper} >
                                    {props.rightCont}
                                </Paper>
                            </Grid>
                            <Grid key="right" item xs={5}  >
                                <Paper className={classes.paper} >
                                    <div style={{ padding: "1.5% 1% 1% 1%" }}>
                                        {props.leftCont}
                                    </div>
                                </Paper>
                            </Grid> */}
                            

                        </Grid>
                    </Grid>
                </Grid>
               
            </div>
        </>
    );
}

const mapStateToProps = (state) => ({
    isAuthenticated: state.Auth.isAuthenticated,
});

export default connect(mapStateToProps)(NewPos);
