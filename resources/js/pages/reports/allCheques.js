import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../Http';
import classNames from 'classnames';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import { Link } from 'react-router-dom';

class AllCheques extends Component {
  _isMounted = false;
 
  constructor(props) {
    super(props);

    // Initial state.
    this.state = {
      error: null,
      upIdItem: null,
      data: [],
      tranItems: [],
      allChq: props.data,

      
    };
    // API endpoint.
    this.api = '/api/v1/reports/sales';
  }
  componentDidMount() {
    this._isMounted = true
    const chqs = this.props.data;
    if (this._isMounted) {
      this.setState({
        allChq :chqs

    });
    console.log(chqs)
    }

  }



  handleExportCSVButtonClick = (onClick) => {
    onClick();
  }
  createCustomExportCSVButton = (onClick) => {
    return (
      <div>
        <ExportCSVButton
          btnText=' '
          onClick={() => this.handleExportCSVButtonClick(onClick)} />
          &nbsp; &nbsp; &nbsp; &nbsp;
        <button class="ui button" tabindex="0" data-toggle="modal" data-target="#myModal">
          Add New PDC
          </button>


      </div>
    );
  }
  createPDC = (onClick) => {
    return (
      <button class="ui primary button">
        Save
      </button>
    );
  }

  deleteChq = (e) => {
    this._isMounted = true
    const { key } = e.target.dataset;
    const { allChq: brnc } = this.state;
  //  const brnc = this.props.data;

    if (confirm("Confirm delete")) {
     
   
    Http.delete(`/api/v1/transaction/pay/supplier/${key}`,)
      .then((response) => {
        if (response.status === 204) {
          const index = brnc.findIndex(
            (branch) => parseInt(branch.id, 10) === parseInt(key, 10),
          );
          const update = [...brnc.slice(0, index), ...brnc.slice(index + 1)];
          if (this._isMounted) {
            this.setState({ allChq: update });
          }
        }
        toast("Cheque deleted successfully!")
      })
      .catch((error) => {
        console.log(error);
        toast("Error deleting Cheque")
      });

    } 

  };
  btnFormatterEdit = (cell, row) => {
   
    const idh = "#id" + row.id;
    const id = "id" + row.id;
    return (
      <div>
        {/* onClick={this.displayQty} */}
        {/* onClick={this.deleteReq} */}
        <i data-key={row.id} class="pencil alternate icon" data-toggle="modal" data-target={idh} data-backdrop="static" data-keyboard="false"></i>
        <i class="trash alternate icon" data-key={row.id} onClick={this.deleteChq} ></i>
      </div>
    );
  }

  btnFormatterConfirm = (cell, row) => {
    return (
      <div>
        <button class="ui button">
          Confirm Payment
        </button>
      </div>
    );
  }
 
  render() {
    const { allChq } = this.state;
    const options = {
      exportCSVBtn: this.createCustomExportCSVButton,
      addCheque: this.createPDC
    };
    // const allChq = this.props.data;
    return (

      //   <div className="contentledgerSpec">
      <div >
        {/* <h1>{this.props.title}</h1> */}
        <BootstrapTable
          ref='table'
          data={allChq}
          pagination={true}
          search={true}
          options={options} exportCSV
        >
          <TableHeaderColumn dataField='id' isKey={true} hidden={true}></TableHeaderColumn>
          <TableHeaderColumn dataField='code'>Code</TableHeaderColumn>
          <TableHeaderColumn dataField='supplier' >Supplier</TableHeaderColumn>
          <TableHeaderColumn dataField='payee' >Account Name</TableHeaderColumn>
          <TableHeaderColumn dataField='date' >Cheque Date</TableHeaderColumn>
          <TableHeaderColumn dataField='amount'>Amount</TableHeaderColumn>
          <TableHeaderColumn dataField='bank'>Bank</TableHeaderColumn>
          <TableHeaderColumn dataField='status'>Status</TableHeaderColumn>
          <TableHeaderColumn dataField='id' width="60" dataFormat={this.btnFormatterEdit}></TableHeaderColumn>
          <TableHeaderColumn dataField='id' dataFormat={this.btnFormatterConfirm}></TableHeaderColumn>
        </BootstrapTable>

      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: state.Auth.isAuthenticated,
  user: state.Auth.user,
});

export default connect(mapStateToProps)(AllCheques);
