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
import { Dropdown, Button } from 'semantic-ui-react';//filt_branch
import MinDate from './miniDateRange';

class SpecItemLedger extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);

    // Initial state.
    this.state = {
      error: null,
      upIdItem: null,
      data: [],
      tranItems: [],
      item: [],
      branch_id: null,
      role: null,
      sdate: null,
      edate: null,
      branches: [],//filt_branch
    };
    // API endpoint.
    this.api = '/api/v1/reports/sales';
  }
  componentDidMount() {
    this._isMounted = true
    Http.post(`/api/v1/reports/specitemledger`, { id: this.props.location.state.id })
      .then((response) => {
        // const { data } = response.data.transaction.data;
        if (this._isMounted) {

          this.setState({
            data: response.data.ledger,
            item: response.data.item,
            branches: response.data.branches,
            role: response.data.role,

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
    const { item } = this.state;
    var ledName;
    item.map((itm) => { ledName = itm.name })
    return (
      <>

        <Link to={{
          pathname: row.transaction_type == "Receiving" ? '/updatLog/receiving' : '/updatLog', state: {
            id: this.props.location.state.id,
            code: row.code,
            trans_type: row.transaction_type,
            itm: ledName,
            path: '/specItemLedger',
            type: "item"
          }
        }} ><i class="file alternate icon"></i></Link>

      </>
    )
  }

  FormatUpDef = (cell, row) => {
    return(
      <>
      {row.item_status == "Update Defective" || row.item_status == "Defective" ? "N/A" : cell}
      </>
    )
  }

  

  FormatDef = (cell, row) => {
    return(
      <>
      {row.transaction_type == "Return" &&  row.item_status == "Defective" || row.transaction_type== "Update Defective" ? cell : "N/A"}
      </>
    )
  }


  itms = (e, print) => {
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
            <TableHeaderColumn isKey={true} width="180" dataField='code' >Code</TableHeaderColumn>
            <TableHeaderColumn width="130" dataField='date_transac' >Date</TableHeaderColumn>
            <TableHeaderColumn width="130" dataField='transaction_type' >Type</TableHeaderColumn>
            <TableHeaderColumn width="130" dataField='item_status' >Status</TableHeaderColumn>
            <TableHeaderColumn width="150" dataField='accountability' >Accountability</TableHeaderColumn>
            <TableHeaderColumn width="100" dataField='unit_price' >SRP</TableHeaderColumn>
            <TableHeaderColumn width="100" dataField='quantity' dataFormat={this.FormatUpDef} >Quantity</TableHeaderColumn>
            <TableHeaderColumn width="150" hidden={true} dataField='beg_balance' dataFormat={this.FormatUpDef} >Beg. Balance</TableHeaderColumn>
            <TableHeaderColumn width="150" dataField='end_balance' dataFormat={this.FormatUpDef} >End Balance</TableHeaderColumn>
            <TableHeaderColumn width="150" hidden={true} dataField='beg_collectible' >Beg Collectible</TableHeaderColumn>
            <TableHeaderColumn width="150" dataField='end_collectible'dataFormat={this.FormatUpDef} >End Collectible</TableHeaderColumn>
            <TableHeaderColumn width="140" dataField='beg_def_bal'dataFormat={this.FormatDef} >Beg. Defective Bal.</TableHeaderColumn>
            <TableHeaderColumn width="140" dataField='end_def_bal'dataFormat={this.FormatDef} >End Defective Bal.</TableHeaderColumn>
            <TableHeaderColumn width="200" dataField='updated_at' >Updated at</TableHeaderColumn>
            <TableHeaderColumn width="50" hidden={print ? true : false} dataField='updated_at' dataFormat={this.uplogicon} ></TableHeaderColumn>

          </BootstrapTable>
        </div>
      </>
    );
  }
  myChangeHandlerbranch = (e, { value, key }) => {
    this._isMounted = true
    if (this._isMounted) {

      this.setState({
        branch_id: value,

      });
    }

    Http.post(`/api/v1/reports/specitemledger`, { id: this.props.location.state.id, branch_id: value })
      .then((response) => {
        // const { data } = response.data.transaction.data;
        if (this._isMounted) {

          this.setState({
            data: response.data.ledger,

          });
        }
      })
    toast("Data fetched")
      .catch(() => {
        toast("Unable to fetch data")
      });

  };


  getDates = (data) => {
    this._isMounted = true

    if (this._isMounted) {
      this.setState({
        sdate: data.from_date,
        edate: data.to_date,
      });
    }
    // this.getAllData(data.from_date, data.to_date);

    const subs = {
      from_date: data.from_date,
      to_date: data.to_date,
      id: this.props.location.state.id,
      branch_id: this.state.branch_id
    }

    Http.post(`/api/v1/reports/specitemledger`, subs)
      .then((response) => {
        // const { data } = response.data.transaction.data;
        if (this._isMounted) {

          this.setState({
            data: response.data.ledger,

          });
        }
      })
    toast("Data fetched")
      .catch(() => {
        toast("Unable to fetch data")
      });


  }


  render() {
    const { data, item, branches } = this.state;
    var ledName, code;
    const branch = branches.map((brnch) => ({ key: brnch.id, value: brnch.id, text: brnch.name }));
    var itmcode = "";
    var itmname = "";
    item.map((itm) => {
      itmcode = itm.code
      itmname = itm.name
    })
    // console.log("ledger")
    // console.log(data)



    return (
      <div className="contentledgerSpec" >
        {/* className="contentTransact" */}
        <Link to="/itemLedger"><button type="button" class="btn btn-primary"  > Back </button></Link> &nbsp;&nbsp;&nbsp;&nbsp;
        {
          this.state.role == "Superadmin" ?
            <>
              <div class="inline_block" >
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

            </>
            : <></>
        }
        <div style={{ float: "right" }}>
          <Link to={{
            pathname: `/report/excel/preview/ledger`, state: {
              branches: this.state.branches,
              path: this.props.location.state.path,
              branch: this.state.branch_id,
              id: this.props.location.state.id,
              data: data, type: "Item", ledname: itmname, itcmcode: itmcode
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
        <br />
        <br />
        <div >
          <MinDate dates={this.getDates} />
        </div>




        {/* {this.props.location.state.id} */}
        {/* {item.map((itm) => (<><h1><small>{code = itm.code}</small><br />{ledName = itm.name}</h1></>))} */}
        <h1><small>{code = itmcode}</small><br />{ledName = itmname}</h1>
        {this.state.role == "Superadmin" ?
          <>

            { this.state.branch_id ? <></> :
              <small><i>*Select branch to display ledger</i></small>}
          </> : <></>
        }
        {this.itms(data)}
        {/* {this.state.upIdItem} */}


        <div style={{ display: "none" }}>
          <PrintReport
            // details={this.details(this.props.branchName, this.props.branches)}
            itms={this.itms(data, "print")}
            ledgerName={ledName}
            ledItmCode={code}
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

export default connect(mapStateToProps)(SpecItemLedger);
