import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../Http';
import classNames from 'classnames';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import { Link } from 'react-router-dom';
class ItemLedger extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);

    // Initial state.
    this.state = {
      error: null,
      upIdItem: null,
      data:  JSON.parse(localStorage.getItem("stockledger") || "[]"),
      tranItems: [],
    };
    // API endpoint.
    this.api = '/api/v1/reports/sales';
  }
  componentDidMount() {
    this._isMounted = true
    Http.get(`/api/v1/stocks`)
      .then((response) => {
        // const { data } = response.data.transaction.data;
        if (this._isMounted) {

          localStorage.setItem('stockledger', JSON.stringify(response.data.stocks))
          var localTerminal = JSON.parse(localStorage.getItem("stockledger") || "[]");

          this.setState({
            // data: response.data.stocks,
            data: localTerminal,
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
        <Link to={{ pathname: '/specItemLedger', state: { id: row.id, path: '/specItemLedger' } }}><button type="button" class="btn btn-primary"  > Ledger </button></Link>

      </div>
    )
  }
  render() {
    const { data } = this.state;
    var sorted = data.sort(function (a, b) {
      return a.name.localeCompare(b.name);
    });
    return (
      <div className="contentTransactN">
      

        <h1>Item Ledger</h1>
        <BootstrapTable
          ref='table'
          // data={data}
          data={sorted}
          pagination={true}
          search={true}
        // options={options} exportCSV
        >
          <TableHeaderColumn dataField='code'  width="150" >Code</TableHeaderColumn>
          <TableHeaderColumn dataField='item' >Item</TableHeaderColumn>
          <TableHeaderColumn dataField='brand'width="100" >Brand</TableHeaderColumn>
          <TableHeaderColumn dataField='size'  width="100">Measure</TableHeaderColumn>
          <TableHeaderColumn dataField='unit'width="100" >Unit</TableHeaderColumn>
          <TableHeaderColumn dataField='id' width="100" isKey={true} dataFormat={this.buttonFormatter} ></TableHeaderColumn>
          {/* <TableHeaderColumn dataField="id" dataFormat={this.buttonFormatter}>Buttons</TableHeaderColumn> */}
        </BootstrapTable>
        {/* {this.state.upIdItem} */}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: state.Auth.isAuthenticated,
  user: state.Auth.user,
});

export default connect(mapStateToProps)(ItemLedger);
