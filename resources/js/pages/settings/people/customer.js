import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../../Http';
import classNames from 'classnames';
import { Dropdown } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import CSVReader from 'react-csv-reader'
import update from 'immutability-helper';
class Customers extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);

    this.state = {
      upbeg: false,
      role: null,
      loading: false,
      first_name: null,
      last_name: null,
      middle_name: null,
      contact_no: null,
      address: null,
      balance: null,
      upId: null,
      error: false,
      data: [],
      imported: [],
    };


    // API endpoint.
    this.api = '/api/v1/customer';


  }




  componentDidMount() {
    this._isMounted = true
    Http.get(`${this.api}`)
      .then((response) => {
        // const { items,brands } = response.data;

        // const { data } = response.data.items;


        // if(this._isMounted){
        //       this.setState({
        //       data

        //       });
        // } 
        if (this._isMounted) {
          this.setState({
            data: response.data.customers,
            role: response.data.role,
            //   branch: response.data.branches.data,
            //   position: response.data.positions.data

          });
        }

      })


  }






  myChangeHandlerBranch = (e, { value }) => {
    if (this._isMounted) {
      this.setState({ branch_id: value })
    }
  };
  myChangeHandlerPosition = (e, { value }) => {
    if (this._isMounted) {
      this.setState({ position_id: value })
    }
  };

  // myChangeHandlerCategory = (e, { value }) => this.setState({category_id: value });
  // myChangeHandlerBrand = (e, { value }) => this.setState({brand_id: value });

  handleChange = (e) => {
    this._isMounted = true
    const { name, value } = e.target;
    if (this._isMounted) {
      this.setState({ [name]: value });
    }
  };

  handleSubmit = (e) => {
    this._isMounted = true
    e.preventDefault();
    const subs = {
      first_name: this.state.first_name,
      last_name: this.state.last_name,
      middle_name: this.state.middle_name,
      contact_no: this.state.contact_no,
      address: this.state.address,
    }
    if (this._isMounted) {
      this.setState({ loading: true });
    }
    this.addCust(subs);
  };
  //  first_name: data.brand[0].brand,
  addCust = (cust) => {
    this._isMounted = true
    Http.post(this.api, cust)
      .then(({ data }) => {
        const newCust = {
          id: data.id,
          balance: data.balance,
          first_name: cust.first_name,
          last_name: cust.last_name,
          middle_name: cust.middle_name,
          contact_no: cust.contact_no,
          address: cust.address,

        };
        const allCusts = [newCust, ...this.state.data];
        if (this._isMounted) {
          this.setState({ data: allCusts, first_name: null, last_name: null, middle_name: null, contact_no: null, address: null, balance: null });
        }
        this.customerForm.reset();
        if (this._isMounted) {
          this.setState({ loading: false });
        }
        toast("Customer added successfully!")
      })
      .catch(() => {
        if (this._isMounted) {
          this.setState({
            error: 'Sorry, there was an error saving customer.',
          });

          this.setState({ loading: false });
        }
      });
  };

  delete = (e) => {
    this._isMounted = true
    const { key } = e.target.dataset;
    const { data: cont } = this.state;
    if (confirm("Confirmation to delete.")) {
      if (this._isMounted) {
        this.setState({ loading: true });
      }
      Http.delete(`${this.api}/${key}`)
        .then((response) => {
          if (response.status === 204) {
            const index = cont.findIndex(
              (item) => parseInt(item.id, 10) === parseInt(key, 10),
            );
            const update = [...cont.slice(0, index), ...cont.slice(index + 1)];
            if (this._isMounted) {
              this.setState({ data: update });
              this.setState({ loading: false });
            }
            toast("Customer deleted successfully!")
          }
        })
        .catch((error) => {
          console.log(error);
          toast("Error deleting customer!")
          if (this._isMounted) {
            this.setState({ loading: false });
          }
        });
      if (this._isMounted) {
        this.setState({ loading: false });
      }

    }
  };

  setUpId = (e) => {
    this._isMounted = true
    const { key } = e.target.dataset;
    if (this._isMounted) {
      this.setState({ upId: key })
    }
  };

  handleSubmitUpdate = (e) => {
    this._isMounted = true
    e.preventDefault();
    const subs = {
      first_name: this.state.first_name,
      last_name: this.state.last_name,
      middle_name: this.state.middle_name,
      contact_no: this.state.contact_no,
      address: this.state.address,
    }
    if (this._isMounted) {
      this.setState({ loading: true });
    }
    this.updateCustomer(subs);
  };
  submitImport = (e) => {
    this._isMounted = true
    if (confirm(`Are you sure you want to insert data?`)) {
      Http.post(`/api/v1/customer/import`, { items: JSON.stringify(this.state.imported) })//last stop here no API YET
        .then(({ data }) => {

          if (this._isMounted) {
            this.setState({
              // data: data.updated,
              // error: false,
            });

          }
          toast("Customers imported successfully!")

        })
        .catch(() => {

          toast("Error importing items")
        });

    }
  }
  updateCustomer = (customer) => {
    Http.patch(`${this.api}/${this.state.upId}`, customer)//last stop here no API YET
      .then(({ data }) => {

        if (this._isMounted) {
          this.setState({
            data: data.updated,
            error: false,
          });
          this.setState({ loading: false });
        }
        toast("Customer Updated successfully!")
        this.customerupForm.reset();
      })
      .catch(() => {
        if (this._isMounted) {
          this.setState({
            loading: false
          });
        }
        toast("Error updating customer!")
      });
  };
  buttonFormatter = (cell, row) => {
    const { loading } = this.state;
    return (
      <div>
        <button type="button" data-key={row.id} onClick={this.setUpId}
          class=" btn btn-secondary" data-backdrop="static" data-keyboard="false" data-toggle="modal" data-target={`#cust${row.id}`}>
          <i data-key={row.id} onClick={this.setUpId} class='fas icons'>&#xf304;</i>
        </button>

    &nbsp;
        <button
          type="button"
          className="btn btn-secondary"
          onClick={this.delete}
          data-key={row.id}
        >
          <i class='fas icons' onClick={this.delete}
            data-key={row.id}>&#xf1f8;</i>
        </button>

        <div class="modal" id={`cust${row.id}`}
          ref={(el) => {
            this.projectModal = el;
          }} >
          <div class="modal-dialog">
            <div class="modal-content">


              <div class="modal-header">
                <h4 class="modal-title">Update Customer Info</h4>
                <button type="button" class="close" data-dismiss="modal" onClick={this.reset}>&times;</button>
              </div>


              <div class="modal-body">

                <form
                  method="post"
                  onSubmit={this.handleSubmitUpdate}
                  ref={(el) => {
                    this.customerupForm = el;
                  }}
                >
                  <table style={{ width: "100%" }} class="table-borderless">
                    <tr>
                      <td>
                        First Name<br />
                        <input type="text"
                          id="upProject"
                          name="first_name"
                          onChange={this.handleChange}
                          // style={up_input}
                          class="form-control mb-2 mr-sm-2" defaultValue={row.first_name} />
                      </td>
                    </tr>
                    <tr>
                      <td>
                        Middle Name<br />
                        <input type="text"
                          id="upProject"
                          name="middle_name"
                          onChange={this.handleChange}
                          // style={up_input}
                          class="form-control mb-2 mr-sm-2" defaultValue={row.middle_name} />
                      </td>
                    </tr>
                    <tr>
                      <td>
                        Last Name<br />
                        <input type="text"
                          id="upProject"
                          name="last_name"
                          onChange={this.handleChange}
                          // style={up_input}
                          class="form-control mb-2 mr-sm-2" defaultValue={row.last_name} />
                      </td>
                    </tr>
                    <tr>
                      <td>
                        Contact Number<br />
                        <input type="text"
                          id="upProject"
                          name="contact_no"
                          onChange={this.handleChange}
                          // style={up_input}
                          class="form-control mb-2 mr-sm-2" defaultValue={row.contact_no} />
                      </td>
                    </tr>
                    <tr>
                      <td>
                        Address<br />
                        <input type="text"
                          id="upProject"
                          name="address"
                          onChange={this.handleChange}
                          // style={up_input}
                          class="form-control mb-2 mr-sm-2" defaultValue={row.address} />
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <button type="submit"
                          className={classNames('btn btn-primary mb-2', {
                            'btn-loading': loading,
                          })}>Update</button>
                      </td>
                    </tr>
                  </table>
                </form>
              </div>


              <div class="modal-footer">
                <button type="button" class="btn btn-danger" data-dismiss="modal" onClick={this.reset}>Close</button>
              </div>

            </div>
          </div>
        </div>

      </div>
    )
  }
  nameformatter = (cell, row) => {

    return (
      <div>
        {row.first_name}&nbsp; {row.last_name}
      </div>
    )
  }
  reset = (e) => {
    this._isMounted = true
    if (this._isMounted) {
      this.setState({ first_name: null, last_name: null, middle_name: null, contact_no: null, address: null, balance: null });
    }

  };
  onBeforeSaveCell(row, cellName, cellValue) {
    // You can do any validation on here for editing value,
    // return false for reject the editing
    if (confirm(`Are you sure you want to update ${row.first_name}?`)) {
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

    toast("Customer successfully updated", {
      position: toast.POSITION.BOTTOM_RIGHT,
      className: 'foo-bar'
    });

    // alert('Thw whole row :\n' + rowStr);
  }
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

      toast("Customer deleted successfully!")
    }
  };
  updabegbal = (e) => {
    this._isMounted = true
    if (this._isMounted) {
      { this.state.upbeg === false ? this.setState({ upbeg: { validator: this.jobStatusValidator } }) : this.setState({ upbeg: false }) };
    }

  };
  jobStatusValidator = (value, row) => {
    this._isMounted = true
    const nan = isNaN(parseInt(value, 10));
    if (nan) {
      return 'Quantity must be a integer!';
    }

    if (confirm("Confirm balance update. This update will affect project's collectible but the transaction will be recorded.")) {
      const subs = {
        cust_id: row.id,
        newbal: value
      }
    console.log("subs")
    console.log(subs)
      Http.post('/api/v1/customer/upbal', subs)
        .then((response) => {
          if (this._isMounted) {

            if (response.data.stat !== 105) {
              const {data} =  this.state;
              var commentIndex = data.findIndex(function (c) {
                return c.id == row.id;
              });

              var updatedComment = update(data[commentIndex], { balance: { $set: value } });

              var newData = update(data, {
                $splice: [[commentIndex, 1, updatedComment]]
              });
              if (this._isMounted) {
                this.setState({ data: newData });
              }

            }

            
            toast(response.data.message)

          }
        })
        .catch(() => {
          toast("Error updating project balance")
         
        });
    }

    

    return response;
  }
  render() {

    // const product = products;
    const { data, error, loading, imported } = this.state;
    const pill_form = {
      // textAlign: "center",
      // paddingLeft: "30%",
      width: "25%"
    };
    const inpt_style = {
      width: "100%",
    };
    const table_style = {
      width: "90%",
    };
    const form_style = {
      //  textAlign: "center",
      // paddingLeft: "38%",
      // width: "40%"
    };
    const label_style = {
      float: "left",
    };
    const submit_style = {
      float: "right",
    };
    const mid_form = {
      margin: "80px",
    };
    const up_form = {
      paddingLeft: "28%",
      width: "100%",
    };
    const up_input = {
      width: "100%",
    };
    const cellEditProp = {
      mode: 'dbclick',
      blurToSave: true,
      beforeSaveCell: this.onBeforeSaveCell, // a hook for before saving cell
      afterSaveCell: this.onAfterSaveCell  // a hook for after saving cell
    };

    const cellEditPropList = {
      mode: 'click',
      blurToSave: true
    };

    return (

      <div class="utilityContainer" >
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb-item active" aria-current="page">Customers</li>
          </ol>
        </nav>

        <br />
        <ToastContainer />
        {error && (
          <div className="alert alert-warning" role="alert">
            {error}
          </div>
        )}
        <center>
          <div style={pill_form}>
            <div class="inline_block">  <button type="button" class="btn btn-primary" data-toggle="collapse" data-target="#sysu"   >Add Customer</button></div>

            <div class="inline_block"> &nbsp;&nbsp;&nbsp; <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#imp">Import </button></div>
            <div id="sysu" class="collapse" style={form_style}>
              <br />
              <form class="form-inline"
                method="post"
                onSubmit={this.handleSubmit}
                ref={(el) => {
                  this.customerForm = el;
                }}
              >
                <table style={table_style}>
                  <tr>
                    <td>
                      <tr>
                        <td>
                          <label style={label_style}>First Name</label>
                          <input type="text"
                            id="addcust"
                            name="first_name"
                            onChange={this.handleChange}
                            style={inpt_style}
                            required
                            class="form-control mb-2 mr-sm-2" placeholder="Enter First Name" />
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <label style={label_style}>Middle Name</label>
                          <input type="text"
                            id="addcust"
                            name="middle_name"
                            onChange={this.handleChange}
                            style={inpt_style}
                            required
                            class="form-control mb-2 mr-sm-2" placeholder="Enter Middle Name" />
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <label style={label_style}>Last Name</label>
                          <input type="text"
                            id="addcust"
                            name="last_name"
                            onChange={this.handleChange}
                            style={inpt_style}
                            required
                            class="form-control mb-2 mr-sm-2" placeholder="Enter Last Name" />
                        </td>
                      </tr>

                      <tr>
                        <td>
                          <label style={label_style}>Contact Number</label>
                          <input type="text"
                            id="addcust"
                            name="contact_no"
                            onChange={this.handleChange}
                            required
                            style={inpt_style}
                            class="form-control mb-2 mr-sm-2" placeholder="Enter Contact Number" />
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <label style={label_style}>Address</label>
                          <input type="text"
                            id="addcust"
                            name="address"
                            onChange={this.handleChange}
                            required
                            style={inpt_style}
                            class="form-control mb-2 mr-sm-2" placeholder="Enter Address" />
                        </td>
                      </tr>



                      <tr>
                        <td>
                          <br />
                          <button style={submit_style} type="submit" className={classNames('btn btn-primary mb-2', {
                            'btn-loading': loading,
                          })} >Add</button>
                        </td>
                      </tr>
                    </td>
                    {/* <td style={mid_form}></td>
                            <td>
                             

                            </td> */}

                  </tr>

                </table>


              </form>
            </div>

            <br />
            <div class="modal fade" id="imp">
              <div class="modal-dialog modal-xl">
                <div class="modal-content">


                  <div class="modal-header">
                    <h4 class="modal-title">Import Items</h4>
                    <br />

                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                  </div>


                  <div class="modal-body">
                    <i style={{ color: "red" }}>Important Reminders</i><br />
                    <i>*import customer are for those customers that do not exist yet in the system. If you want to update a customer please use the update
              " <i class='fas icons'>&#xf304;</i>" icon of an item inside utilities/customer
                </i>
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
                            // console.dir(JSON.stringify(dataf))
                            console.dir(dataf)
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
                      <TableHeaderColumn dataField='id' width="100" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }
                      } isKey={true}>id</TableHeaderColumn>
                      <TableHeaderColumn dataField='first_name' tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >First Name</TableHeaderColumn>
                      <TableHeaderColumn dataField='middle_name' tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Middle Name</TableHeaderColumn>
                      <TableHeaderColumn dataField='last_name' tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Last Name</TableHeaderColumn>
                      <TableHeaderColumn dataField='contact_no' tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }}  >Address</TableHeaderColumn>
                      <TableHeaderColumn dataField='address' tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }}  >Address</TableHeaderColumn>
                      <TableHeaderColumn dataField='balance' tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Balance</TableHeaderColumn>



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

          </div>
        </center>
        <div>
          <br />
          <div className="todos">
            {
              this.state.role === "Cashier" ? <></> :
                <>
                  {
                    this.state.role === "Superadmin" ?
                      <>
                        <div style={{ width: "100%" }}>


                          <div style={{ float: "right" }} class="inline_block">
                            <button class="ui button" tabindex="0" data-name="defs" onClick={this.updabegbal}>
                              {this.state.upbeg === false ? "Update Beg. Balances" : "Exit Update"}
                            </button>

                          </div>
                        </div>
                        <br />
                        <div>
                          <p > <i style={{ right: "0" }}><i style={{ color: "red" }} >*</i>Note: You can only update beginning balances for those<br /> items that does not have any transaction yet. Click the<br /> balance to update.</i></p>
                        </div>
                      </>
                      : <></>
                  }
                </>
            }
            <BootstrapTable
              ref='table'
              data={data}
              pagination={true}
              search={true}
              cellEdit={cellEditPropList}
            // style={itemTabs}

            // options={options} exportCSV
            >
              <TableHeaderColumn dataField='id' tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} isKey={true} hidden={true}>id</TableHeaderColumn>
              <TableHeaderColumn dataField='id' dataFormat={this.nameformatter} tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }}  >Name</TableHeaderColumn>
              <TableHeaderColumn dataField="balance" editable={this.state.upbeg} width="200" >Balance</TableHeaderColumn>
              <TableHeaderColumn dataField="first_name" width="200" hidden={true} >Balance</TableHeaderColumn>
              <TableHeaderColumn dataField="last_name" width="200" hidden={true} >Balance</TableHeaderColumn>
              <TableHeaderColumn dataField="id" width="200" dataFormat={this.buttonFormatter}>Action</TableHeaderColumn>

            </BootstrapTable>



          </div>
        </div>

      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: state.Auth.isAuthenticated,
  user: state.Auth.user,
});

export default connect(mapStateToProps)(Customers);
