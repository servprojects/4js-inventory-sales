import React, { useState, useCallback } from 'react';
import { connect } from 'react-redux';
import {
    Grid, makeStyles, TablePagination, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@material-ui/core';
import Http from '../../../Http';
import Draggable from 'react-draggable';
import ClearIcon from '@material-ui/icons/Clear';
import PanToolIcon from '@material-ui/icons/PanTool';
import MinimizeIcon from '@material-ui/icons/Minimize';
import SettingsOverscanIcon from '@material-ui/icons/SettingsOverscan';
import { useEffect } from 'react';
import update from 'immutability-helper';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import InputAdornment from '@material-ui/core/InputAdornment';
var _isMounted = false;


const useStyles_slctd = makeStyles({
    root: {
        width: '100%',
        maxHeight: 380,
    },
    container: {
        height: 320,
        maxHeight: 320,
        // maxHeight: 440,
    },
});

const useStyles_si = makeStyles({
    root: {
        width: '100%',
    },
    container: {
        maxHeight: 440,
    },
});

const useStyles_md = makeStyles({
    dialog: {
        position: 'absolute',
        zIndex: '7 !important',
        right: 0,
        top: 5
    }
});
function PaperComponent_md(props) {
    return (
        <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
            <Paper elevation={2} {...props} />
        </Draggable>
    );
}

const columns_slctd = [
    { id: 'name', label: 'Item', minWidth: 300 },
    { id: 'brand', label: 'Brand', minWidth: 80 },
    {
        id: 'unit_price',
        label: 'SRP',
        minWidth: 40,
        align: 'right',
        format: (value) => value.toLocaleString('en-US'),
    },
    {
        id: 'Quantity',
        label: 'Qty',
        minWidth: 40,
        align: 'center',
        format: (value) => value.toLocaleString('en-US'),
    }
];

const columns_si = [
    { id: 'name', label: 'Item', minWidth: 200 },
    {
        id: 'brand',
        label: 'Brand',
        minWidth: 80,
        align: 'right',
        format: (value) => value.toLocaleString('en-US'),
    }
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

function ItemSelection(props) {

    _isMounted = true;

    // ALL SELECTED


    const classes_md = useStyles_md();
    const classes_slctd = useStyles_slctd();
    const classes_si = useStyles_si();



    const [curItem, setCurItem] = React.useState(0);
    const [indentf, setIndentf] = React.useState(0);
    const [page_si, setPage_si] = React.useState(0);
    const [selItem_si, setSelItem_si] = React.useState([]);
    const [rowsPerPage_si, setRowsPerPage_si] = React.useState(10);
    const [page_slctd, setPage_slctd] = React.useState(0);
    const [rowsPerPage_slctd, setRowsPerPage_slctd] = React.useState(100);
    const [dialDisp_md, setDialDisp_md] = React.useState(true);
    const [open_md, setOpen_md] = React.useState(false);
    // const [itemData_md, setItemData_md] = React.useState([]);
    const [itemDataTemp_md, setItemDataTemp_md] = React.useState([]);

    const [state, setState] = useState({
        itemData_md: [],
    });


    const handleChangePage_slctd = (event, newPage) => {
        setPage_slctd(newPage);
    };

    const handleChangeRowsPerPage_slctd = (event) => {
        setRowsPerPage_slctd(+event.target.value);
        setPage_slctd(0);
    };
    // ALL SELECTED

    // ALL INPUTS



    // ALL INPUTS

    // ALL MODAL



    const handleVisibility_inpt = () => {
        // setOpen_inpt(!open_inpt);
        setOpen_md(!open_md);
    };

    const handleDialDisp_md = () => {
        setDialDisp_md(!dialDisp_md);
    };

    const handleClose_md = () => {
        setOpen_md(false);
        // props.close_md(false)
    };


    // useEffect(() => {
    //     getStockData()
    // }, []);

    useEffect(() => {
        getStockData()
    }, [props.renewItms]);

    useEffect(() => {
        setSelItem_si([])
    }, [props.reset]);


    function getStockData() {
        Http.get(`/api/v1/newpos/item/stocks`)
            .then(({ data }) => {
                // setItemData_md(data.items);
                setState(prevState => ({
                    ...prevState,
                    itemData_md: data.items
                }));
                setItemDataTemp_md(data.items);

                console.log(data.items)
            })
            .catch((error) => {

            });
    }



    const handleSearch_md = (e) => {
        var { value } = e.target;

        value = value.toLowerCase();

        var found = itemDataTemp_md.filter(function (el) {
            if (
                el.code != null && el.code.toLowerCase().includes(value) ||
                el.name != null && el.name.toLowerCase().includes(value) ||
                el.unit != null && el.unit.toLowerCase().includes(value) ||
                el.brand != null && el.brand.toLowerCase().includes(value) ||
                el.meas != null && el.meas.toLowerCase().includes(value)
            ) {
                return el;
            }

        });
        // setItemData_md(found);

        setState(prevState => ({
            ...prevState,
            itemData_md: found
        }));

    }
    // ALL MODAL

    // Search item content

    const handleChangePage_si = (event, newPage) => {
        setPage_si(newPage);
    };

    const handleChangeRowsPerPage_si = (event) => {
        setRowsPerPage_si(+event.target.value);
        setPage_si(0);
    };

    const updateItems = (value, row) => {
        // console.log(value)
        console.log((parseFloat(value) + 0))
        if (!isNaN((parseFloat(value) + 0))) {
            // setTimeout(function () {

            var setter = indentf == 3 ? (0) : (indentf + 1)
            setIndentf(setter)
            setCurItem(row.id)

            var resultSel = selItem_si.filter(function (v) {
                return v.id == row.id;
            })

            var resultItm = state.itemData_md.filter(function (v) {
                return v.id == row.id;
            })

            console.log("resultSel.length")

            if (resultSel.length > 0) {
                console.log(resultSel[0].Quantity)
                if ((resultItm[0].balance + 1) > (resultSel[0].Quantity + parseFloat(value))) {
                    // if ((resultItm[0].balance == 1? resultItm[0].balance :(resultItm[0].balance + 1)) >= (resultSel[0].Quantity + parseFloat(value))) {
                    // setTimeout(function () {
                    newData(value, row)
                    // }, 1000);
                } else {
                    toast.warn("Insufficient Balance ")

                }
            } else {
                newData(value, row)
            }

            // }, 1000);

        }
    }
    const getInpt = (e) => {
        e.target.reset();
        console.log("e")
        console.log(e)
    };

    const updateSelected = (value, id) => {

        if (!isNaN((parseFloat(value) + 0))) {
            var setter = indentf == 3 ? (0) : (indentf + 1)
            setIndentf(setter)
            setCurItem(id)

            var resultSel = selItem_si.filter(function (v) {
                return v.id == id;
            })

            var resultItm = state.itemData_md.filter(function (v) {
                return v.id == id;
            })

            console.log("resultSel.length")
            console.log(resultSel.length)
            if (resultSel.length > 0) {
                if ((resultItm[0].balance + 1) > parseFloat(value)) {
                    // if ( resultItm[0].balance  > resultSel[0].Quantity) {
                    // setTimeout(function () {
                    updata(value, id)
                    // }, 1000);
                } else {
                    toast.warn("Insufficient Balance")

                }
            } else {
                updata(value, id)
            }
        }

    }

    const updata = (value, id) => {
        console.log("received")
        var commentIndex = selItem_si.findIndex(function (c) {
            return c.id == id;
        });

        var updatedComment = update(selItem_si[commentIndex], { Quantity: { $set: parseFloat(value) } });

        var newData = update(selItem_si, {
            $splice: [[commentIndex, 1, updatedComment]]
        });

        setSelItem_si(newData)

        props.selected(newData)
    }


    const newData = (value, row) => {

        value = parseFloat(value) + 0;


        if (!isNaN(value) && value > 0) {

            if (row.balance >= value) {
                console.log("reeess")

                var exist = "no";

                selItem_si.map((itemex) => {
                    if (itemex.id == row.id) {
                        exist = "yes";
                    }
                })

                if (exist == "yes") {
                    console.log("Exist")

                    var commentIndex = selItem_si.findIndex(function (c) {
                        return c.id == row.id;
                    });

                    var result = selItem_si.filter(function (v) {
                        return v.id == row.id;
                    })

                    var updatedComment = update(selItem_si[commentIndex], { Quantity: { $set: parseFloat(result[0].Quantity) + parseFloat(value) } });

                    var newData = update(selItem_si, {
                        $splice: [[commentIndex, 1, updatedComment]]
                    });

                    setSelItem_si(newData)

                    props.selected(newData)

                } else {
                    console.log("no")

                    row.Quantity = value;

                    const allItems = [row, ...selItem_si];
                    // const allItems = [row, ...selItem_si];
                    setSelItem_si(allItems)

                    props.selected(allItems)
                }
            } else {
                toast.warn("Insufficient Balance")
            }

        }

        if (value <= 0) {
            toast.error("Invalid Amount")
        }

    }

    const removeItm = (key) => {

        const index = selItem_si.findIndex(
            (item) => parseInt(item.id, 10) === parseInt(key, 10),
        );
        const remove = [...selItem_si.slice(0, index), ...selItem_si.slice(index + 1)];

        setSelItem_si(remove)

        props.selected(remove)

    }

    const handleReset = ({ res, fields, form }) => {
        form.reset() // resets "username" field to "admin"
    }

    const handleButtonClick = () => {
        this.form.reset() // resets "username" field to "admin"
    }


    function getAmountDue() {
        var amt = 0;
        selItem_si.map((row) => {
            amt += parseFloat(row.Quantity) * parseFloat(row.unit_price)
        })


        return amt;
    }

    // var amountDue = getAmountDue();
    var amountDue = getAmountDue();
    amountDue -= isNaN(props.discount) ? 0 : props.discount;
    amountDue += isNaN(props.devfee) ? 0 : props.devfee;

    useEffect(() => {
        var subs = {
            name: "itempayable",
            value: getAmountDue()
        }

        props.itmpayb(subs)

        var subsamtdue = {
            name: "amountdue",
            value: amountDue
        }

        props.amountdue(subsamtdue)
    }, [amountDue]);

    const formatter = new Intl.NumberFormat('fil', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2
    })

    return (
        <>
            <ToastContainer position="bottom-center" autoClose={1200} limit={1} />
            {/* <div style={{ padding: "10px" }}> */}

            {/* Inputs */}
            <Grid container spacing={3}>
                <Grid item xs={4}>
                    <TextField
                        label="Barcode"
                        id="standard-basic"
                        variant="outlined"
                        size="small"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                    // style={{ width: "30%" }}
                    />
                </Grid>
                <Grid item xs={4}>
                    <TextField
                        // style={{ paddingLeft: "100px" }}
                        id="outlined-start-adornment"
                        size="small"
                        disabled
                        InputProps={{
                            startAdornment: <InputAdornment position="start">Amount Due</InputAdornment>,
                        }}
                        variant="outlined"
                        value={formatter.format(amountDue)}
                    />
                </Grid>
                <Grid item xs={4}>
                    <Button variant="contained" onClick={handleVisibility_inpt} disableElevation style={{
                        border: "none",
                        outline: "none",
                        float: "right"
                    }}>
                        Manual Input
                    </Button>
                </Grid>
            </Grid>
            {/* Inputs */}

            <br /><br />


            {/* Modals */}

            <>
                {dialDisp_md ?
                    <Dialog
                        // open={true}

                        open={open_md}
                        // style={open}
                        // onClose={handleClose}
                        PaperComponent={PaperComponent_md}
                        aria-labelledby="draggable-dialog-title"
                        BackdropProps={{ invisible: true }}
                        elevation={6}
                        classes={{
                            paper: classes_md.dialog
                        }}

                        disableBackdropClick
                        disableEnforceFocus
                        hideBackdrop
                        style={{ position: 'initial', zIndex: '2000 !important' }}
                        fullWidth
                        maxWidth="sm"

                    >
                        <DialogTitle >


                            <TextField
                                label="Search item"
                                id="standard-basic"
                                size="small"
                                fullWidth
                                style={{ width: '50%' }}
                                // onBlur={handleSearch_md}
                                onChange={handleSearch_md}
                            />

                            <ClearIcon onClick={handleClose_md} style={{ float: "right", cursor: "pointer" }} />
                            <p style={{ float: "right" }}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>
                            <PanToolIcon id="draggable-dialog-title" style={{ float: "right", cursor: 'move' }} />
                            <p style={{ float: "right" }}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>
                            <MinimizeIcon onClick={handleDialDisp_md} style={{ float: "right", cursor: 'pointer' }} />
                        </DialogTitle>
                        <DialogContent>

                            <DialogContentText>
                                <Paper className={classes_si.root}>
                                    <TableContainer className={classes_si.container}>
                                        <form>
                                            <Table stickyHeader size="small" aria-label="sticky table">
                                                <TableHead>
                                                    <TableRow>
                                                        {columns_si.map((column) => (
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
                                                    {state.itemData_md.slice(page_si * rowsPerPage_si, page_si * rowsPerPage_si + rowsPerPage_si).map((row) => {
                                                        return (
                                                            <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                                                                {columns_si.map((column) => {
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
                                                                    <span key={row.id == curItem ? indentf : '11'}>  <TextField onBlur={(e) => updateItems(e.target.value, row)} style={{ width: 70 }} size="small" label="Qty" variant="outlined" type="number" /> </span>
                                                                    {/* <TextField onChange={(e) => setItmQty_si(e.target.value, row)} style={{ width: 70 }} size="small" label="Quantity" variant="outlined" type="number" /> */}
                                                                </TableCell>

                                                            </TableRow>
                                                        );
                                                    })}
                                                </TableBody>
                                            </Table>
                                            {/* <Button type="reset">Clear</Button> */}
                                        </form>
                                    </TableContainer>
                                    <TablePagination
                                        rowsPerPageOptions={[10, 25, 100]}
                                        component="div"
                                        count={state.itemData_md.length}
                                        rowsPerPage={rowsPerPage_si}
                                        page={page_si}
                                        onChangePage={handleChangePage_si}
                                        onChangeRowsPerPage={handleChangeRowsPerPage_si}
                                    />
                                </Paper>

                            </DialogContentText>
                        </DialogContent>

                    </Dialog>

                    :

                    <Dialog
                        // open={true}
                        // style={open}
                        open={open_md}
                        // onClose={handleClose}
                        PaperComponent={PaperComponent_md}
                        aria-labelledby="draggable-dialog-title"
                        BackdropProps={{ invisible: true }}
                        elevation={6}
                        classes={{
                            paper: classes_md.dialog
                        }}
                        disableBackdropClick
                        disableEnforceFocus
                        hideBackdrop
                        style={{ position: 'initial', zIndex: '2000 !important' }}


                    >
                        <DialogTitle style={{ cursor: 'move' }} >
                            <ClearIcon onClick={handleClose_md} style={{ float: "right", cursor: "pointer" }} />
                            <p style={{ float: "right" }}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>
                            <PanToolIcon id="draggable-dialog-title" style={{ float: "right" }} />
                            <p style={{ float: "right" }}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>
                            <SettingsOverscanIcon onClick={handleDialDisp_md} style={{ float: "right", cursor: 'pointer' }} />
                        </DialogTitle>
                    </Dialog>
                }
            </>



            {/* Modals */}




            {/* Selected Items */}


            <Paper className={classes_slctd.root}>
                <TableContainer className={classes_slctd.container}>
                    <Table size="small" stickyHeader aria-label="sticky table">
                        <TableHead>
                            <TableRow>
                                {columns_slctd.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        align={column.align}
                                        style={{ minWidth: column.minWidth }}
                                    >
                                        {column.label}
                                    </TableCell>
                                ))}
                                <TableCell

                                    style={{ minWidth: 30, width: 20 }}
                                >
                                    Total
                                </TableCell>
                                <TableCell
                                    style={{ minWidth: 10, width: 10 }}
                                >

                                </TableCell>

                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {selItem_si.slice(page_slctd * rowsPerPage_slctd, page_slctd * rowsPerPage_slctd + rowsPerPage_slctd).map((row) => {
                                return (
                                    <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                                        {columns_slctd.map((column) => {
                                            const value = row[column.id];
                                            return (
                                                <>
                                                    {column.id == "Quantity" ?
                                                        <center key={row.id == curItem ? indentf : '11'}> <TextField style={{ width: 40 }} onBlur={(e) => updateSelected(e.target.value, row.id)} size="small" defaultValue={column.format(value)} label=" " variant="standard" type="number" /> </center>
                                                        :
                                                        <TableCell key={column.id} align={column.align}>
                                                            {column.format && typeof value === 'number' ? column.format(value) : value}
                                                        </TableCell>
                                                    }
                                                </>
                                            );
                                        })}
                                        <TableCell >
                                            {parseFloat(row.Quantity) * parseFloat(row.unit_price)}
                                        </TableCell>
                                        <TableCell >
                                            <RemoveCircleIcon onClick={(e) => removeItm(row.id)} style={{ cursor: "pointer" }} />
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
                    count={selItem_si.length}
                    rowsPerPage={rowsPerPage_slctd}
                    page={page_slctd}
                    onChangePage={handleChangePage_slctd}
                    onChangeRowsPerPage={handleChangeRowsPerPage_slctd}
                />
            </Paper>
            {/* Selected Items */}
            {/* </div> */}
        </>
    );
}

const mapStateToProps = (state) => ({
    isAuthenticated: state.Auth.isAuthenticated,
});

export default connect(mapStateToProps)(ItemSelection);
