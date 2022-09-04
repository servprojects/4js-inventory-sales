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
        Http.post(`/api/v1/cashflowUpRep`, { id: this.props.location.state.id })
            .then((response) => {

                if (this._isMounted) {
                    const data = response.data.flows



                    var items = [];


                    data.map((itm) => {

                        var parItms = JSON.parse(itm.item);
                        parItms.log_desc = itm.description
                        items.push(parItms);

                    }


                    )
                    console.log("njehr")
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

    rowClassNameFormat(row, rowIdx) {
        // row is whole row object
        // rowIdx is index of row
        return row.status === 'deleted' ? 'tr-style-deleted' : ' ';
    }


    itms = (e, print) => {
        const { type, trans_type } = this.props.location.state;
        const zm = { zoom: "85%" }
        return (
            <>

                <div style={print ? zm : {}}>
                    <BootstrapTable
                        trClassName={this.rowClassNameFormat}
                        ref='table'
                        data={e}
                        pagination={print ? false : true}
                        search={print ? false : true}
                    // options={options} exportCSV
                    >
                        <TableHeaderColumn isKey={true} dataField='id' hidden ></TableHeaderColumn>
                        <TableHeaderColumn width="180" dataField='trans_date' >Timestamp</TableHeaderColumn>
                        <TableHeaderColumn width="120" dataField='type' >Type</TableHeaderColumn>
                        <TableHeaderColumn width="120" dataField='accountability' >Accountability</TableHeaderColumn>
                        <TableHeaderColumn width="150" dataField='amount' >Amount</TableHeaderColumn>
                        <TableHeaderColumn width="150" dataField='beg_cash' >Beginning Balance</TableHeaderColumn>
                        <TableHeaderColumn width="150" dataField='end_cash' >End Balance</TableHeaderColumn>
                        <TableHeaderColumn  width="120" dataField='description' >Description</TableHeaderColumn>
                        <TableHeaderColumn width="170" dataField='code' >Receipt Code</TableHeaderColumn>
                        <TableHeaderColumn width="100" dataField='status' >Status</TableHeaderColumn>
                        <TableHeaderColumn width="120" dataField='log_desc' >Description</TableHeaderColumn>

                    </BootstrapTable>
                </div>
            </>
        );
    }



    render() {
        const { data } = this.state;
        const { user_id, path, from_date, to_date } = this.props.location.state;



        var sorted = data.sort(function (a, b) {
            return b.updated_at.localeCompare(a.updated_at);
        });
        return (
            <div className="contentledgerSpec" >
                <Link to={{
                    pathname: path, state:
                    {
                        id: user_id,
                        from_date: from_date,
                        to_date: to_date

                    }
                }}

                ><button type="button" class="btn btn-primary"  > Back </button></Link>
                <br />
                {/* <h1>  <small>  {type + "-" + itm}</small></h1> */}
                <h4>Previous Records before the current update</h4>
                <br />


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
