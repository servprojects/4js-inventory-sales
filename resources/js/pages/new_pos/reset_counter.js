import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import PaperDivider from './components/paper_divider';
import { Paper, Typography, TextField, Button } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Http from '../../Http';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        '& > *': {
            margin: theme.spacing(1),
            width: theme.spacing(100),
            height: theme.spacing(40),
        },
    },
}));

export default function ResetCounter(props) {
    const [state, setState] = useState({ cureset: null, curcounter: null, password: null, email: null });
    useEffect(() => {
        getData()
    }, []);

    function getData() {
        Http.post('/api/v1/current/data')
            .then(({ data }) => {
                console.log(data.cureset)
                console.log(data.curcounter)
                setState(prevState => ({ ...prevState, cureset: data.cureset, curcounter: data.curcounter, email: data.email }));


            })
            .catch((error) => {
                var variant = 'error';
                console.log(error);

            });
    }
    function resetCounter() {
        if (state.password && confirm("Are you sure you want to reset counter?")) {
            Http.post('/api/v1/reset/counter', { email: state.email, password: state.password })
                .then(({ data }) => {
                    console.log("data.credentials")
                    console.log(data.credentials)

                    if(data.credentials == "success"){

                        // toast.success('Reset Successfull')
                        getData()
                        alert('Reset Successfull')
                    }else{
                        // toast.danger('Reset Failed')
                        alert('Reset Failed')
                    }
                   

                })
                .catch((error) => {
                    var variant = 'error';
                    console.log(error);

                });
        }
    }

    function handleChange(event) {//Sets the value of states
        const { name, value, type } = event.target;
        setState(prevState => ({ ...prevState, [name]: value }));

    }

    const classes = useStyles();
    return (
        <>
   <ToastContainer position="bottom-center" autoClose={500} limit={1} />
            <div className={classes.root} style={{ paddingTop: '5%', paddingLeft: '18%' }}>
         
                {/* <div className={classes.root}> */}
                <Paper elevation={3}>
                    <div style={{ padding: 10 }}>
                        <center>
                            <Typography variant="h3" gutterBottom>
                                Counter Reset
                            </Typography>
                        </center>

                        <hr />
                        <Grid container spacing={3}>
                            <Grid item xs={6}>
                                <PaperDivider desc="Current Reset" value={state.cureset} />
                            </Grid>
                            <Grid item xs={6}>
                                <PaperDivider desc="Current Counter" value={state.curcounter} />
                            </Grid>
                        </Grid>
                        <br />
                        <TextField
                            onChange={handleChange}
                            style={{ width: '100%' }}
                            id="outlined-password-input"
                            label="Input password to reset counter"
                            type="password"
                            name="password"
                            autoComplete="current-password"
                            variant="outlined"
                        />

                        <br />
                        <br />
                        <br />
                        <center>
                            <Button onClick={resetCounter} color="primary" variant="contained">Reset</Button>
                        </center>


                    </div>


                </Paper>
            </div>

        </>
    );
}
