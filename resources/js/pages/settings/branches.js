import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../Http';
import classNames from 'classnames';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import update from 'immutability-helper';
class Branches extends Component {
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
      upId: null,
      error: false,
      data: [],
    };

    // API endpoint.
    this.api = '/api/v1/branch';
  }
  componentDidMount() {
   this.getData()
  }

  getData(){
    this._isMounted = true
    Http.get(`${this.api}`)
      .then((response) => {
        // const { data } = response.data;
        if (this._isMounted) {
          this.setState({
            data: response.data.branches,
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
      location: this.state.location
    }

    if (confirm("Are you sure you want to add this branch? You can no longer delete branch once its added to the system.")) {
      if (this._isMounted) {
        this.setState({ loading: true });
      }
      this.addBranch(subs);
    }



  };

  addBranch = (branch) => {
    this._isMounted = true
    Http.post(this.api, branch)
      .then((response) => {
        // const newItem = {
        //   id: data.id,
        //   name: branch.name,
        //   location: branch.location,
        // };
        // const allBranches = [newItem, ...this.state.data];
        if (this._isMounted) {
          this.setState({ data: response.data.branches, name: null, location: null });
        }
        this.branchForm.reset();
        if (this._isMounted) {
          this.setState({ loading: false });
        }
        toast("Branch added successfully!")
      })
      .catch(() => {
        console.log(error);
        toast("Error adding branch!")
      });
  };

  deleteBranch = (e) => {
    this._isMounted = true
    const { key } = e.target.dataset;
    const { data: brnc } = this.state;
    if (confirm("Confirmation to delete.")) {
      if (this._isMounted) {
        this.setState({ loading: true });
      }
      Http.delete(`${this.api}/${key}`)
        .then((response) => {
          if (response.status === 204) {
            const index = brnc.findIndex(
              (branch) => parseInt(branch.id, 10) === parseInt(key, 10),
            );
            const update = [...brnc.slice(0, index), ...brnc.slice(index + 1)];
            if (this._isMounted) {
              this.setState({ data: update });
              this.setState({ loading: false });
            }
          }
          toast("Branch deleted successfully!")
        })
        .catch((error) => {
          console.log(error);
          toast("Error deleting branch!")
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
      location: this.state.location
    }
    if (this._isMounted) {
      this.setState({ loading: true });
    }
    this.updateProperty(subs);
  };

  handleSubmitUpdateDisable = (id, dis) => {
    this._isMounted = true
   console.log("Disabled")
   console.log(id)
   console.log(dis)
    const subs = {
      isDisabled: dis == 1? 0 : 1,
    }
    if(confirm("Are you sure you want to proceed?")){
    this.updatePropertyDis(id, subs);}
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
        toast("Branch Updated successfully!")
        this.updateForm.reset();
      })
      .catch(() => {
        if (this._isMounted) {
          this.setState({
            loading: false
          });
        }
        toast("Error updating branch!")
      });
  };

  updatePropertyDis = (id, property) => {
    console.log("property")
    console.log(property)
    Http.patch(`${this.api}/${id}`, property)//last stop here no API YET
      .then((response) => {

       this.getData()
        toast("Branch Updated successfully!")
        this.updateForm.reset();
      })
      .catch(() => {
        if (this._isMounted) {
          this.setState({
            loading: false
          });
        }
        toast("Error updating branch!")
      });
  };

  reset = (e) => {
    this._isMounted = true
    if (this._isMounted) {
      this.setState({ name: null, location: null });
    }

  };

  buttonFormatter = (cell, row) => {
    const { loading } = this.state;
    return (
      <div>
        <center>
          <button type="button" data-key={row.id} onClick={this.setUpId}
            class=" btn btn-secondary" data-backdrop="static" data-keyboard="false" data-toggle="modal" data-target={`#branch${row.id}`}>
            <i data-key={row.id} onClick={this.setUpId} class='fas icons'>&#xf304;</i>
          </button>

          {/* &nbsp;
        <button
            type="button"
            className="btn btn-secondary"
            onClick={this.deleteBranch}
            data-key={row.id}
          >
            <i class='fas icons' onClick={this.deleteBranch}
              data-key={row.id}>&#xf1f8;</i>
          </button> */}
        </center>

        <div class="modal" id={`branch${row.id}`}    >
          <div class="modal-dialog">
            <div class="modal-content">


              <div class="modal-header">
                <h4 class="modal-title">Update branch</h4>
                <button type="button" class="close" onClick={this.reset} data-dismiss="modal">&times;</button>
              </div>


              <div class="modal-body">

                <form
                  method="post"
                  onSubmit={this.handleSubmitUpdate}
                  ref={(el) => {
                    this.updateForm = el;
                  }}
                >

                  Name<br />
                  <input type="text"
                    id="upBranch"
                    name="name"
                    onChange={this.handleChange}
                    required
                    class="form-control mb-2 mr-sm-2" defaultValue={row.name} />

                                      Location<br />
                  <input type="text"
                    id="upBranch"
                    name="location"
                    onChange={this.handleChange}
                    required

                    class="form-control mb-2 mr-sm-2" defaultValue={row.location} />

                  <button type="submit"
                    className={classNames('btn btn-primary mb-2', {
                      'btn-loading': loading,
                    })}>Update</button>

                </form>
              </div>


              <div class="modal-footer">
                <button type="button" class="btn btn-danger" onClick={this.reset} data-dismiss="modal">Close</button>
              </div>

            </div>
          </div>
        </div>
      </div>
    )
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

    if (confirm("Confirm balance update. This update will affect office's collectible but the transaction will be recorded.")) {
      const subs = {
        office_id: row.id,
        newbal: value
      }
      Http.post('/api/v1/office/upbal', subs)
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

  liveUpDisp = (cell, row) => {

    return (
      <>
        {/* <Radio toggle checked={row.live_update == "yes" ? true : false} data-key={row.id} data-tog={row.live_update} onClick={this.upPhys(row.id, row.live_update)} /> */}
{
  <div class="ui toggle checkbox">
  <input type="checkbox" name="public"  onClick={(e) => this.handleSubmitUpdateDisable(row.id, row.isDisabled)} checked={row.isDisabled == 1? false : true} data-key={row.id} data-tog={"yes"}/>
  {/* <input type="checkbox" name="public" checked={row.live_update == "yes" ? true : false} data-key={row.id} data-tog={row.live_update} onClick={this.upPhys} /> */}
  <label> </label>
</div>
}
      </>
    )
  }

  render() {
    const { data, error, loading } = this.state;
    const pill_form = {
      // textAlign: "center",
      // paddingLeft: "15%",
    };
    const up_form = {
      paddingLeft: "28%",
      width: "100%",
    };
    const up_input = {
      width: "100%",
    };

    const cellEditPropList = {
      mode: 'click',
      blurToSave: true
    };

    return (
      <div class="utilityContainer" >
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb-item active" aria-current="page">Branches</li>
          </ol>
        </nav>

        <br />
        <ToastContainer />
        <center>
          <div style={pill_form}>
            <form class="form-inline"
              method="post"
              onSubmit={this.handleSubmit}
              ref={(el) => {
                this.branchForm = el;
              }}
            >
              <input type="text"
                id="addBranch"
                name="name"
                onChange={this.handleChange}
                required
                class="form-control mb-2 mr-sm-2" placeholder="Enter branch name" />
              <input type="text"
                id="addBranch"
                name="location"
                onChange={this.handleChange}
                required
                class="form-control mb-2 mr-sm-2" placeholder="Enter branch location" />
              <button type="submit"
                className={classNames('btn btn-primary mb-2', {
                  'btn-loading': loading,
                })}>Add</button>
            </form>
            <br />
          </div>
        </center>
        <div>
          {error && (
            <div className="alert alert-warning" role="alert">
              {error}
            </div>
          )}
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
              <TableHeaderColumn dataField='name' tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }}  >Name</TableHeaderColumn>
              <TableHeaderColumn dataField="location" width="200">Location</TableHeaderColumn>
              <TableHeaderColumn editable={this.state.upbeg} dataField="balance" width="200" >Balance</TableHeaderColumn>
              <TableHeaderColumn editable={false} dataField="balance" width="200" dataFormat={this.liveUpDisp} >Enable</TableHeaderColumn>
              <TableHeaderColumn dataField="id" width="130" dataFormat={this.buttonFormatter}>Action</TableHeaderColumn>
              
            </BootstrapTable>
            {/* <table className="table ">
              <tbody>
                <tr>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Charge Balance</th>
                  <th>Action</th>
                </tr>
                {data.map((branch) => (
                  <tr key={branch.id}>
                    <td>{branch.name}</td>
                    <td>{branch.location}</td>
                    <td>{branch.balance}</td>
                    <td>
                      <button type="button"
                        data-key={branch.id} onClick={this.setUpId} class="btn btn-secondary" data-backdrop="static" data-keyboard="false" data-toggle="modal" data-target={`#branch${branch.id}`}>
                        Update
                  </button>
                      <div class="modal" id={`branch${branch.id}`}    >
                        <div class="modal-dialog">
                          <div class="modal-content">


                            <div class="modal-header">
                              <h4 class="modal-title">Update branch</h4>
                              <button type="button" class="close" onClick={this.reset} data-dismiss="modal">&times;</button>
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
                                        id="upBranch"
                                        name="name"
                                        onChange={this.handleChange}
                                        style={up_input}
                                        class="form-control mb-2 mr-sm-2" placeholder={branch.name} />
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>
                                      Location<br />
                                      <input type="text"
                                        id="upBranch"
                                        name="location"
                                        onChange={this.handleChange}
                                        style={up_input}


                                        class="form-control mb-2 mr-sm-2" placeholder={branch.location} />
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
                              <button type="button" class="btn btn-danger" onClick={this.reset} data-dismiss="modal">Close</button>
                            </div>

                          </div>
                        </div>
                      </div>
                  &nbsp;
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={this.deleteBranch}
                        data-key={branch.id}
                      >
                        Delete
                    </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table> */}
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

export default connect(mapStateToProps)(Branches);
