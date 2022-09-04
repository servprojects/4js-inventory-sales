import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../Http';
import classNames from 'classnames';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import { Link } from 'react-router-dom';
import ReactToPrint from "react-to-print";
import PrintReport from '../prints/printReport';
import { Dropdown } from 'semantic-ui-react';//filt_branch
class UpdateLog extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);

        // Initial state.
        this.state = {
            error: null,
            data: [],
        };
        // API endpoint.
        // this.api = '/api/v1/reports/sales';
    }
    componentDidMount() {
        this._isMounted = true
        Http.post(`/api/v1/reports/upLogs`, { code: this.props.location.state.code, type: "Sale Update" })
            .then((response) => {

                if (this._isMounted) {
                    const data = response.data.items

                    const { id, type } = this.props.location.state;

                    var items = [];
                    console.log("wait")
                    console.log(data)

                    data.map((itm) => {

                        var parItms = JSON.parse(itm.items);
                        var it = {}
                        var tayp;
                        var resultitm = parItms.filter(function (v) {
                            if (v.type == "Transaction") {
                                tayp = "Transaction";
                                return v
                            } else {
                                tayp = "Items";
                                return v
                            }
                            // return v.type == "Transaction";
                            // return v.type == "Items";
                        })
                        console.log(tayp)
                        
                        if (tayp == "Transaction") {
                            var detailsTrans = [resultitm[0].details];

                            var sd = new Date(itm.created_at);
                            var sye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(sd);
                            var smo = new Intl.DateTimeFormat('en', { month: 'numeric' }).format(sd);
                            var sda = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(sd);
                            var hour = new Intl.DateTimeFormat('en', { hour: 'numeric' }).format(sd);
                            var min = new Intl.DateTimeFormat('en', { minute: 'numeric' }).format(sd);
                            var sec = new Intl.DateTimeFormat('en', { second: 'numeric' }).format(sd);

                            it.replace_date = smo + '/' + sda + '/' + sye + '   ' + hour + min + ':' + sec;


                            detailsTrans.map((det) => {
                                it.customer_name = det.customer_name
                                it.date_transac = det.date_transac
                                it.discount = det.discount
                                it.amount_received = det.amount_received
                                it.payable = det.payable
                                it.end_charge_bal = det.end_charge_bal
                            }
                            )

                            console.log("NO DEV")
                            console.log(parItms)

                            var resultitmDel = parItms.filter(function (v) {
                                return v.type == "Delivery";
                            })

                            console.log(resultitmDel)

                            if (resultitmDel.length != 0) {
                                var resultitmDelTrans = [resultitmDel[0].details];
                                resultitmDelTrans.map((del) => {
                                    it.address = del.address
                                    it.contact = del.contact
                                    it.delivery_fee = del.delivery_fee
                                }
                                )
                            }


                            items.push(it);
                        }


                    }


                    )


                    console.log("nooooo")
                    console.log(items)

                    this.setState({
                        data: items,

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
    }



    itms = (e, print) => {
        const { type, trans_type } = this.props.location.state;
        const zm = { zoom: "85%" }
        return (
            <>

                <div style={print ? zm : {}}>
                    <BootstrapTable
                        ref='table'
                        data={e}
                        pagination={print ? false : true}
                        search={print ? false : true}
                    // options={options} exportCSV
                    >
                        <TableHeaderColumn isKey={true} hidden width="180" dataField='id' ></TableHeaderColumn>
                        <TableHeaderColumn width="130" dataField='replace_date' >Replace Date</TableHeaderColumn>
                        <TableHeaderColumn width="150" hidden={type == "Ledger" ? true : false} dataField='customer_name' >Customer Name</TableHeaderColumn>
                        <TableHeaderColumn width="100" dataField='date_transac' >Transaction Date</TableHeaderColumn>
                        <TableHeaderColumn width="100" hidden={trans_type == "Payment Charge" ? true : false} dataField='address' >Delivery Add.</TableHeaderColumn>
                        <TableHeaderColumn width="100" hidden={trans_type == "Payment Charge" ? true : false} dataField='contact' >Delivery Contact</TableHeaderColumn>
                        <TableHeaderColumn width="100" hidden={trans_type == "Payment Charge" ? true : false} dataField='delivery_fee' >Delivery Fee</TableHeaderColumn>
                        <TableHeaderColumn width="100" hidden={trans_type == "Payment Charge" ? true : false} dataField='discount' >Discount</TableHeaderColumn>
                        <TableHeaderColumn width="100" dataField='payable' >Amt Due</TableHeaderColumn>
                        <TableHeaderColumn width="100" hidden={type == "Ledger" ? true : false} dataField='amount_received' >Amt Received</TableHeaderColumn>
                        <TableHeaderColumn width="100" hidden={type == "Ledger" ? false : true} dataField='end_charge_bal' >End Bal</TableHeaderColumn>

                    </BootstrapTable>
                </div>
            </>
        );
    }



    render() {
        const { data } = this.state;
        const { type, id, code, path, itm, trans_type, linkpath } = this.props.location.state;

        // console.log(this.props.location.state.code);
        // var ledName, code;
        // const branch = branches.map((brnch) => ({ key: brnch.id, value: brnch.id, text: brnch.name }));

        var sorted = data.sort(function (a, b) {
            return b.replace_date.localeCompare(a.replace_date);
        });
        return (
            <div className="contentledgerSpec" >
                <Link to={{ pathname: linkpath, state: { id: id, code: code, type: type, path: path, trans_type: trans_type } }}><button type="button" class="btn btn-primary"  > Back </button></Link>
                <br />
                <h1>  <small>  {type + "-" + itm}</small></h1>
                <h4>Previous Records before the current update</h4>
                <br />

                {/* {type == "item" ? this.itms(sorted) : type=="supplier" ? this.itmsSup(sorted) : <></>} */}
                {/* {this.itms(data)} */}
                {this.itms(sorted)}
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    isAuthenticated: state.Auth.isAuthenticated,
    user: state.Auth.user,
});

export default connect(mapStateToProps)(UpdateLog);
