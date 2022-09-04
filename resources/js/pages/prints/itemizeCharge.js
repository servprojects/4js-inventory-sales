import React, { Component, useRef } from 'react';
import { Link } from 'react-router-dom';
import ExHead from '../prints/excelHeader';
import { Dropdown, Icon, Button } from 'semantic-ui-react';
import ReactHTMLTableToExcel from 'react-html-table-to-excel';
import Http from '../../Http';
import PrintReportItem from '../prints/printReportItem';
class ExRep extends React.Component {

    _isMounted = false
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            addons: [],
            normal: "normal",
            sysmode: "normal",
        }
    }

    componentDidMount() {
        this._isMounted = true
        const { type } = this.props.location.state;
        var api = `/api/v1/reports/indivChargeRev` ;

        const subs = {
            type: type,
            id: this.props.location.state.id,
            from_date: this.props.location.state.sdate,
            to_date: this.props.location.state.edate,
        }
        console.log(subs)
        Http.post(api, subs)
            .then((response) => {

                if (this._isMounted) {

                    this.setState({
                        data: response.data.items,

                    });
                    console.log(response.data.items)
                    // if (type == "General") {
                        console.log("addons")
                        console.log(response.data.addons)
                        this.setState({
                            addons: response.data.addons,
    
                        });
                    // }

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

    getSystemMode() {
        Http.post(`/api/v1/sysmode`)
          .then(({ data }) => {
            console.log("data.spec")
            console.log(data.spec)
    
           
           
            if (this._isMounted) { this.setState({ sysmode: data.spec }); };
          })
          .catch(() => {
            this.setState({
              error: 'Unable to fetch data.',
              load: false,
            });
          });
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

    saleReleaseView = () => {
        return (
            <>
                <BootstrapTable
                    // ref='table'
                    data={this.state.data}
                    pagination={true}
                    search={true}
                // cellEdit={cellEditProp}
                // deleteRow={true} selectRow={selectRowProp} options={options}
                >
                    <TableHeaderColumn dataField='id' width="30" hidden={true} isKey={true} dataFormat={this.buttonFormatterDel}  ></TableHeaderColumn>
                    <TableHeaderColumn dataField='code' width="30" hidden={true} dataFormat={this.buttonFormatterDel}  ></TableHeaderColumn>
                    <TableHeaderColumn dataField='date_transac' width="120" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >DATE</TableHeaderColumn>
                    <TableHeaderColumn dataField='item_status' width="130" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >STATUS</TableHeaderColumn>
                    <TableHeaderColumn dataField='item_id' hidden width="100" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >ITM ID</TableHeaderColumn>
                    <TableHeaderColumn dataField='accountability' width="150" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >ACCOUNTABILITY</TableHeaderColumn>
                    <TableHeaderColumn dataField='item' tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }}  >ITM</TableHeaderColumn>
                    <TableHeaderColumn dataField='brand' width="120" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >BRAND</TableHeaderColumn>
                    <TableHeaderColumn dataField='unit' width="80" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >UNIT</TableHeaderColumn>
                    <TableHeaderColumn dataField='quantity' width="100" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >QTY</TableHeaderColumn>
                    <TableHeaderColumn dataField='srp' width="90" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }}  >SRP</TableHeaderColumn>
                    <TableHeaderColumn dataField='subtotal' width="120" dataFormat={this.totalFormat} tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >SUBTOTAL</TableHeaderColumn>
                    <TableHeaderColumn dataField='total' width="120" dataFormat={this.totalFormat} tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >TOTAL</TableHeaderColumn>


                </BootstrapTable>
            </>
        )
    }



    render() {
        const {addons, data} = this.state;
      
        var filename = "Charges-"+this.props.location.state.ledname+"-"+this.props.location.state.type;
        // const { branch, filter, type, begDate, endDate, branches } = this.props.location.state;
        // var sd = 0, sye = 0, smo = 0, sda = 0, ed = 0, eye = 0, emo = 0, eda = 0, smoS, emoS;
        // sd = new Date();
        // sye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(sd);
        // smo = new Intl.DateTimeFormat('en', { month: 'numeric' }).format(sd);
        // smoS = new Intl.DateTimeFormat('en', { month: 'short' }).format(sd);
        // sda = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(sd);
        // var blabel = branch ? " " + branch : " ALL";
        // var finitial = filter ? filter : type

        // var result = branches.filter(function (v) {
        //     return v.id == branch;
        // })
        // var branchname = " "
        // branch ? branchname = result[0].name : branchname = " ";
        // // var branchname = result[0].name
        // // var filename = finitial + "_" + sye + smo + sda + blabel;
        // var filename = finitial + "_" + begDate + "---" + endDate + "--" + branchname;

        // const ranges = {
        //     sye: sye,
        //     smoS: smoS,
        //     sda: sda
        // }
        return (
            <>
                <div className="contentTransactSales">
                    <Link to={{ pathname: this.props.location.state.path, state: { id:  this.props.location.state.id, path: this.props.location.state.path } }}>
                        <Button icon labelPosition='left'><Icon name='angle left' /> Back to Tansaction view </Button>
                    </Link>
                   
                    <ReactHTMLTableToExcel
                        id="test-table-xls-button"
                        className=" ui button"
                        // table={this.props.location.state.type}
                        table="General"
                        filename={filename}
                        sheet="tablexls"
                        buttonText="Download as Excel" />

                    <div style={{ display: "none" }}>
                        <PrintReportItem
                            addons={addons}
                            data={data}
                            print="normal"
                            sdate={this.props.location.state.begDate}
                            edate={this.props.location.state.endDate}
                            // type={this.props.location.state.type}
                            type="General"
                            ref={el => (this.itemRef = el)}
                        />
                    </div>
                    {this. saleReleaseView()}
                    {/* <ReactHTMLTableToExcel
                        id="allItems"
                        className=" ui button"
                        table="gen"
                        filename={filename}
                        sheet="all items"
                        buttonText="Download as Excel" />
                    <br />
                    <br />
                    <table id="gen" class="table table-bordered">
                        {this.content([], "show", ranges)}
                    </table> */}
                </div>
            </>
        );
    }
}
export default ExRep;