import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../Http';
import classNames from 'classnames';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import { Dropdown, Button } from 'semantic-ui-react';
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
            allTrans: [],
            branches: [],
            date: null,
            rt_id: null,
            amount: null,
            initial: null,
            initialCash: null,
            accu_enabled: null,
            remarks: null,
            reason: null,
            data_type: null,
            branch_name: null,

            hashuserId: null,
            showBranch: null,
            endOfSession: "no"
        };

        // API endpoint.
        this.api = '/api/v1/remit';
    }

    // 

    componentDidMount() {
        this._isMounted = true
        const { type, rem_id, date, amt, remark } = this.props.location.state;

        Http.post(`/api/v1/user/hash`)
            .then((response) => {
                if (this._isMounted) {
                    this.setState({
                        hashuserId: response.data.hashuserId,
                    });

                }

            })

            .catch(() => {
                if (this._isMounted) {
                    this.setState({
                        error: 'Unable to fetch data.',
                    });
                }
            });


        Http.get(this.api)
            .then((response) => {
                if (this._isMounted) {
                    this.setState({
                        remitters: response.data.remitters,
                        hashuserId: response.data.hashuserId,
                    });

                }

            })

            .catch(() => {
                if (this._isMounted) {
                    this.setState({
                        error: 'Unable to fetch data.',
                    });
                }
            });

        Http.get(`/api/v1/branch`)
            .then((response) => {
                // const { data } = response.data;
                if (this._isMounted) {
                    this.setState({
                        branches: response.data.branches,
                    });
                }
            })
            .catch(() => {
                this.setState({
                    error: 'Unable to fetch data.',
                });
            });


        if (type == "update") {
            const subs = {
                // id: this.state.rt_id,
                id: rem_id,
                date: date
            }

            Http.post(`/api/v1/remit/transactions`, subs)
                .then((response) => {
                    toast("Fetch complete")
                    if (this._isMounted) {
                        this.setState({
                            allTrans: response.data.transactions,
                            amount: amt,
                            remarks: remark,
                            hashuserId: response.data.hashuserId,
                            // cheque_code: null,
                            // bank: null,
                            // payee: null,
                            // chq_date: null,
                            // supplier_id: null,
                            // rt_id: null,
                        });
                    }
                    // this.addForm.reset();

                })
                .catch(() => {
                    if (this._isMounted) {

                        toast("Failed to fetch records")
                    }
                });
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
    reset = (e) => {
        this._isMounted = true
        if (this._isMounted) {
            this.setState({ name: null, location: null });
        }

    };

    handleChange = (e) => {
        this._isMounted = true

        const { name, value } = e.target;
        if (this._isMounted) {
            this.setState({ [name]: value });

        }
    };

    myChangeHandlerRmt = (e, { value }) => {
        this._isMounted = true
        if (this._isMounted) {
            this.setState({ rt_id: value, accu_enabled: null, showBranch: null })
        }
        const subs = {
            // id: this.state.rt_id,
            id: value,
            date: this.state.date,
            showBranch: null,
            branch_name: null
        }

        // this.getCFTrans(subs);

        this.getNoCFTrans(subs)

    };


    myChangeHandlerBrch = (e, { value }) => {
        this._isMounted = true
        // if (this._isMounted) {
        //     this.setState({ rt_id: value, accu_enabled: null })
        // }
        // const subs = {
        //     // id: this.state.rt_id,
        //     id: value,
        //     date: this.state.date,
        //     showBranch: null
        // }

        // this.getCFTrans(subs);

        // this.getNoCFTrans(subs)

        const subs = {
            date: this.state.date,
            branch_id: value
        }
        console.log("branch remit accu")
        console.log(subs)
        this.getNoCFTransAccu(subs);

    };
    changePrintOpt = (e, { value }) => {
        this._isMounted = true
        if (value == "regular") {
            this.regularPrint.handlePrint();//PRINT
        } else {
            this.receiptPrint.handlePrint();//PRINT

        }

    };

    getCFTrans = (subs) => {
        this._isMounted = true
        Http.post(`/api/v1/remit/transactions`, subs)
            .then((response) => {
                toast("Fetch complete")
                if (this._isMounted) {
                    this.setState({
                        allTrans: response.data.transactions,
                        data_type: "With Cash flow",
                        // cheque_code: null,
                        // bank: null,
                        // payee: null,
                        // chq_date: null,
                        // supplier_id: null,
                        // rt_id: null,
                    });
                }
                // this.addForm.reset();

            })
            .catch(() => {
                if (this._isMounted) {

                    toast("Error fetching")
                }
            });

    }

    btn_getCFTrans = () => {
        this._isMounted = true

        const subs = {
            // id: this.state.rt_id,

            id: this.state.rt_id,
            date: this.state.date
        }

        this.getCFTrans(subs);

    }

    btn_Accumulated = () => {
        this._isMounted = true


        if (this._isMounted) {
            this.setState({ rt_id: null, accu_enabled: "yes", showBranch: "yes" })
        }

        // const subs = {
        //     date: this.state.date
        // }
        // console.log(subs)
        // this.getNoCFTransAccu(subs);
        // 
    }

    getNoCFTrans = (subs) => {


        this._isMounted = true

        // const subs = {
        //     // id: this.state.rt_id,

        //     id: this.state.rt_id,
        //     date: this.state.date
        // }

        Http.post(`/api/v1/remit/transactions/nocf`, subs)
            .then((response) => {
                toast("Fetch complete")
                if (this._isMounted) {
                    var incash = response.data.initial;
                    this.setState({
                        allTrans: response.data.transactions,
                        initialCash: incash.length > 0 ?incash[0].initial :0 ,
                        data_type: "No Cash flow",
                        // cheque_code: null,
                        // bank: null,
                        // payee: null,
                        // chq_date: null,
                        // supplier_id: null,
                        // rt_id: null,
                    });
                }
                // this.addForm.reset();

            })
            .catch(() => {
                if (this._isMounted) {
                    this.setState({
                        allTrans: [],
                        initialCash: 0
                    });
                    toast("Error fetching")
                }
            });

    }


    getNoCFTransAccu = (subs) => {


        this._isMounted = true

        // const subs = {
        //     // id: this.state.rt_id,

        //     id: this.state.rt_id,
        //     date: this.state.date
        // }

        // branch_name
        var branches = this.state.branches;
        var result = branches.filter(function (v) {
            return v.id == subs.branch_id;
        })

        Http.post(`/api/v1/remit/transactions/accumulated`, subs)
            .then((response) => {
                toast("Fetch complete")
                if (this._isMounted) {
                    var incash = response.data.initial;
                    this.setState({
                        allTrans: response.data.transactions,
                        initialCash: incash.length > 0 ?incash[0].initial :0,
                        data_type: "No Cash flow",
                        branch_name: result[0].name
                        // cheque_code: null,
                        // bank: null,
                        // payee: null,
                        // chq_date: null,
                        // supplier_id: null,
                        // rt_id: null,
                    });
                }
                // this.addForm.reset();

            })
            .catch(() => {
                if (this._isMounted) {
                    this.setState({
                        allTrans: [],
                        initialCash: 0
                    });
                    toast("Error fetching")
                }
            });

    }





    handleSubmit = (e) => {
        const { type, rem_id, date, amt, id } = this.props.location.state;
        this._isMounted = true
        const { sysamount } = e.target.dataset;
        const { allTrans } = this.state;
        e.preventDefault();

        const subs = {

            date: this.state.date,
            remark: this.state.remarks,
            remitter_id: this.state.rt_id,
            amount_remitted: this.state.amount,
            sys_amount: sysamount,

        }

        if (allTrans === undefined || allTrans.length == 0) {
            toast("Make sure your data is complete")
        } else {

            if (type == "update") {
                const subs = {
                    id: id,
                    date: this.state.date,
                    remark: this.state.remarks,
                    amt: this.state.amount,
                    reason: this.state.reason,
                }

                if (confirm("Are you sure you want to update remittance?")) {
                    this.updateRemit(subs);
                }
            } else {
                const subs = {

                    date: this.state.date,
                    remark: this.state.remarks,
                    remitter_id: this.state.rt_id,
                    amount_remitted: this.state.amount,
                    sys_amount: sysamount,

                }

                if (confirm("Are you sure you want to record remittance?")) {
                    this.submitRemit(subs);
                }
            }


        }

    };

    submitRemit = (request) => {

        this._isMounted = true
        // request.preventDefault();
        console.log("request")
        console.log(request)

        Http.post(this.api, request)
            .then((response) => {
                toast("Remittance successfully recorded")
                if (this._isMounted) {
                    this.setState({
                        // allTrans: [],
                        date: null,
                        rt_id: null,
                        amount: null,
                        remarks: null,
                    });
                }
                this.remitForm.reset();

            })
            .catch(() => {
                if (this._isMounted) {

                    toast("Error recording remittance")
                }
            });
    };

    updateRemit = (request) => {

        this._isMounted = true
        // request.preventDefault();


        Http.post('/api/v1/remit/update', request)
            .then((response) => {
                toast("Remittance successfully udpated")


            })
            .catch(() => {
                if (this._isMounted) {

                    toast("Error updating remittance")
                }
            });
    };








    handleExportCSVButtonClick = (onClick) => {
        onClick();
    }
    createCustomExportCSVButton = (onClick) => {
        return (
            <div>
                <ExportCSVButton
                    btnText=' '
                    onClick={() => this.handleExportCSVButtonClick(onClick)} />
              &nbsp; &nbsp; &nbsp; &nbsp;
                <button class="ui button" tabindex="0" data-toggle="modal" data-target="#myModal">
                    Add New PDC
              </button>


            </div>
        );
    }




    // this.payprt.handlePrint();//PRINT

    rowClassNameFormat = (row, rowIdx) => {
        // row is whole row object
        // rowIdx is index of row

        var datesys = new Date(row.date);
        var sysdate = datesys.getUTCDate();

        var datestate = new Date(this.state.date);
        var statedate = datestate.getUTCDate();

        return sysdate != statedate ? 'tr-style-deleted' : ' ';
    }

    render() {

        const { type, path, date, rem_id, amt, remark, branch_name } = this.props.location.state;


        // const { remitters, allTrans, rt_id } = this.state;
        var { remitters, allTrans, rt_id, branches } = this.state;
        // const {  data, error, loading } = this.state;

        const formatter = new Intl.NumberFormat('fil', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2
        })
        const columnHover = (cell, row, enumObject, rowIndex) => {
            return cell
        }
        const options = {
            exportCSVBtn: this.createCustomExportCSVButton,
            addCheque: this.createPDC
        };

        const req_inpt = { width: "100%", };
        var totalRec = 0;
        var totalRecIn = 0;
        var initialCash = 0;
        var withdrawals = 0;

        allTrans.map((index) => {
            if (index.type != null) {
                var datesys = new Date(index.date);
                var sysdate = datesys.getUTCDate();

                var datestate = new Date(this.state.date);
                var statedate = datestate.getUTCDate();

                // if (sysdate == statedate) { //5-4-2021
                    totalRec += index.payable
                // }
            }

            if (index.trans_type == "Cash In" && index.type == null) {
                initialCash += index.payable
            }

            if (index.trans_type == "Cash Out" && index.type == null) {
                withdrawals += index.payable
            }

        }

        );

        totalRecIn = totalRec  + this.state.initialCash ; //5-4-2021

        var diff = 0;

        if (this.state.amount) {
            diff = this.state.amount - totalRecIn;
            // diff = this.state.amount - totalRec; 5-4-2021
        }

        const rmts = remitters.map((index) => ({ key: index.id, value: index.id, text: index.first_name.concat('\xa0\xa0\xa0', index.last_name) }));
        var emp_name = " ";
        var branch = " ";


        if (type == "update") {
            rt_id = rem_id;
        }

        var result = remitters.filter(function (v) {
            return v.id == rt_id;
        })

        result.map((index) => (emp_name = index.first_name.concat('\xa0\xa0\xa0', index.last_name)));

        if (type == "udpate") {
            branch = branch_name;
        } else {
            result.map((index) => (branch = index.branch));
        }


        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!
        var yyyy = today.getFullYear();
        if (dd < 10) {
            dd = '0' + dd
        }
        if (mm < 10) {
            mm = '0' + mm
        }

        today = yyyy + '-' + mm + '-' + dd;

        var fdate = type == "update" ? date : this.state.date;
        var filename;
        filename = "Remittance - " + branch + "_" + emp_name + fdate;

        const printOptions = [
            { key: '1', text: 'Regular Printer', value: 'regular' },
            { key: '2', text: 'Receipt Printer', value: 'receipt' },
        ]

        var salestoday = []
        var cutoffsales = []
        allTrans.map((v) => {

            var datesys = new Date(v.date);
            var sysdate = datesys.getUTCDate();

            var datestate = new Date(this.state.date);
            var statedate = datestate.getUTCDate();


            if (sysdate == statedate) {
                salestoday.push(v)
            }

            if (sysdate != statedate) {
                cutoffsales.push(v)
            }


        })
        console.log("initial")
        console.log(this.state.initial)
        const allBranch = branches.map((index) => ({ key: index.id, value: index.id, text: index.name }));
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
                                <li class="breadcrumb-item active" aria-current="page">Remittance </li>
                            </ol>
                        </nav>
                        <ToastContainer />
                        <div style={{ width: "100%" }}>
                            <div class="inline_block" style={{ position: "absolute", width: "100%" }}>

                                {
                                    type == "update" ?
                                        <>
                                            <Link to={{ pathname: path, state: { type: "update", path: "/report/remittance" } }}>
                                                <Button>Back</Button>
                                            </Link>
                                            <br />
                                            <br />
                                        </>
                                        : <></>
                                }
                                <div class="remit_inpts shadow-2xl">

                                    <div class="remit_inpts_cont">

                                        <form class="form-inline "
                                            // method="post"
                                            data-sysamount={totalRec}
                                            onSubmit={this.handleSubmit}
                                            ref={(el) => {
                                                this.remitForm = el;
                                            }}
                                        >
                                            <table style={{ width: "100%" }} >
                                                <tr>
                                                    <td>

                                                        Date of transaction <br />
                                                        <input required type="date" disabled={type == "update" ? true : false} defaultValue={type == "update" ? date : null} name="date" max={today} style={req_inpt} class="form-control mb-2 mr-sm-2" onBlur={this.handleChange} />

                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        Remitter
                                                    <Dropdown type="select" fluid search selection balance
                                                            defaultValue={type == "update" ? rem_id : null}
                                                            disabled={type == "update" ? true : false}
                                                            onChange={this.myChangeHandlerRmt}
                                                            options={rmts}
                                                            class="form-control form-control-lg "
                                                            required
                                                            clearable={true}
                                                        />

                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        Amount Remitted
                                                     <br />
                                                        <input defaultValue={type == "update" ? amt : null} required type="number" step=".01" name="amount" class="form-control mb-2 mr-sm-2" onBlur={this.handleChange} style={req_inpt} />


                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        Remarks
                                                    <br />
                                                        <textarea defaultValue={type == "update" ? remark : null} name="remarks" onBlur={this.handleChange} class="form-control" rows="5" style={req_inpt} >

                                                        </textarea>
                                                        {/* <input required type="number" name="amount" class="form-control mb-2 mr-sm-2" onChange={this.handleChange} style={req_inpt} /> */}
                                                        <br />
                                                        <br />


                                                    </td>
                                                </tr>

                                                {
                                                    type == "update" ?
                                                        <tr>
                                                            <td>
                                                                Reason for updating
                                                    <br />
                                                                <textarea name="reason" onBlur={this.handleChange} class="form-control" rows="3" style={req_inpt} >

                                                                </textarea>
                                                                {/* <input required type="number" name="amount" class="form-control mb-2 mr-sm-2" onChange={this.handleChange} style={req_inpt} /> */}
                                                                <br />
                                                                <br />


                                                            </td>
                                                        </tr>
                                                        : <></>
                                                }
                                            </table>

                                            {
                                                this.state.accu_enabled == null ?
                                                    <button class="ui button" disabled={this.state.amount ? false : true}>
                                                        {
                                                            type == "update" ? "Update remittance" :
                                                                "Remit"}
                                                    </button>
                                                    : <></>
                                            }

                                        </form>
                                    </div>
                                </div>
                            </div>
                            <div class="inline_block" style={{ position: "absolute", width: "150%", left: "450px" }}>
                                <div class="remit_trans shadow-2xl">
                                    <div class="remit_inpts_cont">

                                        <div class="rt_det shadow-shorter inline_block" style={{ position: "relative" }}>
                                            <table>
                                                <tr><td>Total Sales </td><td> : </td><td>{formatter.format(totalRec)}</td></tr>
                                                <tr><td>Petty Cash </td><td> : </td><td>{formatter.format(this.state.initialCash)}</td></tr>
                                                <tr><td>Total </td><td> : </td><td>{formatter.format(totalRecIn)}</td></tr>
                                                {/* <tr><td>Initial Cash </td><td> : </td><td>{formatter.format(initialCash)}</td></tr> */}
                                                {/* <tr><td>Cash Withdrawal </td><td> : </td><td>{formatter.format(withdrawals)}</td></tr> */}
                                                {/* <tr><td>Cash received and cash remit difference </td><td> : </td><td>{formatter.format(diff)}</td></tr> */}
                                                <tr><td>Difference </td><td> : </td><td>{formatter.format(diff)}</td></tr>

                                            </table>

                                        </div>
                                        <div style={{ position: "absolute", top: "2.5%", left: "22%" }}>
                                            <div class="inline_block">
                                                <Dropdown
                                                    button
                                                    className='icon'
                                                    floating
                                                    labeled
                                                    icon='print'
                                                    onChange={this.changePrintOpt}
                                                    options={printOptions}
                                                    search
                                                    text='Printing Options'
                                                />
                                                <ReactToPrint

                                                    //         trigger={() =>
                                                    //             // <button class="ui button inline_block " style={{ position: "absolute", top: "2.5%", left: "22%" }}>
                                                    //             <button class="ui button  " >
                                                    //                 Print Remittance Report
                                                    //  </button>}
                                                    ref={ref => this.regularPrint = ref}
                                                    content={() => this.componentRef}
                                                />
                                                <ReactToPrint

                                                    ref={ref => this.receiptPrint = ref}
                                                    content={() => this.receiptRef}
                                                />
                                            </div>
                                            <div class="inline_block">
                                                <ReactHTMLTableToExcel
                                                    id="allremit"
                                                    className=" ui button"
                                                    table="remittance"
                                                    filename={filename}
                                                    sheet="all Transaction"
                                                    buttonText="Excel" />
                                            </div>
                                            <br />
                                            <br />
                                            <Button class="inline_block" onClick={this.btn_Accumulated}>Get Accumulated</Button>

                                            {
                                                this.state.showBranch == "yes" ?
                                                    <div class="inline_block">
                                                        <Dropdown type="select" fluid search selection balance
                                                            style={{ width: "100%" }}
                                                            onChange={this.myChangeHandlerBrch}
                                                            placeholder="Branch"
                                                            options={allBranch}
                                                            class="form-control form-control-lg "
                                                            required
                                                            clearable={true}
                                                        />
                                                    </div>
                                                    // <Dropdown
                                                    //     button
                                                    //     className='icon'
                                                    //     floating
                                                    //     labeled
                                                    //     icon='building'
                                                    //     // onChange={this.changePrintOpt}
                                                    //     options={allBranch}
                                                    //     search
                                                    //     text='Branches'
                                                    // /> 


                                                    : <></>

                                            }
                                            <br />
                                            <br />
                                            {
                                                this.state.rt_id && this.state.date ?
                                                    <>
                                                        {/* <Button primary={this.state.data_type == "With Cash flow" ? true : false} onClick={this.btn_getCFTrans} > With Cash flow </Button>
                                                        <Button primary={this.state.data_type == "No Cash flow" ? true : false} onClick={this.getNoCFTrans}> No Cash flow </Button> */}
                                                    </>
                                                    : <></>
                                            }

                                        </div>

                                        <div style={{ display: "none" }} >

                                            <PrintRemittance
                                                cash_received={formatter.format(totalRec)}
                                                remitted={formatter.format(this.state.amount)}
                                                diff={formatter.format(diff)}
                                                branch_name={this.state.branch_name}
                                                remitter={emp_name}
                                                remarks={this.state.remarks}
                                                transac_date={type == "update" ? date : this.state.date}
                                                branch={branch}
                                                allTrans={allTrans}
                                                ref={el => (this.componentRef = el)}
                                                initialCash={formatter.format(this.state.initialCash)}
                                                withdrawals={formatter.format(withdrawals)}
                                                totalRecIn={formatter.format(totalRecIn)}

                                            />
                                            <PrintRemittanceReceipt
                                                cash_received={formatter.format(totalRec)}
                                                remitted={formatter.format(this.state.amount)}
                                                remitter={emp_name}
                                                branch_name={this.state.branch_name}
                                                remarks={this.state.remarks}
                                                transac_date={type == "update" ? date : this.state.date}
                                                branch={branch}
                                                allTrans={allTrans}
                                                diff={formatter.format(diff)}
                                                ref={el => (this.receiptRef = el)}
                                                initialCash={formatter.format(this.state.initialCash)}
                                                withdrawals={formatter.format(withdrawals)}
                                                totalRecIn={formatter.format(totalRecIn)}
                                            />
                                        </div>


                                        <br /><br />
                                        <div class="rt_transactions shadow-shorter" style={{ zoom: "85%" }}>
                                            <BootstrapTable
                                                trClassName={this.rowClassNameFormat}
                                                ref='table'
                                                data={allTrans}
                                                pagination={false}
                                                search={true}
                                                maxHeight="400px"
                                            // options={options} exportCSV
                                            >
                                                {/* <TableHeaderColumn dataField='id' isKey={ true }>ID</TableHeaderColumn> */}
                                                <TableHeaderColumn dataField='remitter' width="80">Remitter</TableHeaderColumn>
                                                <TableHeaderColumn dataField='date' width="100">Date</TableHeaderColumn>
                                                <TableHeaderColumn dataField='time' width="80">Time</TableHeaderColumn>
                                                <TableHeaderColumn dataField='trans_type' width="80">Trans</TableHeaderColumn>
                                                <TableHeaderColumn dataField='code' width="160" isKey={true}>Code</TableHeaderColumn>
                                                <TableHeaderColumn dataField='cust_name'>Name</TableHeaderColumn>
                                                <TableHeaderColumn dataField="type">Type</TableHeaderColumn>
                                                <TableHeaderColumn dataField="payable" width="70" >Total</TableHeaderColumn>
                                                <TableHeaderColumn dataField="status" width="70" >Status</TableHeaderColumn>
                                            </BootstrapTable>
                                            {/* {this.state.date}
                                    {this.state.rt_id} */}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <br />
                            <br />

                        </div>
                        <div style={{ display: "none" }}>
                            <>
                                <table id="remittance">
                                    <thead>

                                        <ExHead
                                            colspan="5"
                                            title={<> Remittance <br /> {type == "update" ? date : this.state.date}</>}

                                        />



                                    </thead>
                                    <tr>
                                        <td colspan="5"><center>{this.state.data_type}</center></td>
                                    </tr>
                                    <tr>
                                        <td colspan="5"></td>
                                    </tr>
                                    <tr>
                                        <td>Remitter</td>
                                        <td>{emp_name}</td>
                                    </tr>
                                    <tr>
                                        <td>Branch</td>
                                        <td>{branch}</td>
                                    </tr>

                                    <tr>
                                        <td>Total Sales</td>
                                        <td>{formatter.format(totalRec)}</td>
                                    </tr>
                                    <tr>
                                        <td>Petty Cash</td>
                                        <td>{formatter.format(this.state.initialCash)}</td>
                                    </tr>
                                    <tr>
                                        <td>Total</td>
                                        <td>{formatter.format(totalRecIn)}</td>
                                    </tr>
                                    <tr>
                                        <td>Amount Remitted</td>
                                        {/* <td>{type == "update" ? formatter.format(amt): this.state.amount? formatter.format(this.state.amount)  : formatter.format(this.state.amount)}</td> */}
                                        <td>{formatter.format(this.state.amount)}</td>
                                    </tr>
                                    {/* <tr>
                                        <td>Cash Withdrawal</td>
                                        <td>{formatter.format(withdrawals)}</td>
                                    </tr> */}
                                    <tr>
                                        <td>Difference</td>
                                        <td>{formatter.format(diff)}</td>
                                    </tr>
                                    {this.state.branch_name ? 
                                        <tr>
                                        <td>Branch</td>
                                        <td>{this.state.branch_name}</td>
                                    </tr>: <></>
                                    
                                }
                                    <tr>
                                        <td><b>Remarks</b></td>
                                    </tr>
                                    <tr>
                                        <td colspan="5">{this.state.remarks}</td>
                                        {/* <td colspan="5">{type == "update" ? remark: this.state.remarks ? this.state.remarks : this.state.remarks}</td> */}
                                    </tr>
                                    <tr>
                                        <td colspan="5"></td>
                                    </tr>
                                    <tr>
                                        <td colspan="5"><center>{this.state.date} Transactions</center></td>
                                    </tr>

                                    <tr>
                                        <th>Time</th>
                                        <th>Transaction</th>
                                        <th>Code</th>
                                        <th>Name</th>
                                        <th>Type</th>
                                        <th>Total</th>

                                    </tr>



                                    {salestoday.map((itm, index, arr) => (
                                        <tr>
                                            <td>{itm.time}</td>
                                            <td>{itm.trans_type}</td>
                                            <td>{itm.code}</td>
                                            <td>{itm.cust_name}</td>
                                            <td>{itm.type}</td>
                                            <td>{itm.payable}</td>

                                        </tr>
                                    ))}
                                    {
                                        cutoffsales.length > 0 ?
                                            <>
                                                <tr><td></td></tr>
                                                <tr>
                                                    <td colspan="6"><center>Late Input Transactions</center></td>
                                                    {/* <td colspan="6"><center>Cut Off Transactions (Previous Date)</center></td> 5-4-2021*/}
                                                </tr>
                                                <tr>
                                                    <th>Date</th>
                                                    <th>Time</th>
                                                    <th>Transaction</th>
                                                    <th>Code</th>
                                                    <th>Name</th>
                                                    <th>Type</th>
                                                    <th>Total</th>

                                                </tr>

                                                {cutoffsales.map((itm, index, arr) => (
                                                    <tr>
                                                        <td>{itm.date}</td>
                                                        <td>{itm.time}</td>
                                                        <td>{itm.trans_type}</td>
                                                        <td>{itm.code}</td>
                                                        <td>{itm.cust_name}</td>
                                                        <td>{itm.type}</td>
                                                        <td>{itm.payable}</td>

                                                    </tr>
                                                ))}
                                            </>
                                            : <></>
                                    }
                                </table>
                            </>
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
