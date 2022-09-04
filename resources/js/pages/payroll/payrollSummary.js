import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../Http';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import { Link } from 'react-router-dom';
import PrintPayroll from '../prints/printPayroll';
import ReactToPrint, { PrintContextConsumer } from "react-to-print";

class PayrollSummary extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);

        // Initial state.
        this.state = {

            data: [],
            assig: [],
            sec: [],
            om: [],
            am: [],
        };

        // API endpoint.
        this.api = '/api/v1/payroll/getsummary';
    }
    componentDidMount() {
        this._isMounted = true
        const subs = {
            beg_date: this.props.location.state.sdate,
            end_date: this.props.location.state.edate

        }
        console.log(subs)
        Http.post(`${this.api}`, subs)
            .then((response) => {

                var assig = response.data.assig
                // console.log(response.data.assig)
                var sec = assig.filter(function (v) {
                    return v.position == "Secretary";
                })

                var om = assig.filter(function (v) {
                    return v.position == "Operation Manager";
                })

                var am = assig.filter(function (v) {
                    return v.position == "Account Manager";
                })

                if (this._isMounted) {
                    this.setState({
                        data: response.data.summary,
                        assig: response.data.assig,
                        sec: sec,
                        om: om,
                        am: am,
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
    netFormatter = (cell, row) => {
        const formatter = new Intl.NumberFormat('fil', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2
        })
        return (
            formatter.format(row.net)
        );
    }

    summary = (print) => {

        const { data, assig, sec, om, am } = this.state;
        const sd = new Date(this.props.location.state.sdate);
        const sye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(sd);
        const smo = new Intl.DateTimeFormat('en', { month: 'short' }).format(sd);
        const sda = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(sd);

        const ed = new Date(this.props.location.state.edate);
        const eye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(ed);
        const emo = new Intl.DateTimeFormat('en', { month: 'short' }).format(ed);
        const eda = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(ed);
        var net = 0;
        data.map((pr) => {
            net += pr.net
        })
        const formatter = new Intl.NumberFormat('fil', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2
        })




        // console.log(sec[0].employee)
        return (
            <>

                <center><h5>{smo + '. ' + sda + ', ' + sye}-{emo + '. ' + eda + ', ' + eye}</h5></center>
                <br />
                <BootstrapTable
                    ref='table'
                    data={data}
                    pagination={print ? false : true}
                    search={print ? false : true}
                // style={itemTabs}

                // options={options} exportCSV
                >
                    <TableHeaderColumn dataField='id' hidden={true} isKey >Code</TableHeaderColumn>
                    <TableHeaderColumn dataField='employee' width="150" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }}>Name</TableHeaderColumn>
                    <TableHeaderColumn dataField='position' width="100" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }}  >Position</TableHeaderColumn>
                    <TableHeaderColumn dataField='rate_per_day' width="65" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Rate/ day</TableHeaderColumn>
                    <TableHeaderColumn dataField="work_hours" hidden={true} width="75" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }}>Reg. Hours Worked</TableHeaderColumn>
                    <TableHeaderColumn dataField="project_hours" hidden={true}>Project hours</TableHeaderColumn>
                    <TableHeaderColumn dataField='rate_per_hour' width="80" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Rate/ hour</TableHeaderColumn>
                    <TableHeaderColumn dataField='total_hours' width="60" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Total hours</TableHeaderColumn>
                    <TableHeaderColumn dataField='gross' width="85" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >GSA</TableHeaderColumn>
                    <TableHeaderColumn dataField='rate_per_hour_ot' width="75" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Rate/ hour OT</TableHeaderColumn>
                    <TableHeaderColumn dataField='total_ot' width="60" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Total hours OT</TableHeaderColumn>
                    <TableHeaderColumn dataField='incentive' width="90" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Incentive</TableHeaderColumn>
                    <TableHeaderColumn dataField='cash_ad' width="85" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >C.A</TableHeaderColumn>
                    <TableHeaderColumn dataField='deduction' width="95" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Deduction</TableHeaderColumn>
                    <TableHeaderColumn dataField='net' dataFormat={this.netFormatter} width="100" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Net</TableHeaderColumn>
                    <TableHeaderColumn dataField=' ' hidden={print ? false : true} width="100" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Signature</TableHeaderColumn>


                </BootstrapTable>
                {
                    print ?
                        <>
                            <div style={{ float: "right" }}>
                                <br />
                                <p class="inline_block">Total: </p>&nbsp;&nbsp;&nbsp;
                                <p class="inline_block"><input disabled class="form-control" value={formatter.format(net)} style={{ width: "70%" }} /></p>
                            </div>

                            <br />
                            <br />
                            <br />
                            <br />
                            <br />
                            <div style={{padding: "2%"}}>
                                {sec.map((pr) => (
                                    <div class="inline_block" style={{ float: "left" }}>
                                        Prepared By: <br /><br />

                                        <center>
                                            <b><u>{pr.employee}</u></b><br />
                                            {pr.position}
                                        </center>
                                    </div>
                                ))
                                }

                                {am.map((pr) => (
                                    <div class="inline_block" style={{width: "10%", marginLeft: "37%", marginRight: "50%", position: "absolute"}}>
                                        
                                        Reviewed By: <br /><br />

                                        <center>
                                            <b><u>{pr.employee}</u></b><br />
                                            {pr.position}
                                        </center>
                                    </div>
                                ))
                                }


                                {om.map((pr) => (
                                    <div class="inline_block" style={{ float: "right" }}>
                                        Approved By: <br /><br />

                                        <center>
                                            <b><u>{pr.employee}</u></b><br />
                                            {pr.position}
                                        </center>
                                    </div>
                                ))
                                }
                            </div>
                        </>
                        : <></>
                }
            </>
        );


    }

    render() {

        return (
            <div style={{ marginTop: "2%", marginLeft: "3%", marginRight: "3%" }}>
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"> <Link to="/payroll"><a href="#">Employee Management</a></Link></li>
                        <li class="breadcrumb-item active" aria-current="page">Summary</li>
                    </ol>
                </nav>
                <ReactToPrint

                    trigger={() =>
                        <button class="ui button inline_block " >
                            Print
                        </button>}
                    content={() => this.componentRef}
                />
                <div style={{ display: "none" }} >

                    <PrintPayroll
                        itms={this.summary("yes")}
                        ref={el => (this.componentRef = el)}

                    />
                </div>
                {this.summary()}
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    isAuthenticated: state.Auth.isAuthenticated,
    user: state.Auth.user,
});

export default connect(mapStateToProps)(PayrollSummary);
