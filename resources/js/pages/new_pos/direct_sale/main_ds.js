import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';
import NewPos from '../components/new_pos';
// import ItemSearchInput from '../components/item_search_input';
// import SelectedItems from '../components/selected_items';
import ItemSelection from '../components/item_selection';

import { makeStyles, Button } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Details from '../components/details';
import TransDet from './transaction_details';
import TerminalDet from './terminal_details';
import Http from '../../../Http';
import ConfirmContent from '../components/confirmContent';
import { useReactToPrint } from 'react-to-print';
import { ComponentToPrint } from '../components/receipt/sale_receipt';
import POSOptGrp from '../components/pos_opt_group';

var _isMounted = false;
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

function MainDS(props) {
    _isMounted = true;
    const classes = useStyles();

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    var hours = today.getHours();

    const componentRef = useRef();
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    var min = 100;
    var max = 999;
    var random = Math.floor(Math.random() * (+max - +min)) + +min;

    const [state, setState] = useState({
        discount: 0,
        devfee: 0,
        amountdue: 0,
        itempayable: 0,
        cust_name: null,
        selected_itms: [],
        or_no: null,
        late_trans_date: null,
        dev_address: null,
        cont_no: null,
        amt_received: null,
        trans_code: null,
        st_tin_num: null,
        st_bus_type: null,
        hours: hours,
        user_name: null,
        branch: null,
        uid: null,
        brid: null,
        resetCtr: 0,
        confVis: false,
        renewItms: 0,
        ctrlno: 0,
        served: 0,
        totalSale: 0
    });





    today = yyyy + '-' + mm + '-' + dd;

    useEffect(() => {

        getTerminalData()
        getCtrlNo()
        getServedDet()

    }, []);

    function getTerminalData() {
        Http.get(`/api/v1/newpos/current/user`)
            .then(({ data }) => {
                // console.log(data)
                // setItemData_md(data.items);
                setState(prevState => ({
                    ...prevState,
                    user_name: data.userdet[0].first_name + ', ' + data.userdet[0].last_name,
                    uid: data.userdet[0].id,
                    branch: data.userdet[0].branch,
                    brid: data.userdet[0].branch_id,
                    trans_code: "TR" + data.userdet[0].id + data.userdet[0].branch_id + mm + dd + yyyy + state.hours + random,

                }));

            })
            .catch((error) => {

            });
    }
    function getCtrlNo() {
        Http.post(`/api/v1/newpos/ctrlno`)
            .then(({ data }) => {

                setState(prevState => ({
                    ...prevState,
                    ctrlno: data.ctrlno,

                }));

            })
            .catch((error) => {

            });
    }

    function getServedDet() {
        Http.post(`/api/v1/newpos/serveddet`)
            .then(({ data }) => {

                setState(prevState => ({
                    ...prevState,
                    served: data.served,
                    totalSale: data.total_sales,

                }));

            })
            .catch((error) => {

            });
    }

    function generateCode() {
        return "TR" + state.uid + state.brid + mm + dd + yyyy + state.hours + random;
    }

    function setConVisibility(data) {
        if (_isMounted) {
            setState(prevState => ({ ...prevState, confVis: !state.confVis }));
        }
    }



    function handleChange(data) {//Sets the value of states

        console.log("data")
        console.log(data)
        var today = new Date();
        var hours = today.getHours();
        if (_isMounted) {
            setState(prevState => ({ ...prevState, [data.name]: data.value, hours: hours }));
        }
    }

    function getSelected(data) {
        if (_isMounted) {
            setState(prevState => ({ ...prevState, selected_itms: data }));
        }

    }

    console.log("state.selected_itms")
    console.log(state.selected_itms)

    function main() {


        function allInput() {
            const subs = {
                receipt_code: state.or_no,
                transaction_type: "Sale",
                accountability: "Customer",
                discount: state.discount,
                customer_name: state.cust_name ? state.cust_name : 'Not Specified',
                amount_received: state.amt_received,
                trasaction_code: state.trans_code,
                // date_printed: this.state.live_date,
                date_transac: state.late_trans_date ? state.late_trans_date : today,
                payable: state.amountdue,
                partial: null,
                pc_code: null,
                delivery_fee: state.devfee,
                address: state.dev_address,
                contact: state.cont_no,
                uId: state.uid,
                project_id: null,
                customer_id: null,
                office_id: null,
                items: JSON.stringify(state.selected_itms),
                st_tin_num: state.st_tin_num,
                st_bus_type: state.st_bus_type,

                curCtrlno: state.ctrlno,
                cashier: state.user_name,
                itemPayable: state.itempayable
            }

            return subs;
        }



        function reset() {
            if (confirm("Are you sure you want to reset the transaction? All data will be cleared.")) {
                if (_isMounted) {
                    resetIntials()
                }
            }
        }

        function confirmResponse(data) {
            if (data == 200) {
                // handlePrint()
                resetIntials()
                getCtrlNo()
                getServedDet()

            }

            setState(prevState => ({ ...prevState, renewItms: state.renewItms == 3 ? (0) : (state.renewItms + 1) }));
        }

        function resetIntials() {
            var setter = state.resetCtr == 3 ? (0) : (state.resetCtr + 1);
            setState(prevState => ({
                ...prevState,
                discount: 0,
                devfee: 0,
                amountdue: 0,
                itempayable: 0,
                cust_name: null,
                selected_itms: [],
                or_no: null,
                late_trans_date: null,
                dev_address: null,
                cont_no: null,
                amt_received: null,
                st_tin_num: null,
                st_bus_type: null,
                trans_code: generateCode(),
                hours: hours,
                resetCtr: setter
            }));
        }


        var disable = true;

        if (state.selected_itms.length > 0 && state.amt_received && (state.amt_received - state.amountdue) >= 0) {
            disable = false
        }


        console.log("allInput()")
        console.log(allInput())
        console.log(state.selected_itms)

        return (
            <>
                <Grid key="right" item xs={7} >
                    <Paper className={classes.paper} style={{ padding: '10px' }} >

                        <ItemSelection renewItms={state.renewItms} reset={state.resetCtr} selected={getSelected} itmpayb={handleChange} amountdue={handleChange} discount={state.discount} devfee={state.devfee} />
                        <br />
                        <Grid container spacing={3}>
                            <Grid item xs={5}>
                                <TransDet ctrlno={state.ctrlno} trans_code={state.trans_code} cust_name={state.cust_name} itempayable={state.itempayable} discount={state.discount} devfee={state.devfee} />
                            </Grid>
                            <Grid item xs={5}>
                                <TerminalDet served={state.served} totalsale={state.totalSale} curdate={today} latedate={state.late_trans_date} user_name={state.user_name} branch={state.branch} />
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
                <Grid key="left" item xs={5}  >
                    <Paper className={classes.paper} >
                        <div style={{ padding: "1.5% 1% 1% 1%" }}>
                            <Details reset={state.resetCtr} newdata={handleChange} amountdue={state.amountdue} />
                            <br />
                            <Grid container spacing={3}>
                                <Grid item xs={6}>
                                    <Button onClick={reset} size="large" style={{ float: "right", border: "none", outline: "none" }} variant="contained" color="secondary">
                                        CANCEL
                                    </Button>
                                </Grid>
                                <Grid item xs={6}>
                                    <Button disabled={disable} onClick={setConVisibility} size="large" style={{ float: "left", border: "none", outline: "none" }} variant="contained" color="primary">
                                        TRANSACT
                                    </Button>
                                    <ConfirmContent disableProc={disable} response={confirmResponse} data={allInput()} itms={state.selected_itms} visibility={state.confVis} setvis={setConVisibility} />
                                </Grid>
                            </Grid>
                            <hr/>
                           <div style={{float: 'right'}}> <POSOptGrp /></div>


                        </div>
                    </Paper>
                </Grid>
            </>
        )
    }

    return (
        <>
            <NewPos main={main()} />

        </>
    );
}

const mapStateToProps = (state) => ({
    isAuthenticated: state.Auth.isAuthenticated,
});

export default connect(mapStateToProps)(MainDS);
