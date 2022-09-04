import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

const useStyles = makeStyles({
    table: {
        minWidth: 200,
    },
    paper: {
        width: '100%',
    },
});

function createData(name, calories, fat, carbs, protein) {
    return { name, calories, fat, carbs, protein };
}

const rows = [
    createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
    createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
    createData('Eclair', 262, 16.0, 24, 6.0),
    createData('Cupcake', 305, 3.7, 67, 4.3),
    createData('Gingerbread', 356, 16.0, 49, 3.9),
];

export default function TerminalDet(props) {
    const classes = useStyles();

    const formatter = new Intl.NumberFormat('fil', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2
    })

    return (
        <div className={classes.paper}>
            <TableContainer component={Paper} >
                <Table className={classes.table} size="small" aria-label="a dense table">
                    <TableHead>
                        <TableRow>
                            <TableCell colSpan={2}><center>Transaction Details</center></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>

                        <TableRow>
                            <TableCell component="th" scope="row"> Control # </TableCell>
                            <TableCell align="right">{props.ctrlno} </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" scope="row"> Code </TableCell>
                            <TableCell align="right">{props.trans_code} </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" scope="row"> Customer </TableCell>
                            <TableCell align="right">{props.cust_name} </TableCell>
                        </TableRow>
                        {/* <TableRow>
                            <TableCell component="th" scope="row"> Delivery Address </TableCell>
                            <TableCell align="right"> </TableCell>
                        </TableRow> */}
                        <TableRow>
                            <TableCell component="th" scope="row"> Item Payable </TableCell>
                            <TableCell align="right">{formatter.format(isNaN(props.itempayable) ? 0 : props.itempayable)} </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell component="th" scope="row"> Discount </TableCell>
                            <TableCell align="right"> {formatter.format(isNaN(props.discount) ? 0 : props.discount)}</TableCell>
                        </TableRow>
                        <TableRow>
                            {/* <TableCell component="th" scope="row"> Delivery Fee </TableCell>
                            <TableCell align="right">{formatter.format(isNaN(props.devfee) ? 0 : props.devfee)} </TableCell> */} 
                            <TableCell component="th" scope="row"> &nbsp;</TableCell>
                            <TableCell align="right">&nbsp; </TableCell>
                        </TableRow>

                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}
