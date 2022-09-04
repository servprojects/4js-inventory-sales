import React, { useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import {
    Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Slide, makeStyles, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Paper, LinearProgress
} from '@material-ui/core';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Http from '../../../Http';
import { useReactToPrint } from 'react-to-print';
import  ComponentToPrint  from './receipt/sale_receipt';
// import { ComponentToPrint } from './receipt/sale_receipt';


const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const useStyles = makeStyles({
    table: {
        minWidth: 750,
    },
});


function ConfirmCont(props) {
    const classes = useStyles();
    const [open, setOpen] = React.useState(false);
    const [time, setTime] = React.useState('00:00');
    const [disableProc, setDisableProc] = React.useState(props.disableProc);
    const [loading, setLoading] = React.useState(null);

    const componentRef = useRef();
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });


    const handleClose = () => {
        props.setvis('')
        setOpen(false);
    };
    var total = 0;
    const formatter = new Intl.NumberFormat('fil', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2
    })
    const amountStyle = { textAlign: 'left' }



    function submit() {
        console.log("Submit")
        console.log(props.data)
        setDisableProc(true)
        setLoading(true)
        Http.post(`/api/v1/newpos/save`, props.data)
            .then(({ data }) => {
                if (data.validation == 200) {
                 
                    setTime(data.sys_date_time)
                    handlePrint()
                    
                    props.setvis('')
                    props.response(200);

                    setDisableProc(false)
                    setLoading(null)
                    toast.success("Transaction Successful")
                } else {
                    toast.warning(data.message)

                    setDisableProc(false)
                    setLoading(null)
                }


            })
            .catch((error) => {
                toast.danger('Transaction failed')
                setDisableProc(false)
            });

    }

    useEffect(() => {
        setDisableProc(props.disableProc)
    }, [props.disableProc]);


   

    return (
        <>
            <div>
                <div style={{ display: "none" }}><ComponentToPrint items={props.itms} time={time} data={props.data} ref={componentRef} /></div>
                <ToastContainer position="bottom-center" autoClose={500} limit={1} />
                {/* <Button variant="outlined" color="primary" onClick={handleClickOpen}>
                    Slide in alert dialog
                </Button> */}
                <Dialog
                    open={props.visibility}
                    TransitionComponent={Transition}
                    keepMounted
                    fullWidth={true}
                    maxWidth='md'
                    onClose={handleClose}
                    aria-labelledby="alert-dialog-slide-title"
                    aria-describedby="alert-dialog-slide-description"
                >
                    <DialogTitle id="alert-dialog-slide-title">
                        {loading ? <LinearProgress /> : <></>}
                        {"Review Transaction"}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-slide-description">


                            <center>
                                <Paper style={{ width: '45%', padding: '2%', color: '#696969' }} elevation={3} >
                                    <Table style={{ width: '100%' }} >
                                        <tr >
                                            <td><h2>Amount Due </h2> </td>
                                            <td><h2>:</h2> </td>
                                            <td style={amountStyle}><h2>{formatter.format(props.data.payable)}</h2> </td>
                                        </tr>
                                        <tr>
                                            <td><h2>Cash Received </h2> </td>
                                            <td><h2>:</h2> </td>
                                            <td style={amountStyle}><h2>{formatter.format(props.data.amount_received)}</h2> </td>
                                        </tr>
                                        <tr>
                                            <td><h2>Change</h2> </td>
                                            <td><h2>:</h2> </td>
                                            <td style={amountStyle}><h2>{formatter.format(props.data.amount_received - props.data.payable)}</h2> </td>
                                        </tr>
                                    </Table>
                                </Paper>
                            </center>
                            <br />
                            <TableContainer component={Paper}>
                                <Table className={classes.table} size="small" aria-label="simple table dense">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Item</TableCell>
                                            <TableCell align="right">Brand</TableCell>
                                            <TableCell align="right">SRP</TableCell>
                                            <TableCell align="right">QTY</TableCell>
                                            <TableCell align="right">Total</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>

                                        {props.itms.map((row) => (
                                            <>
                                                <p style={{ display: 'none' }}>{total += parseFloat(row.Quantity) * parseFloat(row.unit_price)}</p>
                                                <TableRow key={row.name}>
                                                    <TableCell component="th" scope="row">
                                                        {row.name}
                                                    </TableCell>
                                                    <TableCell align="right">{row.brand}</TableCell>
                                                    <TableCell align="right">{row.unit_price}</TableCell>
                                                    <TableCell align="right">{row.Quantity}</TableCell>
                                                    <TableCell align="right"> {parseFloat(row.Quantity) * parseFloat(row.unit_price)}</TableCell>
                                                </TableRow>
                                            </>
                                        ))}
                                        <TableRow>
                                            <TableCell align="right"></TableCell>
                                            <TableCell align="right"></TableCell>
                                            <TableCell align="right"></TableCell>
                                            <TableCell align="right"><b>Total</b></TableCell>
                                            <TableCell align="right">{formatter.format(total)}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <br />
                            <TableContainer component={Paper}>
                                <Table className={classes.table} size="small" aria-label="simple table dense">
                                    <TableBody>
                                        <TableRow><TableCell>Discount</TableCell><TableCell>{formatter.format(!isNaN(props.data.discount) ? props.data.discount : 0)}</TableCell></TableRow>
                                        {/* <TableRow><TableCell>Delivery Fee</TableCell><TableCell>{formatter.format(props.data.delivery_fee)}</TableCell></TableRow> */}
                                        <TableRow><TableCell>Customer Name</TableCell><TableCell >{props.data.customer_name}</TableCell></TableRow>
                                        <TableRow><TableCell>Date of Transaction</TableCell><TableCell>{props.data.date_transac}</TableCell></TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>







                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="primary">
                            Revise
                        </Button>
                        {/* <Button  disabled={props.disableProc} onClick={submit} focus color="primary"> */}
                        <Button disabled={disableProc} onClick={submit} focus color="primary">
                            Proceed
                        </Button>

                    </DialogActions>
                </Dialog>
            </div>
        </>
    );
}

const mapStateToProps = (state) => ({
    isAuthenticated: state.Auth.isAuthenticated,
});

export default connect(mapStateToProps)(ConfirmCont);
