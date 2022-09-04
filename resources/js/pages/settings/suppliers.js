import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../Http';
import classNames from 'classnames';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import CSVReader from 'react-csv-reader'
import {Icon } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import update from 'immutability-helper';
class Suppliers extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);

    // Initial state.
    this.state = {
      upbeg: false,
      role: null,
      loading: false,
      name: null,
      location: null,
      address: null,
      error: false,
      upId: null,
      reason: null,
      sysmode: "normal",
      data: [],
      imported: [],
    };

    // API endpoint.
    this.api = '/api/v1/supplier';
  }
  componentDidMount() {
    this._isMounted = true
    Http.get(`${this.api}`)
      .then((response) => {
        // const { data } = response.data;
        if (this._isMounted) {
          this.setState({
            data: response.data.suppliers,
            role: response.data.role,
            error: false,
          });
        }
      })
      .catch(() => {
        this.setState({
          error: 'Unable to fetch data.',
        });
      });


      this.getSystemMode()
  }

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
      name: this.state.name,
      address: this.state.address
    }
    if (this._isMounted) {
      this.setState({ loading: true });
    }
    this.addSupplier(subs);
  };

  addSupplier = (supplier) => {
    this._isMounted = true
    Http.post(this.api, supplier)
      .then(({ data }) => {
        const newItem = {
          id: data.id,
          name: supplier.name,
          address: supplier.address,
          balance: 0,
        };
        const allSuppliers = [newItem, ...this.state.data];
        if (this._isMounted) {
          this.setState({ data: allSuppliers, name: null, address: null });
        }
        this.supplierForm.reset();
        if (this._isMounted) {
          this.setState({ loading: false });
        }
        toast("Supplier Added successfully!")
      })
      .catch(() => {
        if (this._isMounted) {
          this.setState({
            // error: 'Sorry, there was an error saving your to do.',
            loading: false
          });
          toast("Error adding supplier!")
        }
      });
  };

  getSystemMode() {
    Http.post(`/api/v1/sysmode`)
        .then(({ data }) => {
            console.log("data.spec")
            console.log(data.spec)
            if (this._isMounted) { this.setState({ sysmode: data.spec }); };
        })
        .catch(() => {
            this.setState({
                error: 'Unable to fetch data.',
                load: false,
            });
        });
}



  deleteSupplier = (e) => {
    this._isMounted = true
    const { key } = e.target.dataset;
    const { data: sup } = this.state;

    if (confirm("Confirmation to delete.")) {
      if (this._isMounted) {
        this.setState({ loading: true });
      }
      Http.delete(`${this.api}/${key}`)
        .then((response) => {
          if (response.status === 204) {
            const index = sup.findIndex(
              (supplier) => parseInt(supplier.id, 10) === parseInt(key, 10),
            );
            const update = [...sup.slice(0, index), ...sup.slice(index + 1)];
            if (this._isMounted) {
              this.setState({ data: update });
              this.setState({ loading: false });
            }
          }
          toast("Supplier deleted successfully!")
        })
        .catch((error) => {
          console.log(error);
          toast("Error deleting Supplier!")
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
      name: this.state.name,
      address: this.state.address
    }
    if (this._isMounted) {
      this.setState({ loading: true });
    }
    this.updateProperty(subs);
  };

  updateProperty = (property) => {
    Http.patch(`${this.api}/${this.state.upId}`, property)//last stop here no API YET
      .then((response) => {

        if (this._isMounted) {
          this.setState({
            data: response.data.updated,
            error: false,
          });
          this.setState({ loading: false });
        }
        toast("Supplier Updated successfully!")
        this.updateForm.reset();
      })
      .catch(() => {
        if (this._isMounted) {
          this.setState({
            loading: false
          });
        }
        toast("Error updating Supplier!")
      });
  };

  reset = (e) => {
    this._isMounted = true
    if (this._isMounted) {
      this.setState({ name: null, address: null });
    }

  };

  buttonFormatter = (cell, row) => {
    const { loading } = this.state;
    return (
      <div>
        <center>
          <button type="button" data-key={row.id} onClick={this.setUpId}
            class=" btn btn-secondary" data-backdrop="static" data-keyboard="false" data-toggle="modal" data-target={`#sup${row.id}`}>
            {/* <i data-key={row.id} onClick={this.setUpId} class='fas icons'>&#xf304;</i> */}
            <i data-key={row.id} onClick={this.setUpId} class='fas icons'><Icon  data-key={row.id} onClick={this.setUpId} size='small' name='pencil' /></i>
          </button>

    &nbsp;
        <button
            type="button"
            className="btn btn-secondary"
            onClick={this.deleteSupplier}
            data-key={row.id}
          >
            {/* <i class='fas icons' onClick={this.deleteSupplier}
              data-key={row.id}>&#xf1f8;</i>  */}
            <i class='fas icons' onClick={this.deleteSupplier}
              data-key={row.id}><Icon size='small' name='trash' onClick={this.deleteSupplier}
              data-key={row.id} /></i>
          </button>

        </center>
        <div class="modal" id={`sup${row.id}`}    >
          <div class="modal-dialog">
            <div class="modal-content">


              <div class="modal-header">
                <h4 class="modal-title">Update Supplier</h4>
                <button type="button" class="close" data-dismiss="modal" onClick={this.reset}>&times;</button>
              </div>


              <div class="modal-body">

                <form
                  method="post"
                  onSubmit={this.handleSubmitUpdate}
                  ref={(el) => {
                    this.updateForm = el;
                  }}
                >
                  <table
                    // style={up_form}
                    style={{ width: "100%" }}
                    class="table-borderless">
                    <tr>
                      <td>
                        Name<br />
                        <input type="text"
                          id="upSupplier"
                          name="name"
                          onChange={this.handleChange}
                          // style={up_input}
                          class="form-control mb-2 mr-sm-2" defaultValue={row.name} />
                      </td>
                    </tr>
                    <tr>
                      <td>
                        Address<br />
                        <input type="text"
                          id="upSupplier"
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

      toast("Supplier deleted successfully!")
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

    toast("Supplier successfully updated", {
      position: toast.POSITION.BOTTOM_RIGHT,
      className: 'foo-bar'
    });

    // alert('Thw whole row :\n' + rowStr);
  }
  submitImport = (e) => {
    this._isMounted = true
    if (confirm(`Are you sure you want to insert data?`)) {
      Http.post(`/api/v1/supplier/import`, { items: JSON.stringify(this.state.imported) })//last stop here no API YET
        .then(({ data }) => {

          if (this._isMounted) {
            this.setState({
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
if(this.state.reason){
  if (confirm("Confirm balance update. This update will affect office's collectible but the transaction will be recorded.")) {
    
    const subs = {
      sup_id: row.id,
      newbal: value,
      reason: this.state.reason
    }
    Http.post('/api/v1/supplier/upbal', subs)
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
}else{
  toast('Please state your reason for changing');
}
    

    

    return response;
  }

  render() {
    const { data, error, loading, imported, role } = this.state;
    const pill_form = {
      textAlign: "center",
      // paddingLeft: "3%",
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
            <li class="breadcrumb-item active" aria-current="page">Suppliers</li>
          </ol>
        </nav>

        <ToastContainer limit="3" />
        <br />
        <div style={pill_form}>
          <div class="inline_block">
            <form class="form-inline"
              method="post"
              onSubmit={this.handleSubmit}
              ref={(el) => {
                this.supplierForm = el;
              }}
            >
              <input type="text"
                id="addSupplier"
                name="name"
                onChange={this.handleChange}

                class="form-control mb-2 mr-sm-2" placeholder="Enter supplier name" />
              <input type="text"
                id="addSupplier"
                name="address"
                onChange={this.handleChange}

                class="form-control mb-2 mr-sm-2" placeholder="Enter supplier address" />
              <button type="submit"
                className={classNames('btn btn-primary mb-2', {
                  'btn-loading': loading,
                })}>Add</button>

            </form>
          </div>
{/* 
        {  
        this.state.sysmode != "pos" ?
        <>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <div class="inline_block">
            <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#imp">
              Import
          </button>
          </div>
          </>
          : <></>
          } */}

          <br />
        </div>

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
                <i>*import supplier are for those suppliers that do not exist yet in the system. If you want to update a supplier please use the update
              " <i class='fas icons'>&#xf304;</i>" icon of an item inside utilities/supplier
                </i>
                <br />
                <br />
                <div class="inline_block" style={{ float: "right" }}>
                  <a href='/templates/supplier_template.csv' download>Download template here</a><br />
                  <small>*Don't change the headings of the template</small>
                </div>
                <br />
                <br />
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
                  <TableHeaderColumn dataField='id' width="100" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} isKey={true}>id</TableHeaderColumn>
                  <TableHeaderColumn dataField='name' tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Name</TableHeaderColumn>
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



        <div>
          {error && (
            <div className="alert alert-warning" role="alert">
              {error}
            </div>
          )}
          <br />
          {
            this.state.role === "Cashier" ? <></> :
              <>
                {
                  this.state.role === "Superadmin" ?
                    <>
                      <div style={{ width: "100%" }}>

                  {   this.state.sysmode == "normal" ?
                        <>
                        <div style={{ float: "right" }} class="inline_block">
                          <button class="ui button" tabindex="0" data-name="defs" onClick={this.updabegbal}>
                            {this.state.upbeg === false ? "Update Beg. Balances" : "Exit Update"}
                          </button>

                        </div>
                    </> : <></> }

                        <div class="inline_block">
                        {this.state.upbeg === false ?  <></>
                     :<textarea style={{width: "200px"}}  required class="form-control mb-5 mr-sm-5  " placeholder="Reason for changing" name="reason" onChange={this.handleChange} > </textarea>
                    }
                        </div>
                      </div>
                       {/* <div>
                          <p > <i style={{ right: "0" }}><i style={{ color: "red" }} >*</i>Note: You can only update beginning balances for those<br /> items that does not have any transaction yet. Click the<br /> balance to update.</i></p>
                        </div> */}
                    </>
                    : <></>
                }
              </>
          }

          <div className="todos">
            <br/>
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
              <TableHeaderColumn dataField='name' tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }}  >Name</TableHeaderColumn>
              <TableHeaderColumn dataField="address" width="200">Address</TableHeaderColumn>
             <TableHeaderColumn editable={this.state.upbeg} hidden={this.state.sysmode == "normal" ? (role == "Cashier" ? true : false) : true} dataField="balance" width="200" >Balance</TableHeaderColumn>
             {/* <TableHeaderColumn editable={this.state.upbeg} hidden={role == "Cashier" ? true : false} dataField="balance" width="200" >Balance</TableHeaderColumn> */}
              <TableHeaderColumn dataField="id" width="130" dataFormat={this.buttonFormatter}>Action</TableHeaderColumn>

            </BootstrapTable>

            {/* {data.map((supplier) => (

              <div class="modal" id={`sup${supplier.id}`}    >
                <div class="modal-dialog">
                  <div class="modal-content">


                    <div class="modal-header">
                      <h4 class="modal-title">Update Supplier</h4>
                      <button type="button" class="close" data-dismiss="modal" onClick={this.reset}>&times;</button>
                    </div>


                    <div class="modal-body">

                      <form class="form-inline"
                        method="post"
                        onSubmit={this.handleSubmitUpdate}
                        ref={(el) => {
                          this.updateForm = el;
                        }}
                      >
                        <table style={up_form} class="table-borderless">
                          <tr>
                            <td>
                              Name<br />
                              <input type="text"
                                id="upSupplier"
                                name="name"
                                onChange={this.handleChange}
                                style={up_input}
                                class="form-control mb-2 mr-sm-2" defaultValue={supplier.name} />
                            </td>
                          </tr>
                          <tr>
                            <td>
                              Address<br />
                              <input type="text"
                                id="upSupplier"
                                name="address"
                                onChange={this.handleChange}
                                style={up_input}


                                class="form-control mb-2 mr-sm-2" defaultValue={supplier.address} />
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

            ))} */}

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

export default connect(mapStateToProps)(Suppliers);
