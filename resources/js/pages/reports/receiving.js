import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../Http';
import classNames from 'classnames';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import { Dropdown } from 'semantic-ui-react';//filt_branch
import 'semantic-ui-css/semantic.min.css';//filt_branch
import CSVReader from 'react-csv-reader'

class ReceivingReports extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);

    // Initial state.
    this.state = {
      error: null,
      upIdItem: null,
      data: [],
      tranItems: [],
      imported: [],
      branches: [],//filt_branch
      dataAll: [],//filt_branch
      dataTemp: [],//filt_branch
      hidbranch: false,//filt_branch
      role: false,//filt_branch
    };
    // API endpoint.
    this.api = '/api/v1/reports/received';
  }
  componentDidMount() {
    this._isMounted = true
    Http.post(`${this.api}`)
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

    Http.post(`/api/v1/reports/receiveditems`, { id: key })
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
    const columnHover = (cell, row, enumObject, rowIndex) => {
      return cell
    }
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
                  <TableHeaderColumn columnTitle={columnHover} tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} dataField='item_name' isKey={true}>Item Name</TableHeaderColumn>
                  <TableHeaderColumn columnTitle={columnHover} dataField='quantity'>Quantity</TableHeaderColumn>
                  <TableHeaderColumn columnTitle={columnHover} dataField='beg_balance'>Beg. Balance</TableHeaderColumn>
                  <TableHeaderColumn columnTitle={columnHover} dataField='end_bal'>End. Balance</TableHeaderColumn>
                  <TableHeaderColumn columnTitle={columnHover} dataField='original_price'>Price</TableHeaderColumn>
                  <TableHeaderColumn columnTitle={columnHover} hidden={true} dataField='charge_status'>Status</TableHeaderColumn>
                  <TableHeaderColumn columnTitle={columnHover} tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} dataField='sup_name'>Supplier</TableHeaderColumn>
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
      this.setState({ branch_id: value,   hidbranch: true });
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


      Http.post(this.api, { branch_id: value })
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
  buttonFormatterDel = (cell, row) => {

    return (<i class="trash icon" onClick={this.impdel} data-key={row.id}></i>)
  }
  impdel = (e) => {
    this._isMounted = true
    const { key } = e.target.dataset;
    const { imported: pos } = this.state;


    if (confirm(`Are you sure you want to delete ${key}?`)) {
      const index = pos.findIndex(
        (item) => parseInt(item.id, 10) === parseInt(key, 10),
      );
      const update = [...pos.slice(0, index), ...pos.slice(index + 1)];
      if (this._isMounted) {
        this.setState({ imported: update });

      }

      toast("Transaction deleted successfully!")
    }
  };
  onBeforeSaveCell(row, cellName, cellValue) {
    // You can do any validation on here for editing value,
    // return false for reject the editing
    if (confirm(`Are you sure you want to update ${row.name}?`)) {
      if (cellName == "balance") {
        if (Number(cellValue)) {
          return true;
        } else {
          toast("Invalid amount!")
          return false;
        }
      } else {
        return true;
      }

    } else {
      return false;
    }
  }
  onAfterSaveCell = (row, cellName, cellValue) => {
    // alert(`Save cell ${cellName} with value ${cellValue} ${row.id} `);
    const { imported } = this.state;
    // let rowStr = '';
    // for (const prop in row) {
    //   rowStr += prop + ': ' + row[prop] + '\n';
    // }

    var commentIndex = imported.findIndex(function (c) {
      return c.id == row.id;
    });
    var updatedComment = update(imported[commentIndex], { [cellName]: { $set: cellValue } });
    var newData = update(imported, {
      $splice: [[commentIndex, 1, updatedComment]]
    });
    if (this._isMounted) {
      this.setState({ imported: newData });
    }

    toast("Transaction successfully updated", {
      position: toast.POSITION.BOTTOM_RIGHT,
      className: 'foo-bar'
    });

    // alert('Thw whole row :\n' + rowStr);
  }
  submitImport = (e) => {
    this._isMounted = true
    if (confirm(`Are you sure you want to insert data?`)) {
      Http.post(`/api/v1/transaction/receiving/import`, { items: JSON.stringify(this.state.imported) })//last stop here no API YET
        .then(({ data }) => {

          if (this._isMounted) {
            this.setState({
              imported: [],
              // data: data.updated,
              // error: false,
            });

          }
          toast("Items imported successfully!")

        })
        .catch(() => {

          toast("Error importing items")
        });

    }
  }

  render() {
    const { data, imported,
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

    var hidFilt = {display: "none"}
    if(this.state.role == "Superadmin"){
      hidFilt = {display: "block"}
    }
    //filt_branch
    const cellEditProp = {
      mode: 'dbclick',
      blurToSave: true,
      beforeSaveCell: this.onBeforeSaveCell, // a hook for before saving cell
      afterSaveCell: this.onAfterSaveCell  // a hook for after saving cell
    };
    return (
      <div className="contentTransact">
        <div class="inline_block">
        <h1>Received Items</h1>
        </div>
        <ToastContainer />
        <div class="inline_block" style={{right: "0", position: "absolute"}}>
            <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#imp">
              Import Purchases
          </button>
        </div>
          <div class="modal fade" id="imp">
          <div class="modal-dialog modal-xxl">
            <div class="modal-content">


              <div class="modal-header">
                <h4 class="modal-title">Import historical purchases</h4>
                {/* <br /> */}

                <button type="button" class="close" data-dismiss="modal">&times;</button>
              </div>


              <div class="modal-body">
                {/* <i style={{ color: "red" }}>Important Reminders</i><br />
                <i>*import supplier are for those suppliers that do not exist yet in the system. If you want to update a supplier please use the update
              " <i class='fas icons'>&#xf304;</i>" icon of an item inside utilities/supplier
                </i> */}
                <br />
                <hr />
                <form>
                  <div class="custom-file">
                    <CSVReader
                      parserOptions={{ header: true }}
                      onFileLoaded={(dataf, fileInfof) => {
                        this._isMounted = true
                        if (this._isMounted) {
                          this.setState({
                            imported: dataf
                          });
                        }
                        console.dir(JSON.stringify(dataf))
                        // console.dir(dataf)
                      }


                      }
                      cssClass="custom-file-input"
                    />
                    <label class="custom-file-label" for="customFile">Choose file</label>
                  </div>
                </form>

                <br />
                <BootstrapTable
                  ref='table'
                  data={imported}
                  pagination={true}
                  search={true}
                  cellEdit={cellEditProp}
                // deleteRow={true} selectRow={selectRowProp} options={options}
                >
                  <TableHeaderColumn dataField='id' width="30" dataFormat={this.buttonFormatterDel}  ></TableHeaderColumn>
                  <TableHeaderColumn dataField='id' hidden={true} width="30" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} isKey={true}>id</TableHeaderColumn>
                  <TableHeaderColumn dataField='date_received' width="100" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Date</TableHeaderColumn>
                  <TableHeaderColumn dataField='for_payment'  width="80" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >For payment</TableHeaderColumn>
                  <TableHeaderColumn dataField='item_code'  width="150" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Item Code</TableHeaderColumn>
                  <TableHeaderColumn dataField='item_name' tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Item Name</TableHeaderColumn>
                  <TableHeaderColumn dataField='brand'width="90" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }}  >Brand</TableHeaderColumn>
                  <TableHeaderColumn dataField='size'width="90" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }}  >Size</TableHeaderColumn>
                  <TableHeaderColumn dataField='unit'width="80" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Unit</TableHeaderColumn>
                  <TableHeaderColumn dataField='original_price'width="80" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Org Price</TableHeaderColumn>
                  <TableHeaderColumn dataField='quantity' width="80"tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Quantity</TableHeaderColumn>
                  <TableHeaderColumn dataField='supplier'width="120" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Supplier</TableHeaderColumn>



                </BootstrapTable>
                <br />
                <button type="button" class="btn btn-primary" onClick={this.submitImport}>Import</button>
              </div>


              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
              </div>

            </div>
          </div>
        </div>

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
        <br/>
          <br/>
        <BootstrapTable
          ref='table'
          data={data}
          pagination={true}
          search={true}
          options={options} exportCSV
        >
          <TableHeaderColumn dataField='branch' hidden={_hidbranch} >Branch</TableHeaderColumn>
          <TableHeaderColumn dataField='code' isKey={true}>Code</TableHeaderColumn>
          <TableHeaderColumn dataField='receiving_type' >Type</TableHeaderColumn>
          <TableHeaderColumn dataField='date'>Date</TableHeaderColumn>
          <TableHeaderColumn dataField='total_items'>Total Items</TableHeaderColumn>
          <TableHeaderColumn dataField='t_id' dataFormat={this.buttonFormatter}>Items</TableHeaderColumn>
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

export default connect(mapStateToProps)(ReceivingReports);
