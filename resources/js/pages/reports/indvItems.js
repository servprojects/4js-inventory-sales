import React, { Component, useRef } from 'react';
// import PrintHeader from './printHeader';
import Http from '../../Http';
import { connect } from 'react-redux';
import ReactToPrint from "react-to-print";
import { Dropdown, Icon, Button } from 'semantic-ui-react';
import PrintReportItem from '../prints/printReportItem';
import PrintAllReleasesItem from '../prints/printAllReleases';
import { Link } from 'react-router-dom';
import ReactHTMLTableToExcel from 'react-html-table-to-excel';
class PrintReport extends Component {
    _isMounted = false
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            addons: [],
            normal: "normal",
            sysmode: "normal",
            viewType: "sales",
            headerType: "All Releases",
            // headerType: "Sale & Charge Releases",
        }
    }

    componentDidMount() {
      this.getSaleReleases();
      this.getSystemMode();
    }

    supFormatter = (cell, row) => {
        var text;
        if (row.supplier == null) {
          
         
          var desc = JSON.parse(row.t_desc);
         
          if (Array.isArray(desc)) {
              text = desc[0].sender;
          } else {
            // NC Not Covered for the latest update of specifying whos the branched reelased the items
            text = "Main Branch (NC)";
          }
        } else {
          text = row.supplier;
        }

        return(
            <>
            {text}
            </>
        )
    }

    allItemsView = () => {
        const {branchName, role} = this.props.location.state;
       
        return (
            <>
            
              <h1> Receiving {role != 'Superadmin' ? <> </>: <>- {branchName}</>} </h1>
                <BootstrapTable
                    // ref='table'
                    data={this.state.data}
                    pagination={true}
                    search={true}
                // cellEdit={cellEditProp}
                // deleteRow={true} selectRow={selectRowProp} options={options}
                >
                    <TableHeaderColumn dataField='id' width="30" hidden={true} isKey={true} dataFormat={this.buttonFormatterDel}  ></TableHeaderColumn>
                    <TableHeaderColumn dataField='branch' width="120" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Branch</TableHeaderColumn>
                    <TableHeaderColumn dataField='date' width="120" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >DATE</TableHeaderColumn>
                    <TableHeaderColumn dataField='quantity' width="80" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >QTY</TableHeaderColumn>
                    <TableHeaderColumn dataField='unit' width="100" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >UNIT</TableHeaderColumn>
                    <TableHeaderColumn dataField='supplier' dataFormat={this.supFormatter} width="200" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >SUPPLIER</TableHeaderColumn>
                    <TableHeaderColumn dataField='item' tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >ITEM DESCRIPTION</TableHeaderColumn>
                    <TableHeaderColumn dataField='brand' width="100" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }}  >BRAND</TableHeaderColumn>
                    <TableHeaderColumn dataField='original_price' width="100" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }}  >UNIT PRICE</TableHeaderColumn>
                    <TableHeaderColumn dataField='amount' width="120" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >AMOUNT</TableHeaderColumn>
                    <TableHeaderColumn dataField='unit_price' width="80" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >SRP</TableHeaderColumn>
                    <TableHeaderColumn dataField='t_desc' hidden width="80" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} ></TableHeaderColumn>
                    <TableHeaderColumn dataField='id' width="120" dataFormat={this.totalFormat} tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >TOTAL</TableHeaderColumn>


                </BootstrapTable>
            </>
        )
    }

    saleReleaseView = () => {
        const {branch_name} = this.props.location.state;
        const {viewType} = this.state;
        console.log(this.state.data)
        return (
            <>
                <h1> { this.state.headerType }- {branch_name} </h1>
                {/* <h1> { viewType == "sales" ?  "Sales Releases" : "All Releases" }- {branch_name} </h1> */}


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
                    <TableHeaderColumn dataField='receipt_code' width="120" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >OR#</TableHeaderColumn>
                    <TableHeaderColumn dataField='date_transac' width="120" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >DATE</TableHeaderColumn>
                    <TableHeaderColumn dataField='branch_name' width="130"  tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Branch</TableHeaderColumn>
                    <TableHeaderColumn dataField='item_status' width="130" hidden tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >STATUS</TableHeaderColumn>
                    <TableHeaderColumn dataField='item_id' hidden width="100" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >ITM ID</TableHeaderColumn>
                    <TableHeaderColumn dataField='accountability' width="150" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >ACCOUNTABILITY</TableHeaderColumn>
                    <TableHeaderColumn dataField='item'  width="300" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }}  >ITM</TableHeaderColumn>
                    <TableHeaderColumn dataField='brand' width="120" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >BRAND</TableHeaderColumn>
                    <TableHeaderColumn dataField='unit' width="80" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >UNIT</TableHeaderColumn>
                    <TableHeaderColumn dataField='quantity' width="100" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >QTY</TableHeaderColumn>
                    <TableHeaderColumn dataField='srp' width="90" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }}  >SRP</TableHeaderColumn>
                    <TableHeaderColumn dataField='subtotal' width="120" dataFormat={this.totalFormat} tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >SUBTOTAL</TableHeaderColumn>
                    <TableHeaderColumn dataField='total' width="120" dataFormat={this.totalFormat} tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >TOTAL</TableHeaderColumn>
                    <TableHeaderColumn dataField='description' width="120" dataFormat={this.totalFormat} tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Desc</TableHeaderColumn>
                    <TableHeaderColumn dataField='transaction_type' width="120"  tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Type</TableHeaderColumn>


                </BootstrapTable>
            </>
        )
    }


    setNormalPrint = (e) => {
        this._isMounted = true
        if (this._isMounted) {

            this.setState({
                normal: "no",

            });
        }
    }
    // 
    // GenindivChargeRev
    getSaleReleases = (e) =>{
        this._isMounted = true
        // var { htype} = e.target.dataset;
        // htyper = htype ? htype : this.state.headerType;
        const { type } = this.props.location.state;
        var api = type == "Receiving" ? `/api/v1/reports/indvPur` : type == "General" ? `/api/v1/reports/indvSalesRev` : " ";
        if (this._isMounted) {
            this.setState({
                viewType: 'sales',
                headerType: "All Releases"
                // headerType: "Sale & Charge Releases"
            });
        }
        const subs = {
            type: type,
            begdate: this.props.location.state.begDate,
            enddate: this.props.location.state.endDate,
            branch: this.props.location.state.branch,
            branch_id:  this.props.location.state.branch_id
        }
        console.log(subs)
        Http.post(api, subs)
            .then((response) => {

                if (this._isMounted) {

                    this.setState({
                        data: response.data.items,

                    });
                    if (type == "General") {
                        console.log("addons")
                        console.log(response.data.addons)
                        this.setState({
                            addons: response.data.addons,

                        });
                    }

                }
            })

            .catch((error) => {
                console.log(error)
            });

    }


    getReleases = (e) =>{
        this._isMounted = true
        const {ttype, htype} = e.target.dataset;
        const { type } = this.props.location.state;
        var api = `/api/v1/reports/GenindivRev` ;
        if (this._isMounted) {
            this.setState({
                viewType: 'sales',
                headerType: htype
            });
        }
        const subs = {
            type: type,
            // trans_type: "Charge",
            trans_type: ttype,
            begdate: this.props.location.state.begDate,
            enddate: this.props.location.state.endDate,
            branch: this.props.location.state.branch
        }
        console.log(subs)
        Http.post(api, subs)
            .then((response) => {

                if (this._isMounted) {

                    this.setState({
                        data: response.data.items,

                    });
                    if (type == "General") {
                        console.log("addons")
                        console.log(response.data.addons)
                        this.setState({
                            addons: response.data.addons,

                        });
                    }

                }
            })

            .catch((error) => {
                console.log(error)
            });

    }

    getSystemMode() {
        Http.post(`/api/v1/sysmode`)
          .then(({ data }) => {
            console.log("data.spec")
            console.log(data.spec)
    
           
           
            if (this._isMounted) {
                 this.setState({ sysmode: data.spec  }); 

                 console.log("data.spec")
                 console.log(data.spec)
                 if(data.spec == "pos"){
                    
                    this.setState({ htype: "Sale Releases"  }); 
                 }
                };


          })
          .catch(() => {
            this.setState({
              error: 'Unable to fetch data.',
              load: false,
            });
          });
      }





    getAllReleases = (e) =>{
        this._isMounted = true
        const { type } = this.props.location.state;
        const {htype} = e.target.dataset;
        if (this._isMounted) {
            this.setState({
                viewType: 'all',
                headerType: htype
            });
        }
        const subs = {
            type: type,
            begdate: this.props.location.state.begDate,
            enddate: this.props.location.state.endDate,
            branch: this.props.location.state.branch
        }

        console.log(subs)
        Http.post('/api/v1/reports/indivAllRelease', subs)
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

    render() {
        var OrgType = this.props.location.state.type;
        const allitems = this.props.items;
        var sub = 0;
        const formatter = new Intl.NumberFormat('fil', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 3
        })
        const { data, addons } = this.state;
        // var str = this.props.type;
        // const title = str.toUpperCase() + " " + "REQUEST";
        // const data = [{
        //     id: 1,
        //     date_transac: "2020-11-10",
        //     quantity: 5,
        //     unit: "Bot",
        //     supplier: "ICM",
        //     item: "BODY FILLER EASY TITE",
        //     brand: "SEl",
        //     original_price: 56.23,
        //     amount: 500,
        //     unit_price: 899,
        // }]
        //    const data = this.allItems

        // console.log(data)
        var sd = 0, sye = 0, smo = 0, sda = 0, ed = 0, eye = 0, emo = 0, eda = 0;
        if (this.props.location.state.begDate) {

            sd = new Date(this.props.location.state.begDate);
            sye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(sd);
            smo = new Intl.DateTimeFormat('en', { month: 'numeric' }).format(sd);
            sda = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(sd);

            ed = new Date(this.props.location.state.endDate);
            eye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(ed);
            emo = new Intl.DateTimeFormat('en', { month: 'numeric' }).format(ed);
            eda = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(ed);

        }


        var type = this.props.location.state.type;
        var initial = " ";
        type == "Receiving" ? initial = "Purchases" : type == "General" ? initial = "SaleReleases" : initial = " ";
        var filename = initial + "_" + sye + smo + sda + "_" + eye + emo + eda;
        return (
            <>
                <div className="contentTransactSales">

                    <Link to={{ pathname: this.props.location.state.path, state: { type: this.props.location.state.type, path: this.props.location.state.path } }}>
                        <Button icon labelPosition='left'><Icon name='angle left' /> Back to Tansaction view </Button>
                    </Link>
                    <ReactToPrint
                        trigger={() => <Button icon labelPosition='left' onClick={this.setNormalPrint}><Icon name='print' /> Print </Button>}
                        content={() => this.itemRef}
                    />




                    <ReactHTMLTableToExcel
                        id="test-table-xls-button"
                        className=" ui button"
                        table={this.props.location.state.type}
                        filename={filename}
                        sheet="tablexls"
                        buttonText="Download as Excel" />

                    {
                        OrgType == "General" ?
                        <>
                            <Button onClick={this.getAllReleases} data-htype = "All Releases" style={{float: "right"}}>All releases</Button>
                         {this.state.sysmode != 'pos'? <>  <Button onClick={this.getSaleReleases} data-htype = "Sale & Charge Releases" style={{float: "right"}}>Sale & Charge releases</Button>
                            <Button onClick={this.getReleases}  data-ttype="Charge" data-htype = "Charge Releases" data style={{float: "right"}}>Charge releases</Button>
                            <Button onClick={this.getReleases} data-ttype="Sale" data-htype = "Sale Releases" style={{float: "right"}}>Sale releases</Button> </> : <></>}
                        </>
                            : <></>
                    }



                    <div style={{ display: "none" }}>


                       { 
                       this.state.viewType != "all" ?
                       <PrintReportItem
                            branch_name={this.props.location.state.branch_name}
                            branchName={this.props.location.state.branchName}
                            addons={addons}
                            data={data}
                            print="normal"
                            sdate={this.props.location.state.begDate}
                            edate={this.props.location.state.endDate}
                            type={this.props.location.state.type}
                            ref={el => (this.itemRef = el)}
                        />
                        
                        :
                        <PrintAllReleasesItem
                            branch_name={this.props.location.state.branch_name}
                            addons={addons}
                            data={data}
                            print="normal"
                            sdate={this.props.location.state.begDate}
                            edate={this.props.location.state.endDate}
                            type={this.props.location.state.type}
                            ref={el => (this.itemRef = el)}
                        />}
                    </div>



                    {
                        this.props.location.state.type == "Receiving" ?
                            this.allItemsView() :
                            this.props.location.state.type == "General" ?
                                this.saleReleaseView() : <></>
                    }

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
