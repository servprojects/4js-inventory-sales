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
import MinDate from './miniDateRange';

class SpecSupplierLedger extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);

    // Initial state.
    this.state = {
      error: null,
      upIdItem: null,
      sdate:null,
      edate:null,
      data: [],
      tranItems: [],
      supplier: [],
    };
    // API endpoint.
    this.api = '/api/v1/reports/sales';
  }
  componentDidMount() {
    this._isMounted = true
    Http.post(`/api/v1/reports/specsupplierLedger`, { id: this.props.location.state.id })
      .then((response) => {
        // const { data } = response.data.transaction.data;
        if (this._isMounted) {

          this.setState({
            data: response.data.ledger,
            supplier: response.data.supplier,

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
  setUpId = (e) => {
    this._isMounted = true
    const { key } = e.target.dataset;
    if (this._isMounted) {
      this.setState({ upIdItem: key })
    }

    Http.post(`/api/v1/reports/saleItems`, { id: key })
      .then((response) => {
        // const { data } = response.data.transaction.data;
        if (this._isMounted) {

          this.setState({
            tranItems: response.data.items,

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



  };

  buttonFormatter = (cell, row) => {
    const { tranItems } = this.state;
    return (
      //  <button
      //  type="button"
      //  className="btn btn-primary"
      //  data-key={row.id}
      //  >
      //  Receive
      //  </button>
      <div>
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#exampleModal" >
          Ledger
    </button>

      </div>
    )
  }
  uplogicon = (cell, row) => {
    const { supplier } = this.state;
    var ledName;
    supplier.map((itm) => { ledName = itm.name })
    return (
      <>
{/* /updatLog/receiving/credit */}
        <Link to={{
          pathname:  row.transaction_type == "Credit"? '/updatLog/receiving/credit' : '/updatLog', state: {
            id:  this.props.location.state.id,
            code: row.transaction_type == "Credit" ? row.charge_transaction_code : row.code,
            // code: row.transaction_type == "Credit" ? row.charge_transaction_code : row.code,
            itm: ledName,
            path: '/specSupplierLedger',
            type: "supplier",
            trans_type: row.transaction_type
          }
        }} ><i class="file alternate icon"></i></Link>

      </>
    )
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
            <TableHeaderColumn dataField='last_update' >Last update</TableHeaderColumn>
            <TableHeaderColumn width="50" hidden={print ? true : false} dataField='updated_at' dataFormat={this.uplogicon} ></TableHeaderColumn>

          </BootstrapTable>
        </div>
      </>
    );
  }
  getDates = (data) =>{
    this._isMounted = true
    
    if (this._isMounted) {
    this.setState({
      sdate: data.from_date,
      edate: data.to_date,
    });
  }

  const subs = {
    from_date: data.from_date,
    to_date: data.to_date,
    id: this.props.location.state.id, 
  }
  Http.post(`/api/v1/reports/specsupplierLedger`, subs)
  .then((response) => {
    // const { data } = response.data.transaction.data;
    if (this._isMounted) {

      this.setState({
        data: response.data.ledger,
        supplier: response.data.supplier,

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



  render() {
    const { data, supplier } = this.state;
    var ledName;

    supplier.map((itm) => { ledName = itm.name })
    return (
      <div className="contentledgerSpec" >
        {/* className="contentTransact" */}
        <Link to="/supplierLedger"><Button  > Back </Button></Link>
        <Link to={{
          pathname: `/deleted/credits`, state: {
            
            path: this.props.location.state.path,
            id: this.props.location.state.id,
            type: "Supplier",
            ledname: ledName
          }
        }}>
          <Button style={{ float: "right" }} >Deleted Credits</Button>
        </Link>
        <div style={{ float: "right" }}>
          <Link to={{
            pathname: `/report/excel/preview/ledger`, state: {

              path: this.props.location.state.path,
              id: this.props.location.state.id,
              data: data,
              type: "Supplier",
              ledname: ledName
            }
          }}>
            <Button > Excel Preview</Button>
          </Link>
        </div>
        &nbsp;&nbsp;&nbsp;
        <ReactToPrint

          trigger={() => <Button style={{ float: "right" }} >Print Report</Button>}

          content={() => this.componentRef}
        />
        {/* {this.props.location.state.id} */}
        {/* {supplier.map((itm) => (<h1>{ledName = itm.name}</h1>))} */}
        <h1>{ledName}</h1>
        
        <MinDate dates={this.getDates}  />
        {this.itms(data)}
        {/* {this.state.upIdItem} */}
        <div style={{ display: "none" }}>
          <PrintReport
            // details={this.details(this.props.branchName, this.props.branches)}
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

export default connect(mapStateToProps)(SpecSupplierLedger);
