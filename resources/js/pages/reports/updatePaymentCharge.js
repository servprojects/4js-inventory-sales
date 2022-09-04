import React, { Component, useRef } from 'react';
// import PrintHeader from './printHeader';
import Http from '../../Http';
import { connect } from 'react-redux';
import ReactToPrint from "react-to-print";
import { Dropdown, Icon, Button } from 'semantic-ui-react';
import PrintReportItem from '../prints/printReportItem';
import { Link } from 'react-router-dom';
import ReactHTMLTableToExcel from 'react-html-table-to-excel';
import { ToastContainer, toast } from 'react-toastify';
import classNames from 'classnames';
import UpToggle from '../reports/upToggleCashOnHAnd';
class PrintReport extends Component {
    _isMounted = false
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            date_transac: null,
            payable: null,
            amt_rec: null,

            old_date_transac: null,
            old_amt_rec: null,
            old_payable: null,
            po_cashflow: null,


            data: [],
            normal: "normal",
        }
    }

    componentDidMount() {
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
                        old_date_transac: data[0].date_transac,
                        old_payable: data[0].payable,
                        old_amt_rec: data[0].amount_received,
                    });
                }

                console.log("hello")
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
                date_transac: this.state.date_transac,
                payable: this.state.payable == "0" ? "0.00" : this.state.payable,
                amt_rec: this.state.amt_rec,
            }

            console.log(trans_type)
            console.log(subs)
          
            
                this.submitPC(subs)
           

        }
    }

    submitPC = (subs) => {
        Http.post(`/api/v1/mod/transaction/paymentcharge`, subs)
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
                    {this.state.date_transac}
                    {this.state.payable}
                    {this.state.amt_rec}
                    <b> Date </b>
                    <input type="date" name="date_transac" defaultValue={this.state.old_date_transac} onChange={this.handleChange} class="form-control mb-2 mr-sm-8" />

                    <b> Amount</b>
                    <input type="number" step=".0001" name="payable" defaultValue={this.state.old_payable} onChange={this.handleChange} class="form-control mb-2 mr-sm-8" />
                    <b>Cash Received </b>
                    <input type="number" step=".0001" name="amt_rec" defaultValue={this.state.old_amt_rec} onChange={this.handleChange} class="form-control mb-2 mr-sm-8" />

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

    modTransCashflow = (data) => {
      
        this._isMounted = true
                    if (this._isMounted) {
                        this.setState({
                            po_cashflow: data
                        });
                    }
                
    }

    render() {

        const { type, code, id, path, trans_type } = this.props.location.state;
        // var path;
        // if (type == "Sale") {
        //     path = `/report/sales`;
        // }


        return (
            <>
                <ToastContainer />
                {/* <div className="contentTransactSales"> */}
                <div className="contentTransactSales" style={{ marginLeft: "20%" }}>

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
                            , linkpath: '/update/paymentcharge'
                        }
                    }} >  <Button>Log History</Button></Link>

                    <h3>  Ref#: {code} </h3>
                    <div style={{ width: "45%" }}>
                    { trans_type == "Payment Charge" ?  <UpToggle newToggle={this.modTransCashflow} po_cashflow={this.state.po_cashflow} id={this.props.location.state.id}/> : <></>}
                        {this.salesForm()}
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
