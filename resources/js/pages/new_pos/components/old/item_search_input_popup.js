import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { makeStyles, TextField, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Paper } from '@material-ui/core';
import Draggable from 'react-draggable';
import { shadows } from '@material-ui/system';
import ClearIcon from '@material-ui/icons/Clear';
import ItemTable from './item_search_table';
import ItemTableBasis from './item_search_table_basis';
import PanToolIcon from '@material-ui/icons/PanTool';
import MinimizeIcon from '@material-ui/icons/Minimize';
import SettingsOverscanIcon from '@material-ui/icons/SettingsOverscan';
import update from 'immutability-helper';

import Http from '../../../Http';



function ItemSearchPopUp(props) {

    const useStyles = makeStyles({
        dialog: {
            position: 'absolute',
            right: 0,
            top: 60
        }
    });
    function PaperComponent(props) {
        return (
            <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
                <Paper elevation={2} {...props} />
            </Draggable>
        );
    }
    
    const classes = useStyles();
    const [dialDisp, setDialDisp] = React.useState(true);
    const [open, setOpen] = React.useState(props.open);
    const [selItem, setSelItem] = React.useState([]);
    const [itemData, setItemData] = React.useState([]);
    const [itemDataTemp, setItemDataTemp] = React.useState([]);


    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleDialDisp = () => {
        setDialDisp(!dialDisp);
    };

    const handleClose = () => {
        setOpen(false);
        props.close(false)
    };

    useEffect(() => {

        setOpen(props.open);

    }, [props.open]);

    useEffect(() => {


        Http.get(`/api/v1/newpos/item/stocks`)
            .then(({ data }) => {
                setItemData(data.items);
                setItemDataTemp(data.items);

                console.log(data.items)
            })
            .catch((error) => {

            });


    }, []);



    const handleSearch = (e) => {
        var { value } = e.target;

        value = value.toLowerCase();

        var found = itemDataTemp.filter(function (el) {
            if (
                el.code != null && el.code.toLowerCase().includes(value) ||
                el.name != null && el.name.toLowerCase().includes(value) ||
                el.unit != null && el.unit.toLowerCase().includes(value) ||
                el.meas != null && el.meas.toLowerCase().includes(value)
            ) {
                return el;
            }

        });

        setItemData(found);

    }

    const getNewData = (data) => {



        // setSelItem(ndata)

        // send data to item_search_input
        props.selItem(data)
        // props.selItem(ndata)
        // props.selItem(selItem)


    }



    return (
        <>
            <div>{
              <>
              {dialDisp?
                        <Dialog
                            // open={true}
                            open={open}
                            // style={open}
                            // onClose={handleClose}
                            PaperComponent={PaperComponent}
                            aria-labelledby="draggable-dialog-title"
                            BackdropProps={{ invisible: true }}
                            elevation={6}
                            classes={{
                                paper: classes.dialog
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
                                    onChange={handleSearch}
                                />

                                <ClearIcon onClick={handleClose} style={{ float: "right", cursor: "pointer" }} />
                                <p style={{ float: "right" }}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>
                                <PanToolIcon id="draggable-dialog-title" style={{ float: "right", cursor: 'move' }} />
                                <p style={{ float: "right" }}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>
                                <MinimizeIcon onClick={handleDialDisp} style={{ float: "right", cursor: 'pointer' }} />
                            </DialogTitle>
                            <DialogContent>

                                <DialogContentText>
                                    {/* <ItemTable/> */}
                                    <ItemTableBasis newItem={getNewData} itemData={itemData} />
                                </DialogContentText>
                            </DialogContent>

                        </Dialog>

                      :   

                        <Dialog
                            // open={true}
                            // style={open}
                            open={open}
                            // onClose={handleClose}
                            PaperComponent={PaperComponent}
                            aria-labelledby="draggable-dialog-title"
                            BackdropProps={{ invisible: true }}
                            elevation={6}
                            classes={{
                                paper: classes.dialog
                            }}
                            disableBackdropClick
                            disableEnforceFocus
                            hideBackdrop
                            style={{ position: 'initial', zIndex: '2000 !important' }}


                        >
                            <DialogTitle style={{ cursor: 'move' }} >
                                <ClearIcon onClick={handleClose} style={{ float: "right", cursor: "pointer" }} />
                                <p style={{ float: "right" }}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>
                                <PanToolIcon id="draggable-dialog-title" style={{ float: "right" }} />
                                <p style={{ float: "right" }}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>
                                <SettingsOverscanIcon onClick={handleDialDisp} style={{ float: "right", cursor: 'pointer' }} />
                            </DialogTitle>
                        </Dialog>
            }
           </>
           
            }

        </div>
        </>
    );
}

const mapStateToProps = (state) => ({
    isAuthenticated: state.Auth.isAuthenticated,
});

export default connect(mapStateToProps)(ItemSearchPopUp);
