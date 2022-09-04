import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../Http';
import classNames from 'classnames';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import { Dropdown, Button, Icon } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import update from 'immutability-helper';
import AllCheques from '../reports/allCheques';
import PrintRemittance from '../prints/printRemittance';
import PrintRemittanceReceipt from '../prints/printRemittanceReceipt';
import ReactToPrint, { PrintContextConsumer } from "react-to-print";
import ExHead from '../prints/excelHeader';
import ReactHTMLTableToExcel from 'react-html-table-to-excel';
import EndSession from '../../pages/endSession';

class Remittance extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);

        // Initial state.
        this.state = {
            remitters: [],
            allpettycash: [],
            allTrans: [],
            cashiers: [],

            cur_cashier: null,
            cur_branch: null,
            cur_cashid: null,
            date: null,
            rt_id: null,
            amount: null,
            accu_enabled: null,
            remarks: null,
            reason: null,
            data_type: null,

            hashuserId: null,
            endOfSession: "no",
            updateAmount: "no"
        };

        // API endpoint.
        this.api = '/api/v1/remit';
    }

    // 

    componentDidMount() {
        this._isMounted = true


        Http.post(`/api/v1/users/cashiers`)
            .then((response) => {
                console.log("users")
                console.log(response.data.users)
                if (this._isMounted) {
                    this.setState({
                        cashiers: response.data.users,
                    });
                }
            })
            .catch(() => {
                toast("Unable to fetch data")
            });






    }
    selectCashier = (e) => {
        const { cashiers } = this.state;
        const { id } = e.target.dataset
        this._isMounted = true

        var result = cashiers.filter(function (v) {
            return v.id == id;
        })

        this.getPettyCash(result[0].id, this.state.date)

        if (this._isMounted) {
            this.setState({
                cur_cashier: result[0].name,
                cur_branch: result[0].branch,
                cur_cashid: result[0].id,
            });
        }
    }

    getPettyCash = (user_id, date) => {
        const subs = {
            user_id: user_id,
            date: date
        }
        Http.post(`/api/v1/getPettyCash`, subs)
            .then((response) => {

                if (this._isMounted) {
                    this.setState({
                        allpettycash: response.data.items,
                    });
                }
            })
            .catch(() => {
                toast("Unable to fetch data")
            });
    }

    deletePetty = (e) => {
        const { id } = e.target.dataset
        if (id) {
            if (confirm("Are you sure you want to proceed?")) {
                Http.post(`/api/v1/destroyPetty`, { id: id })
                    .then((response) => {
                        this.getPettyCash(this.state.cur_cashid, this.state.date)
                        toast("Deleted successfully")
                    })
                    .catch(() => {
                        toast("Unable to fetch data")
                    });
            }
        }
    }
    sendPettyCash = (e) => {
        const subs = {
            amount: this.state.amount,
            user_id: this.state.cur_cashid,
            date: this.state.date
        }
        if (this.state.cur_cashier && this.state.date && this.state.amount) {
            if (confirm('Are you sure you want to proceed?')) {
                Http.post(`/api/v1/storePettyCash`, subs)
                    .then((response) => {
                        toast("Transaction successful")
                        this.getPettyCash(this.state.cur_cashid, this.state.date)
                    })
                    .catch(() => {
                        toast("Transaction Failed")
                    });
            }
        } else {
            toast("Please input valid data")
        }
    }
    identifyCurrentUser = () => {
        this._isMounted = true
        var localTerminal = JSON.parse(localStorage.getItem("user") || "[]");
        if (this.state.hashuserId) {
            if (this.state.hashuserId !== localTerminal.id || !localTerminal) {
                toast("You are no longer logged in, Please close this tab and open again")

                if (this._isMounted) {

                    this.setState({

                        endOfSession: "yes",

                    });
                }

            }
        }

    };
    handleChange = (e) => {
        this._isMounted = true

        const { name, value } = e.target;
        if (this._isMounted) {
            this.setState({ [name]: value });
            if (name == "date") {
                this.getPettyCash(this.state.cur_cashid, value)
            }
        }
    };

    setUpdate = (e) => {
        this._isMounted = true


        if (this._isMounted) {

            this.setState({ updateAmount: this.state.updateAmount == "no" ? "yes" : "no" });
        }
    };
    onBeforeSaveCell = (row, cellName, cellValue) => {
        // console.log("whhhhfd")
        if (Number(cellValue) || cellValue == 0) {
            return true;

        } else {
            toast("Invalid Amount")
            return false;
        }
    }
    // 

    buttonFormatter = (cell, row) => {


        return (<>

            <Icon onClick={this.deletePetty} style={{ cursor: "pointer"}}
                data-id={row.id} size='small' name='trash' />
        </>
        )

    }

    onAfterSaveCell = (row, cellName, cellValue) => {
        const subs = {
            id: row.id,
            amount: cellValue
        }
        if (confirm("Are you sure you want to update amount?")) {
            Http.post(`/api/v1/updatePettyCash`, subs)
                .then((response) => {
                    toast("Transaction successful")
                    this.getPettyCash(this.state.cur_cashid, this.state.date)
                })
                .catch(() => {
                    toast("Transaction Failed")
                });
        }
    }
    render() {

        const cellEditPropMain = {
            // mode: 'click',
            mode: 'dbclick',
            blurToSave: true,
            beforeSaveCell: this.onBeforeSaveCell, // a hook for before saving cell
            afterSaveCell: this.onAfterSaveCell
            // blurToSave: false,
        };

        const { cashiers, allpettycash } = this.state;

        return (
            <>
                <div onClick={this.identifyCurrentUser}>

                    {
                        this.state.hashuserId ?
                            <>
                                {this.state.endOfSession == "yes" ?
                                    <EndSession /> : <></>
                                }
                            </> : <></>
                    }

                    <div className="contentCheque" >

                        <nav aria-label="breadcrumb">
                            <ol class="breadcrumb">
                                <li class="breadcrumb-item active" aria-current="page">Petty Cash </li>
                            </ol>
                        </nav>
                        <ToastContainer />
                        <div style={{ width: "100%" }}>
                            <div class="inline_block" style={{ position: "absolute", width: "100%" }}>


                                <div class="remit_inpts shadow-2xl">

                                    <div class="remit_inpts_cont">
                                        Select Cashier <br /><br />
                                        <table class="table" width="100%">
                                            <tr>
                                                <td scope="col"><b>Name</b></td>
                                                <td scope="col"><b>Role</b></td>
                                                <td scope="col"><b>Branch</b></td>
                                            </tr>

                                            {
                                                cashiers.map((csh, i) => (
                                                    <tr onClick={this.selectCashier} style={{ cursor: "pointer" }} data-id={csh.id}>
                                                        <td data-id={csh.id}>{csh.name}</td>
                                                        <td data-id={csh.id}>{csh.role}</td>
                                                        <td data-id={csh.id}>{csh.branch}</td>
                                                    </tr>
                                                )
                                                )

                                            }
                                        </table>
                                    </div>
                                </div>

                            </div>
                            <div class="inline_block" style={{ position: "absolute", width: "150%", left: "450px" }}>
                                <div class="remit_trans shadow-2xl">
                                    <div class="remit_inpts_cont">

                                        <div style={{ padding: "15px" }}>
                                            <span> <b>Cashier:</b> {this.state.cur_cashier}</span>
                                            <span style={{ float: "right" }} ><b>Branch: </b>{this.state.cur_branch} </span>
                                        </div>
                                        <hr />
                                        <div class="inline_block" style={{ width: "40%" }}>
                                            <div class="input-group mb-3">
                                                <div class="input-group-prepend">
                                                    <span class="input-group-text" id="basic-addon1">Transaction Date</span>
                                                </div>
                                                <input onChange={this.handleChange} type="date" name="date" class="form-control " />
                                            </div>
                                        </div>

                                        <div class="inline_block" style={{ width: "40%", float: "right" }}>


                                            <div class="input-group mb-3 " >
                                                <input onChange={this.handleChange} type="text" class="form-control" name="amount" placeholder="Cash-In Amount" aria-label="Cash-In Amount" aria-describedby="basic-addon2" />
                                                <div class="input-group-append">
                                                    <span onClick={this.sendPettyCash} style={{ cursor: "pointer" }} class="input-group-text" id="basic-addon2">Cash In</span>
                                                </div>
                                            </div>
                                        </div>
                                        <BootstrapTable
                                            ref='table'
                                            data={allpettycash}
                                            pagination={true}
                                            search={true}
                                            cellEdit={this.state.updateAmount == "no" ? {} : cellEditPropMain}
                                        >
                                            <TableHeaderColumn dataField='id' isKey={true} hidden={true}></TableHeaderColumn>
                                            <TableHeaderColumn dataField='actual_date'>Date</TableHeaderColumn>
                                            <TableHeaderColumn dataField='amount' >Amount</TableHeaderColumn>
                                            <TableHeaderColumn dataField='type' >Type</TableHeaderColumn>
                                            <TableHeaderColumn dataFormat={this.buttonFormatter} width="50" ></TableHeaderColumn>
                                        </BootstrapTable>
                                        <Button style={{ float: "right" }} primary={this.state.updateAmount == "no" ? false : true} onClick={this.setUpdate}>Update Amounts</Button>
                                    </div>

                                </div>
                            </div>
                            <br />
                            <br />

                        </div>

                    </div >
                </div>
            </>
        );
    }
}

const mapStateToProps = (state) => ({
    isAuthenticated: state.Auth.isAuthenticated,
    user: state.Auth.user,
});

export default connect(mapStateToProps)(Remittance);
