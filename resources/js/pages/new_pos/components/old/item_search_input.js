import React from 'react';
import { connect } from 'react-redux';
import { TextField } from '@material-ui/core';
import ItemSearchPopup from './item_search_input_popup';
import Button from '@material-ui/core/Button';
function ItemSearchInput(props) {
    // const [open, setOpen] = React.useState({visibility: "hidden"});
    const [open, setOpen] = React.useState(false);


    const handleClickOpen = () => {
        setTimeout(() => {
            setOpen(true);
        }, 1000);

    };

    
    const handleVisibilityOpen = () => {
        setOpen({visibility: "visible"});
    };

    const handleVisibilityClose = () => {
        setOpen({visibility: "hidden"});
    };

 const handleVisibility = () => {
        setOpen(!open);
    };

    const getSelectedItems = (data)=>{
        
        // send data to main module
        props.selItem(data)
    }

    return (
        <>
            <div>


                <TextField
                    label="Barcode"
                    // id="outlined-size-small"
                    id="standard-basic"
                    variant="outlined"
                    size="small"
                    fullWidth
                    // onChange={open == false ? handleClickOpen : {}}
                    InputLabelProps={{ shrink: true }}
                    style={{ width: "70%" }}
                />
               
                <Button variant="contained" onClick={handleVisibility} disableElevation style={{
                    border: "none",
                    outline: "none",
                    float: "right"
                }}>
                    Manual Input
                </Button>
                <ItemSearchPopup open={open} style={open} close={handleVisibility} selItem={getSelectedItems} /> 
                {/* {open ? <ItemSearchPopup open={open} close={handleVisibility} selItem={getSelectedItems} /> : <></>} */}




            </div>

        </>
    );
}

const mapStateToProps = (state) => ({
    isAuthenticated: state.Auth.isAuthenticated,
});

export default connect(mapStateToProps)(ItemSearchInput);
