import React, { Component, useRef } from 'react';
import { Link } from 'react-router-dom';
import ExHead from '../prints/excelHeader';
import { Dropdown, Icon, Button } from 'semantic-ui-react';
import ReactHTMLTableToExcel from 'react-html-table-to-excel';
import Http from '../../Http';
import PrintReportItem from '../prints/excelAllPayments';
class ExRep extends React.Component {

    _isMounted = false
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            addons: [],
            normal: "normal",
        }
    }

    componentDidMount() {
        this._isMounted = true
        const { type } = this.props.location.state;
        var api = `/api/v1/reports/indivChargeRev`;

        const subs = {
            type: type,
            id: this.props.location.state.id,
            from_date: this.props.location.state.sdate,
            to_date: this.props.location.state.edate,
            accountability: this.props.location.state.type
        }
        console.log(subs)
        Http.post(`/api/v1/reports/payment/charges`, subs)
            .then((response) => {

                if (this._isMounted) {

                    this.setState({
                        data: response.data.items,

                    });


                }
            })

            .catch((error) => {
                console.log(error)
            });
    }

    genTrans = () => {
        const { data, filter, type } = this.props.location.state;
        return (
            <>
                <tr>
                    <th>Branch</th>
                    <th>Code</th>
                    <th>Date</th>
                    <th> {filter == "Receiving" || type == "Receiving" ? " Recieved by" : "Particular"} </th>
                    <th>Type</th>
                    <th>Accountability</th>
                    <th>Amount Due</th>
                    <th>Total Items</th>

                </tr>


                <tbody>
                    {data.map((itm, index, arr) => (
                        <tr>
                            <td>{itm.branch}</td>
                            <td>{itm.code}</td>
                            <td>{itm.date}</td>
                            <td>{itm.cust_name}</td>
                            <td>{itm.type}</td>
                            <td>{itm.accountability}</td>
                            <td>{itm.payable}</td>
                            <td>{itm.total_items}</td>

                        </tr>
                    ))}

                </tbody>


            </>
        )
    }
    remittance = () => {
        const { data } = this.props.location.state;
        return (
            <>
                <tr>
                    <th>Date</th>
                    <th>Branch</th>
                    <th>Remitter</th>
                    <th>Amount Recieved</th>
                    <th>System Amount</th>
                    <th>Difference</th>
                    <th>Remarks</th>

                </tr>


                <tbody>
                    {data.map((itm, index, arr) => (
                        <tr>
                            <td>{itm.date}</td>
                            <td>{itm.branch}</td>
                            <td>{itm.remitter}</td>
                            <td>{itm.amount_remitted}</td>
                            <td>{itm.sys_amount}</td>
                            <td>{itm.amount_remitted - itm.sys_amount}</td>
                            <td>{itm.remark}</td>

                        </tr>
                    ))}

                </tbody>


            </>
        )
    }

    content = (dat, show, r) => {
        const { data, branch, type, begDate, endDate, filter, branches } = this.props.location.state;
        // const { itOn } = this.state;
        var result = branches.filter(function (v) {
            return v.id == branch;
        })

        var branchname = " "
        branch ? branchname = result[0].name : branchname = " ";
        // console.log(result)
        const range = r.smoS + " " + r.sda + ", " + r.sye
        return (
            <>
                <thead>
                    {
                        show ?
                            <>
                                <ExHead
                                    colspan="8"
                                    title={
                                        <>
                                            {

                                                <>   {branchname} <br /> {filter ? filter : type} Transaction <br /> {begDate}---{endDate}</>
                                            }

                                        </>
                                    }

                                />
                            </>
                            :
                            <></>
                    }

                </thead>

                {type == "Remittances" ? this.remittance() : this.genTrans()}

            </>
        )

    }

    allpays = () => {
        const { data } = this.state;
        return (
            <>
                <BootstrapTable
                    ref='table'
                    data={data}
                    pagination={false}
                    search={true}
                    options={{ hideSizePerPage: false }}
                    class="tableStyle"
                    maxHeight="500px"
                   
                // options={options} exportCSV
                >
                    <TableHeaderColumn dataField="code" isKey={true} >Code</TableHeaderColumn>
                    <TableHeaderColumn dataField="date_transac" dataSort  >Date</TableHeaderColumn>
                    <TableHeaderColumn dataField="transaction_type" dataSort  >Type</TableHeaderColumn>
                    <TableHeaderColumn dataField="payable" dataSort >Payable</TableHeaderColumn>
                    {/* <TableHeaderColumn dataField="beg_charge_bal" dataSort  >Beginning Balance</TableHeaderColumn> */}
                    <TableHeaderColumn dataField="end_charge_bal" dataSort  >Ending Balance</TableHeaderColumn>
                </BootstrapTable>
            </>
        )
    }



    render() {
        const { addons, data } = this.state;

        var filename = "Payments-" + this.props.location.state.ledname + "-" + this.props.location.state.type;

        return (
            <>
                <div className="contentTransactSales">
                    <Link to={{ pathname: this.props.location.state.path, state: { id: this.props.location.state.id, path: this.props.location.state.path } }}>
                        <Button icon labelPosition='left'><Icon name='angle left' /> Back to Tansaction view </Button>
                    </Link>



                    <ReactHTMLTableToExcel
                        id="test-table-xls-button"
                        className=" ui button"

                        table="allItemsB"
                        filename={filename}
                        sheet="tablexls"
                        buttonText="Download as Excel" />

                    {<h1>{this.props.location.state.type} -  {this.props.location.state.ledname}</h1>}


                    <div style={{ display: "none" }}>
                        <PrintReportItem

                            data={data}
                            print="normal"
                            sdate={this.props.location.state.begDate}
                            edate={this.props.location.state.endDate}
                            type="General"
                            ref={el => (this.itemRef = el)}
                        />

                    </div>
                    <br />
                    <br />
                    {this.allpays()}

                </div>
            </>
        );
    }
}
export default ExRep;