import React, { useEffect } from 'react';
import { makeStyles, TablePagination, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField } from '@material-ui/core';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import update from 'immutability-helper';
var _isMounted = false;




export default function StickyHeadTable(props) {
    _isMounted = true;

    const columns = [
        // { id: 'code', label: 'Code', minWidth: 50 },
        { id: 'name', label: 'Item', minWidth: 200 },
        {
            id: 'brand',
            label: 'Brand',
            minWidth: 80,
            align: 'right',
            format: (value) => value.toLocaleString('en-US'),
        }
        // ,
        // {
        //     id: 'meas',
        //     label: 'Meas.',
        //     minWidth: 80,
        //     align: 'right',
        //     format: (value) => value.toLocaleString('en-US'),
        // }
        ,
        {
            id: 'unit_price',
            label: 'SRP',
            minWidth: 80,
            align: 'right',
            format: (value) => value.toFixed(2),
        },
        {
            id: 'balance',
            label: 'Stock',
            minWidth: 80,
            align: 'right',
            format: (value) => value.toFixed(2),
        }
    
    ];
    
    
    const useStyles = makeStyles({
        root: {
            width: '100%',
        },
        container: {
            maxHeight: 440,
        },
    });

    
    const classes = useStyles();
    const [page, setPage] = React.useState(0);

    const [selItem, setSelItem] = React.useState([]);
    const [selTempItem, setSelTempItem] = React.useState([]);

    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const setItmQty = (value, row) => {



        if (value <= row.balance) {

            row.qty = parseFloat(value);



            setTimeout(function () {
                newData(row)
                //  props.newItem(row)
            }, 500);
            // props.newItem(row)
        } else {
            if (value > row.balance) {
                toast("Insufficient balance")
            }
        }


    }

    const newData = (data) => {
        var ndata = selItem
        var ndataD = selItem


        var exist = "no";
        ndata.map((itemex) => {
            if (itemex.id == data.id) {
                exist = "yes";
            }
        })

        var qtynew = parseFloat(data.qty);
        var id = data.id;

        if (exist == "yes" && !isNaN(qtynew)) {

            

            // console.log("wee")
            // console.log(result)

            // console.log("wee")

            if (!isNaN(qtynew)) {

                var commentIndex = ndata.findIndex(function (c) {
                    return c.id == id;
                });
                var qt = 0;
                console.log("ndata")
                console.log(ndata)
                if (ndata[commentIndex].tempal == "yes") {

                    var result = selTempItem.filter(function (v) {
                        return v.id == id;
                    });
                    console.log(result[0].tempalQty)
                    qt = result[0].tempalQty + parseFloat(qtynew);
                }else{
                    qt = ndata[commentIndex].qty + parseFloat(qtynew);
                }




                var updatedComment = update(ndata[commentIndex], { qty: { $set: qt }, tempal: { $set: "no" } });

                ndataD = update(ndata, {
                    $splice: [[commentIndex, 1, updatedComment]]
                });



                const index = selTempItem.findIndex(
                    (item) => parseInt(id, 10) === parseInt(id, 10),
                );
                var ndataDel = [...selTempItem.slice(0, index), ...selTempItem.slice(index + 1)];
                setSelTempItem(ndataDel)
            }
            // else {
            //     const index = selItem.findIndex(
            //         (item) => parseInt(id, 10) === parseInt(id, 10),
            //     );
            //     var ndata = [...selItem.slice(0, index), ...selItem.slice(index + 1)];
            // }

        } else {
            if (qtynew > 0) {
                var temp = data;
                var tempselTempItem = selTempItem;

                temp.tempal = "yes";
                temp.tempalQty = data.qty;

                ndataD.push(temp)

                tempselTempItem.push(temp);
                console.log("update")

                setSelTempItem(tempselTempItem)

            }



        }


        // props.newItem(ndata)
        // console.log("ndatanew")
        // console.log(ndatanew)
        // console.log("ndatanew")

        if (!isNaN(qtynew)) {
            console.log("what54")
            if (_isMounted) {
                setSelItem(ndataD)
                props.newItem(ndataD)
            }
        }


    }


    // console.log("selTempItemNooo")
    // console.log(selTempItem)
    // console.log("selTempItemNooo")

    // console.log("ndataD")
    // console.log(selItem)
    // console.log("ndataD")


    return (
        <>
            <ToastContainer autoClose={1000} limit={1} />
            <Paper className={classes.root}>
                <TableContainer className={classes.container}>
                    <Table stickyHeader size="small" aria-label="sticky table">
                        <TableHead>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        align={column.align}
                                        style={{ minWidth: column.minWidth }}
                                    >
                                        {column.label}
                                    </TableCell>
                                ))}
                                <TableCell

                                >
                                    Opts
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {props.itemData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                                return (
                                    <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                                        {columns.map((column) => {
                                            const value = row[column.id];
                                            return (
                                                <TableCell key={column.id} align={column.align}>
                                                    {
                                                        // column.id == 'meas' ?
                                                        //     <> { row.size ? row.size : ' ' + ' ' + row.unit} </>
                                                        //     :
                                                        column.id == 'name' ?
                                                            <>
                                                                <small style={{ float: "right" }}>{row.size ? row.size : ' ' + ' ' + row.unit}&nbsp;&nbsp;&nbsp;&nbsp;{row.code}</small><br /><b>{row.name}</b>
                                                            </>
                                                            :
                                                            <> {column.format && typeof value === 'number' ? column.format(value) : value}</>
                                                    }
                                                </TableCell>

                                            );
                                        })}
                                        <TableCell align="right">
                                            <TextField onChange={(e) => setItmQty(e.target.value, row)} style={{ width: 70 }} size="small" label="Qty" variant="outlined" type="number" />
                                        </TableCell>

                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 100]}
                    component="div"
                    count={props.itemData.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onChangePage={handleChangePage}
                    onChangeRowsPerPage={handleChangeRowsPerPage}
                />
            </Paper>
        </>
    );
}


