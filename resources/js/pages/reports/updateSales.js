import React, { Component, useRef } from 'react';
// import PrintHeader from './printHeader';
import Http from '../../Http';
import ModifySalesItems from '../reports/modifySalesItem';
import { connect } from 'react-redux';
import ReactToPrint from "react-to-print";
import { Dropdown, Icon, Button, Radio } from 'semantic-ui-react';
import PrintReportItem from '../prints/printReportItem';
import UpToggle from '../reports/upToggleCashOnHAnd';
import { Link } from 'react-router-dom';
import ReactHTMLTableToExcel from 'react-html-table-to-excel';
import { ToastContainer, toast } from 'react-toastify';
import classNames from 'classnames';
class PrintReport extends Component {
    _isMounted = false
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            custname: null,
            date_transac: null,
            dev_address: null,
            dev_contact: null,
            dev_fee: null,
            discount: null,
            amt_rec: null,
            receipt_code: null,


            old_custname: null,
            old_date_transac: null,
            old_dev_address: null,
            old_dev_contact: null,
            old_dev_fee: null,
            old_discount: null,
            old_amt_rec: null,
            old_receipt_code: null,
            po_cashflow: null,
            latespec: null,


            data: [],
            normal: "normal",
        }
    }

    componentDidMount() {
        this.getSaleItems();
    }
    getSaleItems = () => {
        const { id } = this.props.location.state;
        this._isMounted = true

        // var api = `/api/v1/reports/deletedItms`;
        var api = `/api/v1/reports/saleItems`;


        Http.post(api, { id: id })
            .then((response) => {

                var data = response.data.details;

                if (this._isMounted) {
                    this.setState({
                        po_cashflow: data[0].partof_cashflow,
                        old_custname: data[0].customer_name,
                        old_date_transac: data[0].date_transac,
                        old_dev_address: data[0].address,
                        old_dev_contact: data[0].contact,
                        old_dev_fee: data[0].delivery_fee,
                        old_discount: data[0].discount,
                        old_amt_rec: data[0].amount_received,
                        old_receipt_code: data[0].receipt_code,
                        latespec: data[0].latespecifics,
                    });
                }

                console.log("idddd")
                console.log(id)
                console.log(response.data.details)
            })

            .catch((error) => {
                console.log(error)
            });
    }
    submitUpdate = (e) => {
        e.preventDefault();

        if (confirm("Are you sure you want to update transaction?")) {

            const { id, type, trans_type } = this.props.location.state;

            const subs = {
                id: id,
                receipt_code: this.state.receipt_code,
                custname: this.state.custname,
                date_transac: this.state.date_transac,
                dev_address: this.state.dev_address,
                dev_contact: this.state.dev_contact,
                dev_fee: this.state.dev_fee == "0" ? "0.00" : this.state.dev_fee,
                discount: this.state.discount == "0" ? "0.00" : this.state.discount,
                amt_rec: this.state.amt_rec,
            }

            console.log(trans_type)
            console.log(subs)
            if (trans_type == "Direct Sale" || trans_type == "Excess Payment") {
                this.submitDirectSales(subs)
            } else if (trans_type == "Charge") {
                this.submitDirectCharge(subs)
            }

        }
    }

    submitDirectSales = (subs) => {
        Http.post(`/api/v1/mod/transaction/sales`, subs)
            .then((response) => {
                toast("Transaction successfully updated")
            })
            .catch((error) => {
                toast("Failed to update transaction")
                console.log(error)
            });
    }
    submitDirectCharge = (subs) => {
        Http.post(`/api/v1/mod/transaction/charge`, subs)
            .then((response) => {
                toast("Transaction successfully updated")
            })
            .catch((error) => {
                toast("Failed to update transaction")
                console.log(error)
            });
    }

    handleChange = (e) => {
        this._isMounted = true
        const { name, value } = e.target;
        if (this._isMounted) {
            this.setState({ [name]: value });
        }
    };

    salesForm = () => {
        const { trans_type } = this.props.location.state;

        const { loading } = this.state;
        return (
            <>
                <form onSubmit={this.submitUpdate}>
                    <b> Customer Name </b>
                    <input disabled={trans_type == "Charge" ? true : false} type="text" name="custname" defaultValue={this.state.old_custname} onChange={this.handleChange} class="form-control mb-2 mr-sm-8" />
                    <b> Date </b>
                    <input type="date" name="date_transac" defaultValue={this.state.old_date_transac} onChange={this.handleChange} class="form-control mb-2 mr-sm-8" />
                    <b> Delivery Address </b>
                    <input type="text" name="dev_address" defaultValue={this.state.old_dev_address} onChange={this.handleChange} class="form-control mb-2 mr-sm-8" />
                    <b> Delivery contact </b>
                    <input type="text" name="dev_contact" defaultValue={this.state.old_dev_contact} onChange={this.handleChange} class="form-control mb-2 mr-sm-8" />
                    <b> Delivery fee </b>
                    <input type="number" step=".0001" name="dev_fee" defaultValue={this.state.old_dev_fee} onChange={this.handleChange} class="form-control mb-2 mr-sm-8" />
                    <b>Discount </b>
                    <input type="number" step=".0001" name="discount" defaultValue={this.state.old_discount} onChange={this.handleChange} class="form-control mb-2 mr-sm-8" />
                    <b>Amount Received </b>
                    <input type="number" step=".0001" name="amt_rec" defaultValue={this.state.old_amt_rec} onChange={this.handleChange} class="form-control mb-2 mr-sm-8" />
                    <b>OR Number </b>
                    <input type="text" name="receipt_code" defaultValue={this.state.old_receipt_code} onChange={this.handleChange} class="form-control mb-2 mr-sm-8" />

                    <button type="submit"
                        style={{ float: "right" }}
                        className={classNames('btn btn-primary mb-2', {
                            'btn-loading': loading,
                        })}

                    >Update</button>
                </form>
            </>
        )
    }
    // modTransCashflow

    // modTransCashflow = (subs) => {
    //     if (confirm("Are you sure you want to update? This will affect the cash on hand of the user.")) {
    //         const { id } = this.props.location.state;
    //         Http.post(`/api/v1/modTransCashflow`, { id: id })
    //             .then((response) => {

    //                 toast("Transaction successfully updated")
    //                 if (this._isMounted) {
    //                     this.setState({
    //                         po_cashflow: response.data.incCashflow
    //                     });
    //                 }
    //             })
    //             .catch((error) => {
    //                 toast("Failed to update transaction")
    //                 console.log(error)
    //             });
    //     }
    // }
    modTransCashflow = (data) => {

        this._isMounted = true
        if (this._isMounted) {
            this.setState({
                po_cashflow: data
            });
        }

    }

   
    changelatespec = (e, { value }) => {
        this._isMounted = true
        const subs = {
            id: this.props.location.state.id,
            spec: value
        }

        if (confirm("Are you sure you want to change the late specifications? This will affect the calculation of total sales on remittance transaction.")) {

            Http.post(`/api/v1/mod/updateLateSpec`, subs)
                .then((response) => {

                    toast("Transaction successfully updated")
                    this.getSaleItems();
                })
                .catch((error) => {
                    toast("Failed to update transaction")
                    console.log(error)
                });
        }
    };


    // cashFlowToggle = () => {
    //     return (
    //         <>
    //             <small>Part of cashflow</small><br />
    //             <Radio

    //                   onClick={this.modTransCashflow} 
    //                 checked={this.state.po_cashflow == "yes" ? true : false}
    //                 toggle />
    //         </>
    //     )
    // }


    render() {

        const { type, code, id, path, trans_type } = this.props.location.state;
        const { latespec } = this.state;
        // var path;
        // if (type == "Sale") {
        //     path = `/report/sales`;
        // }

        const specopt = [
            { key: 'before5', text: 'Before 5pm', value: 'before5' },
            { key: 'beyond5', text: 'Beyond 5pm', value: 'beyond5' },
            { key: 'none', text: 'None', value: 'none' },
        ]

        return (
            <>
                <ToastContainer />
                {/* <div className="contentTransactSales"> */}
                <div className="contentTransactSales" >

                    <Link to={{ pathname: path, state: { type: type, path: path } }}>
                        <Button icon labelPosition='left'><Icon name='angle left' /> Back to Tansaction view </Button>
                    </Link>

                    <Link to={{
                        pathname: '/uplog/sales', state: {
                            type: type,
                            //  path: '/update/sales',
                            path: path,
                            id: id, code: code,
                            itm: code,
                            trans_type: trans_type
                            , linkpath: '/update/sales'
                        }
                    }} >  <Button>Log History</Button></Link>

                    <h3>  Ref#: {code} </h3>
                    <div class="inline_block" style={{ width: "30%" }}>
                        {this.props.location.state.trans_type == "Excess Payment" ? <UpToggle newToggle={this.modTransCashflow} po_cashflow={this.state.po_cashflow} id={this.props.location.state.id} /> : <></>}
                        {this.salesForm()}
                        <br />
                        <br />

                    </div>
                    <div style={{ width: "65%", top: "0", float: "right", display: "inline-block" }}>
                        {
                            this.props.location.state.trans_type == "Direct Sale" || this.props.location.state.trans_type == "Charge" ?
                                <>

                                    {/* { this.props.location.state.trans_type == "Direct Sale" ?   this.cashFlowToggle() : <></>} */}
                                    {this.props.location.state.trans_type == "Direct Sale" ? <UpToggle newToggle={this.modTransCashflow} po_cashflow={this.state.po_cashflow} id={this.props.location.state.id} /> : <></>}
                                    {/* <Dropdown
                                        button
                                        className='icon'
                                        floating
                                        labeled
                                        icon='clock'
                                        onChange={this.changelatespec}
                                        options={specopt}
                                        search
                                        text={latespec ? <>
                                            {
                                                latespec == "before5" ? "Late, Before 5pm" : "Late, Beyond 5"
                                            }
                                        </> :

                                            'Select Late Specification'}
                                        style={{ float: "right" }}
                                    /> */}
                                    <ModifySalesItems id={this.props.location.state.id} trans_type={trans_type} />
                                </>
                                : <></>
                        }
                    </div>




                </div>
            </>

        );
    }
}
// export default PrintReport;
const mapStateToProps = (state) => ({
    isAuthenticated: state.Auth.isAuthenticated,
    user: state.Auth.user,
});

export default connect(mapStateToProps)(PrintReport);
