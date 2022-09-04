import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../Http';
import 'react-toastify/dist/ReactToastify.css';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import TemplateReport from './templateReport';
import { Dropdown } from 'semantic-ui-react';//filt_branch
import 'semantic-ui-css/semantic.min.css';//filt_branch

class SalesReports extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);

    // Initial state.
    this.state = {
      error: null,
      upIdItem: null,
      branch_id: null,
      data: [],
      tranItems: [],
      branches: [],//filt_branch
      dataAll: [],//filt_branch
      dataTemp: [],//filt_branch
      hidbranch: false,//filt_branch
      role: false,//filt_branch
    };
    // API endpoint.
    this.api = '/api/v1/reports/sales';
  }
  componentDidMount() {
    this._isMounted = true
    // Http.get(`${this.api}`)
    Http.post(`/api/v1/reports/transacs`, { type: "Sale" })
      .then((response) => {
        // const { data } = response.data.transaction.data;
        if (this._isMounted) {

          this.setState({
            data: response.data.transaction,
            branches: response.data.branches,//filt_branch
            dataAll: response.data.transaction,//filt_branch
            dataTemp: response.data.transaction,//filt_branch
            role: response.data.role,//filt_branch

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
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#exampleModal" data-key={row.t_id} onClick={this.setUpId}>
          Items
    </button>
        <div class="modal fade " id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">

              <div class="modal-body">
                <BootstrapTable
                  ref='table'
                  data={tranItems}
                  pagination={true}
                  search={true}
                // options={options} exportCSV
                >
                  <TableHeaderColumn tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} dataField='item_name' isKey={true}>Item Name</TableHeaderColumn>
                  <TableHeaderColumn dataField='quantity'>Quantity</TableHeaderColumn>
                  <TableHeaderColumn dataField='beg_balance'>Beginning Balance</TableHeaderColumn>
                  <TableHeaderColumn dataField='end_bal'>Ending Balance</TableHeaderColumn>
                  <TableHeaderColumn dataField='unit_price'>Price</TableHeaderColumn>
                </BootstrapTable>

              </div>

            </div>
          </div>
        </div>
      </div>
    )
  }
  handleExportCSVButtonClick = (onClick) => {
    onClick();
  }
  createCustomExportCSVButton = (onClick) => {
    return (
      <ExportCSVButton
        btnText='Down CSV'
        onClick={() => this.handleExportCSVButtonClick(onClick)} />
    );
  }
  // filt_branch
  resetFilter = (e) => {
    const { dataAll } = this.state;

    if (this._isMounted) {
      this.setState({ data: dataAll, hidbranch: false })
    }

  };
  myChangeHandlerbranch = (e, { value }) => {
    if (this._isMounted) {
      this.setState({ branch_id: value, hidbranch: true });
    }

    if (value == "all") {
      if (this._isMounted) {
        this.setState({
          data: this.state.dataAll,
          dataTemp: this.state.dataAll,
          hidbranch: false
        });
      }
    } else {


      Http.post(`/api/v1/reports/transacs`, { branch_id: value, type: "Sale" })
        .then((response) => {
          // const { data } = response.data.header;
          if (this._isMounted) {
            this.setState({
              data: response.data.transaction,
              dataTemp: response.data.transaction,

            });
          }
        })
        .catch(() => {
          this.setState({
            error: 'Unable to fetch data.',
          });
        });
    }

  }; // filt_branch
  render() {
    const { data,
      branches, //filt_branch
    } = this.state;
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

    var hidFilt = { display: "none" }
    if (this.state.role == "Superadmin") {
      hidFilt = { display: "block" }
    }
    //filt_branch

    return (

      <div >
        {this.state.branch_id}
        <div style={{paddingTop: ".5%",paddingLeft: "4%"}}>
          <div class="branch_drop" style={hidFilt}>{/* filt_branch */}
            <div class="inline_block">
              <i class="undo icon" onClick={this.resetFilter}></i>
            </div>
            <div class="inline_block">
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
            <br />
            <br />
          </div>{/* filt_branch */}
        </div>
jkuyjyht
        <TemplateReport
          title="Sales"
          branch={this.state.branch_id}
          data={data}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: state.Auth.isAuthenticated,
  user: state.Auth.user,
});

export default connect(mapStateToProps)(SalesReports);
