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
class SpecCustomerLedger extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);

        // Initial state.
        this.state = {
            error: null,
            from_date: this.props.location.state.from_date,
            to_date: this.props.location.state.to_date,
            upIdItem: null,
            data: [],
            tranItems: [],
            customer: [],
        };
        // API endpoint.
        this.api = '/api/v1/reports/sales';
    }
    componentDidMount() {
        this.getData();
    }

    getData = (e) => {
        e ? e.preventDefault() : e = null;

        this._isMounted = true
        const subs = {
            from_date: this.state.from_date,
            to_date: this.state.to_date,
            user_id: this.props.location.state.id
        }
console.log(subs)
        Http.post(`/api/v1/cashflowRep`, subs)
            .then((response) => {
                // const { data } = response.data.transaction.data;
                if (this._isMounted) {
                    console.log("flows")
                    console.log(response.data.flows)

                    this.setState({
                        data: response.data.flows,


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

    handleChange = (e) => {
        this._isMounted = true
        const { name, value } = e.target;
        if (this._isMounted) {
            this.setState({ [name]: value });
        }
    };
    buttonFormatter = (cell, row) => {
        // const { tranItems } = this.state;
        return (

            <div>
                <Link to={{
                    pathname: '/cashflow/log', state: {
                        id: row.id,
                        path: '/report/user/cashflow',
                        user_id: this.props.location.state.id,
                        from_date: this.state.from_date,
                        to_date: this.state.to_date,

                    }
                }} ><i class="file alternate icon"></i></Link>
                ({row.no_updates})
            </div>
        )
    }
    // uplogicon = (cell, row) => {
    //     return (
    //         <>

    //             <Link to={{
    //                 pathname: '/uplog/sales', state: {
    //                     id: this.props.location.state.id,
    //                     code: row.code,
    //                     itm: row.code,
    //                     path: '/specCustomerLedger',
    //                     type: "Ledger",
    //                     trans_type: row.transaction_type,
    //                     linkpath: '/specCustomerLedger',

    //                 }
    //             }} ><i class="file alternate icon"></i></Link>

    //         </>
    //     )
    // }
    rowClassNameFormat(row, rowIdx) {
        // row is whole row object
        // rowIdx is index of row
        return row.status === 'deleted' ? 'tr-style-deleted' : ' ';
    }

    itms = (e, print) => {
        // const zm = { zoom: "85%" }
        return (
            <>

                {/* <div style={print ? zm : {}}> */}
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
                    <TableHeaderColumn width="170" hidden dataField='beg_cash' >Beginning Balance</TableHeaderColumn>
                    <TableHeaderColumn width="170" dataField='end_cash' >End Balance</TableHeaderColumn>
                    <TableHeaderColumn dataField='description' >Description</TableHeaderColumn>
                    <TableHeaderColumn width="170" dataField='code' >Receipt Code</TableHeaderColumn>
                    <TableHeaderColumn width="100" dataField='status' >Status</TableHeaderColumn>
                    <TableHeaderColumn width="100" dataField='no_updates' dataFormat={this.buttonFormatter} >Updates</TableHeaderColumn>

                </BootstrapTable>
                {/* </div> */}
            </>
        );
    }
    render() {
        const { data } = this.state;
        var ledName;
console.log("data")
console.log(data)
        // customer.map((itm) => {ledName = itm.name})

        return (
            <div className="contentledgerSpec" >
                {/* className="contentTransact" */}
                <Link to="/utilities/users"><Button > Back </Button></Link>
                {/* <div style={{float: "right"}}>
          <Link to={{
            pathname: `/report/excel/preview/ledger`, state: {
             
              path: this.props.location.state.path,

              id:  this.props.location.state.id,
              data: data,
               type: "Customer", 
              ledname: ledName
            }
          }}>
            <Button > Excel Preview</Button>
          </Link>
        </div> */}
        &nbsp;&nbsp;&nbsp;
                <ReactToPrint

                    trigger={() => <Button style={{ float: "right" }} >Print Report</Button>}

                    content={() => this.componentRef}
                />

                {/* {this.state.from_date}
                {this.state.to_date} */}

                {<h1>{ledName}</h1>}
                <form onSubmit={this.getData} style={{ width: "20%" }}>
                    <table>
                        <tr>
                            <td>
                                From
                            </td>
                            <td>
                                To
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <input type="date"
                                    name="from_date"
                                    onChange={this.handleChange}
                                    required
                                    class="form-control mb-2 mr-sm-2 inline_block" />

                            </td>
                            <td>
                                <input type="date"
                                    name="to_date"
                                    onChange={this.handleChange}
                                    required
                                    class="form-control mb-2 mr-sm-2 inline_block" />
                            </td>
                            <td>
                                <button class="btn btn-primary mb-2">Search</button>
                            </td>
                        </tr>
                    </table>



                </form>
                {this.itms(data)}

                <div style={{ display: "none" }}>
                    <PrintReport

                        itms={this.itms(data, "print")}
                        ledgerName={ledName}
                        ref={el => (this.componentRef = el)}



                    />
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    isAuthenticated: state.Auth.isAuthenticated,
    user: state.Auth.user,
});

export default connect(mapStateToProps)(SpecCustomerLedger);
