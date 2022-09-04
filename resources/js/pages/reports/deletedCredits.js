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
import { Button } from 'semantic-ui-react';
class SpecSupplierLedger extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);

        // Initial state.
        this.state = {
            error: null,
            upIdItem: null,
            data: [],
            tranItems: [],
            supplier: [],
        };
        // API endpoint.

    }
    componentDidMount() {
        this._isMounted = true
        Http.post(`/api/v1/reports/deleted/credits`, { id: this.props.location.state.id })
            .then((response) => {
                // const { data } = response.data.transaction.data;
                if (this._isMounted) {
                    var item = []
                    var data = response.data.trans;

                    data.filter(function (v) {

                        var trans = JSON.parse(v.transaction)

                        var sd = new Date(v.created_at);
                        var sye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(sd);
                        var smo = new Intl.DateTimeFormat('en', { month: 'numeric' }).format(sd);
                        var sda = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(sd);

                        trans.delete_date = smo + '/' + sda + '/' + sye ;

                        // trans.delete_date = v.created_at;
                        trans.description_cr = v.description;

                        item.push(trans)
                    })


                    this.setState({
                        data: item,
                    });
                    console.log(item)
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
        const zm = { zoom: "75%" }
        // Set printer scal to 82 (custom)
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
                        {/* <TableHeaderColumn dataField='supplier_id' >sup</TableHeaderColumn> */}

                        <TableHeaderColumn dataField='delete_date' >Delete Date</TableHeaderColumn>
                        <TableHeaderColumn isKey={true} dataField='code' >Code</TableHeaderColumn>
                        <TableHeaderColumn dataField='charge_transaction_code' >Charge Code</TableHeaderColumn>
                        <TableHeaderColumn width="150" dataField='date_transac' >Date</TableHeaderColumn>
                        <TableHeaderColumn width="150" dataField='transaction_type' >Type</TableHeaderColumn>
                        <TableHeaderColumn dataField='payable' >Payable</TableHeaderColumn>
                        <TableHeaderColumn hidden={true} dataField='charge_status' >Status</TableHeaderColumn>
                        <TableHeaderColumn hidden={true} dataField='date_paid' >Date Paid</TableHeaderColumn>
                        <TableHeaderColumn hidden={true} dataField='pay_code' >Payment Code</TableHeaderColumn>
                        <TableHeaderColumn hidden={true} dataField='beg_charge_bal' >Beginning Balance</TableHeaderColumn>
                        <TableHeaderColumn dataField='end_charge_bal' >Ending Balance</TableHeaderColumn>
                        <TableHeaderColumn dataField='description_cr' >Reason</TableHeaderColumn>
                        {/* <TableHeaderColumn dataField='last_update' >Last update</TableHeaderColumn> */}
                        {/* <TableHeaderColumn width="50" hidden={print ? true : false} dataField='updated_at' dataFormat={this.uplogicon} ></TableHeaderColumn> */}

                    </BootstrapTable>
                </div>
            </>
        );
    }
    render() {
        const { data } = this.state;
        return (
            <div className="contentledgerSpec" >
                <Link
                    to={{
                        pathname: this.props.location.state.path, state: {

                            path: this.props.location.state.path,
                            id: this.props.location.state.id,
                        }
                    }}><Button  > Back </Button></Link>
                {this.itms(data)}
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    isAuthenticated: state.Auth.isAuthenticated,
    user: state.Auth.user,
});

export default connect(mapStateToProps)(SpecSupplierLedger);
