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
import MinDate from './miniDateRange';
// import { Button } from 'bootstrap';
import { Button } from 'semantic-ui-react';
class SpecProjectLedger extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);

    // Initial state.
    this.state = {
      error: null,
      upIdItem: null,
      sdate: null,
      edate: null,
      data: [],
      tranItems: [],
      project: [],
    };
    // API endpoint.
    this.api = '/api/v1/reports/sales';
  }
  componentDidMount() {
    this._isMounted = true
    Http.post(`/api/v1/reports/specprojectledger`, { id: this.props.location.state.id })
      .then((response) => {
        // const { data } = response.data.transaction.data;
        if (this._isMounted) {

          this.setState({
            data: response.data.ledger,
            project: response.data.project,

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
    // const { project } = this.state;
    // var ledName;
    // project.map((itm) => { ledName = itm.name })
    return (
      <>

        <Link to={{
          pathname: '/uplog/sales', state: {
            id: this.props.location.state.id,
            code: row.code,
            itm: row.code,
            path: '/specProjectLedger',
            type: "Ledger",
            trans_type: row.transaction_type,
            linkpath: '/specProjectLedger',

          }
        }} ><i class="file alternate icon"></i></Link>

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
            <TableHeaderColumn isKey={true} dataField='code' >Code</TableHeaderColumn>
            <TableHeaderColumn width="150" dataField='date_transac' >Date</TableHeaderColumn>
            <TableHeaderColumn width="150" dataField='transaction_type' >Type</TableHeaderColumn>
            <TableHeaderColumn dataField='payable' >Amount Due</TableHeaderColumn>
            <TableHeaderColumn hidden={true} dataField='charge_status' >Status</TableHeaderColumn>
            <TableHeaderColumn hidden={true} dataField='date_paid' >Date Paid</TableHeaderColumn>
            <TableHeaderColumn dataField='prev_code' >Payment Code</TableHeaderColumn>
            <TableHeaderColumn hidden dataField='beg_charge_bal' >Beginning Balance</TableHeaderColumn>
            <TableHeaderColumn dataField='end_charge_bal' >Ending Balance</TableHeaderColumn>
            <TableHeaderColumn dataField='last_update' >Last update</TableHeaderColumn>
            <TableHeaderColumn width="50" hidden={print ? true : false} dataField='updated_at' dataFormat={this.uplogicon} ></TableHeaderColumn>
          </BootstrapTable>
        </div>
      </>
    );
  }

  getDates = (data) => {
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

    Http.post(`/api/v1/reports/specprojectledger`, subs)
      .then((response) => {
        // const { data } = response.data.transaction.data;
        if (this._isMounted) {

          this.setState({
            data: response.data.ledger,
            project: response.data.project,

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
    const { data, project } = this.state;
    var ledName

    project.map((itm) => { ledName = itm.name })
    return (
      <div className="contentledgerSpec" >
        {/* className="contentTransact" */}
        <Link to="/projectLedger"><Button  > Back </Button></Link>
        <div style={{ float: "right" }}>
          <Link to={{
            pathname: `/report/excel/preview/ledger`, state: {

              path: this.props.location.state.path,

              id: this.props.location.state.id,
              data: data,
              type: "Project",
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
        <Link to={{
          pathname: `/report/itemize/charge`, state: {
            type: "Project", ledname: ledName,
            sdate: this.state.sdate, edate: this.state.edate, path: this.props.location.state.path, id: this.props.location.state.id
          }
        }}> <Button style={{ float: "right" }} >Itemize Charges</Button></Link>

        <Link to={{
          pathname: `/report/itemize/payments`, state: {
            type: "Project", ledname: ledName, path: this.props.location.state.path
            , sdate: this.state.sdate, edate: this.state.edate, id: this.props.location.state.id
          }
        }}> <Button style={{ float: "right" }} >All Payments</Button></Link>


        {/* {this.props.location.state.id} */}
        {/* {project.map((itm) => (<h1>{ledName = itm.name}</h1>))} */}
        <h1>{ledName}</h1>
        <MinDate dates={this.getDates} />
        {this.itms(data)}
        <div style={{ display: "none" }}>
          <PrintReport
            // details={this.details(this.props.branchName, this.props.branches)}
            itms={this.itms(data, "print")}
            ledgerName={ledName}
            ref={el => (this.componentRef = el)}



          />
        </div>
        {/* {this.state.upIdItem} */}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: state.Auth.isAuthenticated,
  user: state.Auth.user,
});

export default connect(mapStateToProps)(SpecProjectLedger);
