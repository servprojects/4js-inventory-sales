import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../Http';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { DateRangePicker } from 'react-date-range';
import { addDays } from 'date-fns';
import { Dropdown } from 'semantic-ui-react';//filt_branch
import 'semantic-ui-css/semantic.min.css';//filt_branch
import ReactToPrint from "react-to-print";
import PrintReport from '../prints/printReport';
import classNames from 'classnames';
import ReactHTMLTableToExcel from 'react-html-table-to-excel';
import ExHead from '../prints/excelHeader';

class StockReport extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);

        // Initial state.
        this.state = {
            generated: null,
            error: null,
            load: false,
            upIdItem: null,
            edate: null,
            sdate: null,
            branch_id: null,
            branch: null,
            upIdItem: null,
            role: null,
            branches: [],//filt_branch
            data: [],
            tranItems: [],
            datesel: [
                {
                    startDate: new Date(),
                    endDate: addDays(new Date(), 7),
                    key: 'selection'
                }
            ],
        };
        // API endpoint.
        this.api = '/api/v1/reports/sales';
    }
    componentDidMount() {
        this._isMounted = true
        if (this._isMounted) { this.setState({ load: true }); };
        const subs = {
            branch: this.props.location.state.bid,
            role: this.props.location.state.role,

        }
        Http.post(`/api/v1/reports/stocks`, subs)
            .then((response) => {
                // const { data } = response.data.transaction.data;
                if (this._isMounted) {

                    this.setState({
                        data: response.data.rep,
                        branches: response.data.branches,//filt_branch
                        role: response.data.role,//filt_branch
                        sdate: response.data.sd,//filt_branch
                        edate: response.data.ed,//filt_branch
                        load: false,
                    });
                }
            })

            .catch(() => {
                if (this._isMounted) {
                    this.setState({
                        error: 'Unable to fetch data.',
                        load: false,
                    });
                }
            });
    }
    handleSelect = (item) => {
        // console.log(date); // native Date object
        this._isMounted = true
        if (this._isMounted) {
            this.setState({
                datesel: [item.selection]
            })
        }
        var sd = item.selection.startDate;
        var day = String(sd.getDate());
        if (day.length == 1) {
            day = "0" + day;
        }
        var month = String(sd.getMonth() + 1);
        var year = String(sd.getFullYear());
        var sdate = year + "-" + month + "-" + day;

        var ed = item.selection.endDate;
        var day = String(ed.getDate());
        if (day.length == 1) {
            day = "0" + day;
        }
        var month = String(ed.getMonth() + 1);
        var year = String(ed.getFullYear());
        var edate = year + "-" + month + "-" + day;

        if (this._isMounted) {
            this.setState({
                sdate: sdate,
                edate: edate,
            })
        }


        // console.log(sdate)
        // console.log(edate)

    }
    handleReport = (e) => {
        this._isMounted = true
        Http.post(`/api/v1/reports/stocks`, { end_date: this.state.edate, start_date: this.state.sdate, branch: this.state.branch_id })
            .then((response) => {
                // const { data } = response.data.transaction.data;
                if (this._isMounted) {

                    this.setState({
                        data: response.data.rep,
                        generated: "yes"

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
    myChangeHandlerbranch = (e, { value }) => {
        if (this._isMounted) {
            this.setState({ branch_id: value });
        }



    };
    details = (e) => {
        const { branches } = this.state;
        var key = this.state.branch_id;
        if (this.state.branch_id) {
            var result = branches.filter(function (v) {
                return v.id == key;
            })
            var name = result[0].name
        }


        return (
            <div>
                <table>
                    <tr><td>Start date</td><td>:</td><td>{this.state.sdate}</td> </tr>
                    <tr><td>End date</td><td>:</td><td>{this.state.edate}</td></tr>
                    <tr><td>Branch</td><td>:</td><td>{name}</td></tr>
                </table>
            </div>
        );
    }
    itms = (e) => {
        const { data } = this.state;

        return (<div>

            <BootstrapTable
                ref='table'
                // data={this.props.data}
                data={data}
                pagination={e ? false : true}
                search={e ? false : true}
            // options={options} exportCSV
            >
                <TableHeaderColumn dataField='item_id' hidden={true}  >item_id</TableHeaderColumn>
                <TableHeaderColumn width="150" dataField='code' isKey={true}>Code</TableHeaderColumn>
                <TableHeaderColumn dataField='name' tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} width="300">Item Description</TableHeaderColumn>
                {/* <TableHeaderColumn dataField='size' >Size</TableHeaderColumn>
                    <TableHeaderColumn dataField='unit' >Unit</TableHeaderColumn> */}
                <TableHeaderColumn width="90" dataField='unit_price' >SRP</TableHeaderColumn>
                <TableHeaderColumn dataField='first_end_bal' width="90" >Beg. Bal</TableHeaderColumn>
                <TableHeaderColumn dataField='last_end_bal' width="90" >End Bal</TableHeaderColumn>
                <TableHeaderColumn dataFormat={this.unFormat} dataField='unit_sold' width="90" >Unit Sold</TableHeaderColumn>
                <TableHeaderColumn dataField='total_unit_price' >Total Unit Cost</TableHeaderColumn>
                <TableHeaderColumn dataFormat={this.unCostFormat} dataField='total_unit_price_sold' >Total Unit Sold Cost</TableHeaderColumn>
                <TableHeaderColumn dataField='collectible' >Collectible</TableHeaderColumn>
                {/* <TableHeaderColumn dataField='total_items' hidden={hidtitems} width="100" >Total Items</TableHeaderColumn>
                    <TableHeaderColumn dataField='t_id' hidden={hidtitems} dataFormat={this.buttonFormatter} width="90">Items</TableHeaderColumn> */}
            </BootstrapTable>




        </div>);
    }

    itmsOld = (e) => {
        const { data } = this.state;


        return (<div>
            <h1>Stock Report</h1>
            {/* {this.state.branch_id} */}
            <BootstrapTable

                // data={this.props.data}
                data={data}


            >
                <TableHeaderColumn dataField='item_id' hidden={true}  >item_id</TableHeaderColumn>
                <TableHeaderColumn dataField='code' width="120" hidden={true} isKey={true}>Code</TableHeaderColumn>
                <TableHeaderColumn dataField='name' tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} width="300">Item Description</TableHeaderColumn>
                {/* <TableHeaderColumn dataField='size' >Size</TableHeaderColumn>
                    <TableHeaderColumn dataField='unit' >Unit</TableHeaderColumn> */}
                <TableHeaderColumn dataField='unit_price' width="90" >SRP</TableHeaderColumn>
                <TableHeaderColumn dataField='first_end_bal' width="90" >Beg. Bal</TableHeaderColumn>
                <TableHeaderColumn dataField='last_end_bal' width="90" >End Bal</TableHeaderColumn>
                <TableHeaderColumn dataField='unit_sold' width="90" >Unit Sold</TableHeaderColumn>
                <TableHeaderColumn dataField='total_unit_price' >Total Unit Cost</TableHeaderColumn>
                <TableHeaderColumn dataField='total_unit_price_sold' >Total Unit Sold Cost</TableHeaderColumn>
                <TableHeaderColumn dataField='collectible' >Collectible</TableHeaderColumn>
                {/* <TableHeaderColumn dataField='total_items' hidden={hidtitems} width="100" >Total Items</TableHeaderColumn>
                    <TableHeaderColumn dataField='t_id' hidden={hidtitems} dataFormat={this.buttonFormatter} width="90">Items</TableHeaderColumn> */}
            </BootstrapTable>




        </div>);
    }
    dateFormat = (s, e) => {
        const sd = new Date(s);
        const sye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(sd);
        const smo = new Intl.DateTimeFormat('en', { month: 'short' }).format(sd);
        const sda = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(sd);

        const ed = new Date(e);
        const eye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(ed);
        const emo = new Intl.DateTimeFormat('en', { month: 'short' }).format(ed);
        const eda = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(ed);
        return (<> {smo + '. ' + sda + ', ' + sye}-{emo + '. ' + eda + ', ' + eye} </>)
    }
    unFormat = (cell, row) => {
        var normal = row.unit_sold;
        if (row.unit_sold < 0) {
            normal = Math.abs(row.unit_sold)
        }

        return normal
    }
    unCostFormat = (cell, row) => {
        var normal = row.total_unit_price_sold;
        if (row.total_unit_price_sold < 0) {
            normal = Math.abs(row.total_unit_price_sold)
        }

        return normal
    }

    getExcel = (r) => {
        const { data } = this.state;
        var range = " ";


        if (this.state.sdate) {

            var sd = new Date(this.state.sdate);
            var sye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(sd);
            var smo = new Intl.DateTimeFormat('en', { month: 'numeric' }).format(sd);
            var smoS = new Intl.DateTimeFormat('en', { month: 'short' }).format(sd);
            var sda = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(sd);

            var ed = new Date(this.state.edate);
            var eye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(ed);
            var emo = new Intl.DateTimeFormat('en', { month: 'numeric' }).format(ed);
            var emoS = new Intl.DateTimeFormat('en', { month: 'short' }).format(ed);
            var eda = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(ed);


            range = smoS + " " + sda + ", " + sye + "-" + emoS + " " + eda + ", " + eye;


        }



        return (<>

            <table id="stockrepEx" class="table table-bordered" >
                <thead>
                    <ExHead
                        colspan="9"
                        title="Stock Report"
                        rangeSR={range}
                    />
                    <tr>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Unit Price</th>
                        <th>Beg. Bal</th>
                        <th>End Bal</th>
                        <th>Unit Sold</th>
                        <th>Total Unit Cost</th>
                        <th>Total Unit Sold Cost</th>
                        <th>Collectible</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((itm, index, arr) => (
                        <tr>
                            <td>{itm.code}</td>
                            <td>{itm.name}</td>
                            <td>{itm.unit_price}</td>
                            <td>{itm.first_end_bal}</td>
                            <td>{itm.last_end_bal}</td>
                            <td>{itm.unit_sold < 0 ? Math.abs(itm.unit_sold) : itm.unit_sold}</td>
                            <td>{itm.total_unit_price}</td>
                            <td>{itm.total_unit_price_sold < 0 ? Math.abs(itm.total_unit_price_sold) : itm.total_unit_price_sold}</td>
                            <td>{itm.collectible}</td>
                        </tr>
                    ))}

                </tbody>
            </table >

        </>

        );

    }




    render() {
        const { data, branches, load } = this.state;
        const options = {
            exportCSVBtn: this.createCustomExportCSVButton
        };
        //filt_branch
        var _hidbranch = this.state.hidbranch;
        var dptemp = branches;
        var exist = "no";
        dptemp.map((itemex) => {
            if (itemex.id == "all") {
                exist = "yes";
            }
        })

        if (exist == "no") {
            const subs = {
                id: "all",
                name: "All Branch",
            }
            dptemp.push(subs);
        }
        const branch = dptemp.map((brnch) => ({ key: brnch.id, value: brnch.id, text: brnch.name }));
        console.log(branch)
        var hidFilt = { display: "none" }
        if (this.state.role == "Superadmin") {
            hidFilt = { display: "block" }
        }



        if (this.state.sdate) {

            var sd = new Date(this.state.sdate);
            var sye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(sd);
            var smo = new Intl.DateTimeFormat('en', { month: 'numeric' }).format(sd);
            var smoS = new Intl.DateTimeFormat('en', { month: 'short' }).format(sd);
            var sda = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(sd);

            var ed = new Date(this.state.edate);
            var eye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(ed);
            var emo = new Intl.DateTimeFormat('en', { month: 'numeric' }).format(ed);
            var emoS = new Intl.DateTimeFormat('en', { month: 'short' }).format(ed);
            var eda = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(ed);


        }

        var filename = "Stock_Report" + "_" + sye + smo + sda + "_" + eye + emo + eda;

        return (
            <div>

                <div class='contentTransactSales'>
                    <div className={classNames('ui  inverted dimmer loads', {
                        'active': load,
                    })} >
                        <center>
                            <div class="ui text loader">Loading</div>
                        </center>
                    </div>
                    {/* <TemplateReport   
                title="General Transactions" 
                data={data}
                /> */}
                    <div class="inline_block">
                        <div style={{ position: "relative" }}>
                            <DateRangePicker
                                onChange={this.handleSelect}
                                showSelectionPreview={true}
                                moveRangeOnFirstSelection={false}
                                months={2}
                                ranges={this.state.datesel}
                                direction="horizontal"
                                data-key="Hello"
                            />
                        </div>

                    </div>

                &nbsp;&nbsp;&nbsp;&nbsp;
                <div class="inline_block" >
                        <div style={{ width: "100%", position: "absolute" }}>
                            <div style={{ width: "20%" }}>
                                <div style={hidFilt}>
                                    <Dropdown
                                        type="select"
                                        placeholder='Select branch'
                                        fluid
                                        search
                                        selection
                                        // style={req_inpt}
                                        onChange={this.myChangeHandlerbranch}
                                        options={branch}
                                        id="addItem"
                                        name="brand_id"
                                        required
                                    />
                                </div>
                            </div>

                            <br />
                            <button class="btn btn-primary" onClick={this.handleReport}>Generate report</button>
                            <br />
                            <br />
                            {
                                this.state.role == "Superadmin" ?
                                    <>
                                        {
                                            this.state.branch_id && this.state.branch_id != "all" && this.state.generated == "yes" ?
                                                <>
                                                    <ReactHTMLTableToExcel
                                                        id="itemsEx"
                                                        className=" btn btn-primary"
                                                        table="stockrepEx"
                                                        filename={filename}
                                                        sheet="Stock report"
                                                        buttonText="Download Excel" />
                                                    {/* <ReactToPrint

                                                        trigger={() => <button class="btn btn-primary" >Print report</button>}

                                                        content={() => this.componentRef}
                                                    />

                                                    <div style={{ display: "none" }}>


                                                        <PrintReport
                                                            details={this.details()}
                                                            itms={this.itms("print")}
                                                            ref={el => (this.componentRef = el)}



                                                        />
                                                    </div> */}
                                                </>
                                                :
                                                <>
                                                </>

                                        }
                                    </>
                                    :
                                    <>
                                        {/* <ReactToPrint

                                            trigger={() => <button class="btn btn-primary" >Print report</button>}

                                            content={() => this.componentRef}
                                        />

                                        <div style={{ display: "none" }}>


                                            <PrintReport
                                                details={this.details()}
                                                itms={this.itms()}
                                                ref={el => (this.componentRef = el)}



                                            />
                                        </div> */}
                                        <ReactHTMLTableToExcel
                                            id="itemsEx"
                                            className=" btn btn-primary"
                                            table="stockrepEx"
                                            filename={filename}
                                            sheet="Stock report"
                                            buttonText="Download Excel" />
                                    </>

                            }

                        </div>
                    </div>


                    <h1>Stock Report</h1><div style={{ float: "right" }}> {this.dateFormat(this.state.sdate, this.state.edate)}</div>
                    <i>*Stock report does not include the historical transaction of items.</i><br /><br />
                    {/* {this.state.branch_id} */}
                    {
                        this.state.role == "Superadmin" ?
                            <>
                                {
                                    this.state.branch_id && this.state.branch_id != "all" && this.state.generated == "yes" ?

                                        <>
                                            {/* fdsfds */}
                                        {this.itms()}
                                            <div style={{ display: "none" }}>

                                                {this.getExcel()}

                                            </div>
                                        </>

                                        :
                                        <>
                                            <hr />
                                            <center><h3>--Please specify date range and branch to generate report--</h3></center>
                                        </>

                                }
                            </>
                            :
                            <>
                                {/* fdsfds */}
                                {this.itms()}
                                <div style={{ display: "none" }}>
                                    <table id="stockrep" class="table table-bordered" >
                                        {this.getExcel()}
                                    </table >
                                </div>
                            </>

                    }
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    isAuthenticated: state.Auth.isAuthenticated,
    user: state.Auth.user,
});

export default connect(mapStateToProps)(StockReport);
