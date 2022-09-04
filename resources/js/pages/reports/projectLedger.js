import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../Http';
import classNames from 'classnames';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import { Link } from 'react-router-dom';
class ProjectLedger extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);

    // Initial state.
    this.state = {
      error: null,
      upIdItem: null,
      data: [],
      tranItems: [],
    };
    // API endpoint.
    this.api = '/api/v1/customer';
  }
  componentDidMount() {
    this._isMounted = true
    Http.get(`/api/v1/project`)
      .then((response) => {
        // const { data } = response.data.projects;
        if (this._isMounted) {

          this.setState({
            data: response.data.projects

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
        <center>
        <Link to={{ pathname: '/specProjectLedger', state: { id: row.id , path: '/specProjectLedger'} }}><button type="button" class="btn btn-primary"  > Ledger </button></Link>
      </center>
      </div>
    )
  }
  
  render() {
    
    const { data } = this.state;

  
    return (
      <div className="contentTransact">

        <h1>Project Ledger</h1>
        <BootstrapTable
          ref='table'
          data={data}
          pagination={true}
          search={true}
         
        // options={options} exportCSV
        >
          <TableHeaderColumn  dataField='name'>Name</TableHeaderColumn>
          <TableHeaderColumn dataField='location' >Location</TableHeaderColumn>
          <TableHeaderColumn dataField='balance' width="150">Balance</TableHeaderColumn>
          <TableHeaderColumn dataField='id' width="130" isKey={true} dataFormat={this.buttonFormatter} ></TableHeaderColumn>
          {/* <TableHeaderColumn dataField="id" dataFormat={this.buttonFormatter}>Buttons</TableHeaderColumn> */}
        </BootstrapTable>
        {this.state.upIdItem}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: state.Auth.isAuthenticated,
  user: state.Auth.user,
});

export default connect(mapStateToProps)(ProjectLedger);
