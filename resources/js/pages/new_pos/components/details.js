import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { makeStyles, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { Grid, TextField } from '@material-ui/core';
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

function Details(props) {
    const classes = useStyles();

    const [amtrec, setAmtRec] = React.useState(0);

    function handleChange(event) {//Sets the value of states
        const { name, value, type } = event.target;
        const subs = {
            name: name,
            value: type == 'number' ? parseFloat(value) : value
        }
        console.log(subs)

        props.newdata(subs)

        if (name == 'amt_received') {
            setAmtRec(parseFloat(value))
        }
        // if (_isMounted) {
        //     setState(prevState => ({ ...prevState, [name]: value }));
        // }
    }

    const formatter = new Intl.NumberFormat('fil', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2
    })

    const formLabelsTheme = createMuiTheme({
        overrides: {
            MuiFormLabel: {
                asterisk: {
                    color: '#db3131',
                    '&$error': {
                        color: '#db3131'
                    },
                }
            }
        }
    })
    useEffect(() => {
        setAmtRec(0)
    }, [props.reset]);

    var getamt = parseFloat(amtrec) + 0;
    var pamt = isNaN(getamt) ? 0 : getamt;
    console.log('pamt')
    console.log(pamt)
    return (
        <>
            <div key={props.reset}>
                <Paper style={{ padding: "2%" }}>
                    <Grid container spacing={2}>
                        {/* <Grid item xs={12}>
                            <TextField onBlur={handleChange} name="cust_name" label="Customer Name" id="standard-basic" variant="outlined" size="small" fullWidth />
                        </Grid> */}

                        <Grid item xs={4}>
                            <TextField onBlur={handleChange} InputProps={{ inputProps: { min: 0 } }} type="number" name="discount" label="Discount" id="standard-basic" variant="outlined" size="small" fullWidth />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField onBlur={handleChange} name="or_no" label="OR No." id="standard-basic" variant="outlined" size="small" fullWidth />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField onBlur={handleChange} name="late_trans_date" InputLabelProps={{ shrink: true }} label="Transaction Date" type="date" id="standard-basic" variant="outlined" size="small" fullWidth />
                        </Grid>
                    </Grid>
                </Paper>
                <br />
                <Paper style={{ padding: "2%" }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                        <TextField onBlur={handleChange} name="cust_name" label="Customer Name" id="standard-basic" variant="outlined" size="small" fullWidth />
                            {/* <TextField onBlur={handleChange} name="dev_address" label="Delivery Address" id="standard-basic" variant="outlined" size="small" fullWidth /> */}
                        </Grid>

                        <Grid item xs={6}>
                        <TextField onBlur={handleChange} name="dev_address" label="Delivery Address" id="standard-basic" variant="outlined" size="small" fullWidth />
                            {/* <TextField onBlur={handleChange} name="cont_no" label="Contact #" id="standard-basic" variant="outlined" size="small" fullWidth /> */}
                        </Grid>
                        <Grid item xs={6}>
                        <TextField onBlur={handleChange} name="cont_no" label="Contact #" id="standard-basic" variant="outlined" size="small" fullWidth />
                            {/* <TextField onBlur={handleChange} InputProps={{ inputProps: { min: 0 } }} type="number" name="devfee" label="Delivery Fee" id="standard-basic" variant="outlined" size="small" fullWidth /> */}
                        </Grid>

                        <Grid item xs={6}>
                            <TextField onBlur={handleChange} name="st_tin_num" label="Customer TIN Number" id="standard-basic" variant="outlined" size="small" fullWidth />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField onBlur={handleChange} InputProps={{ inputProps: { min: 0 } }}  name="st_bus_type" label="Business Type" id="standard-basic" variant="outlined" size="small" fullWidth />
                        </Grid>

                    </Grid>
                </Paper>
                <br />
                <Paper style={{ padding: "2%" }}>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <MuiThemeProvider theme={formLabelsTheme}>
                                {/* <form noValidate autoComplete="off"> */}
                                <TextField InputLabelProps={{ shrink: true }} required onBlur={handleChange} InputProps={{ inputProps: { min: 0 } }} type="number" name="amt_received" label="Cash Received" id="standard-basic" variant="outlined" size="small" fullWidth />
                                {/* </form> */}
                            </MuiThemeProvider>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField label="Change" value={formatter.format(pamt - props.amountdue)} InputLabelProps={{ shrink: true }} disabled id="standard-basic" variant="outlined" size="small" fullWidth />
                        </Grid>


                    </Grid>
                </Paper>
            </div>
        </>
    );
}

const mapStateToProps = (state) => ({
    isAuthenticated: state.Auth.isAuthenticated,
});

export default connect(mapStateToProps)(Details);
