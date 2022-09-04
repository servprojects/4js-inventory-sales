import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../Http';
import classNames from 'classnames';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import CSVReader from 'react-csv-reader'
import update from 'immutability-helper';
class Projects extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);

    // Initial state.
    this.state = {
      role: null,
      upbeg: false,
      loading: false,
      name: null,
      project_desc: null,
      location: null,
      upId: null,
      error: false,
      updatable: false,
      data: [],
      imported: [],
    };

    // API endpoint.
    this.api = '/api/v1/project';
  }
  componentDidMount() {
    this._isMounted = true
    this.setState({ loading: true });
    Http.get(`${this.api}`)
      .then((response) => {
        // const { data } = response.data;

        if (this._isMounted) {
          this.setState({
            data: response.data.projects,
            role: response.data.role,
            error: false,
          });
          this.setState({ loading: false });
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
      project_desc: this.state.project_desc,
      location: this.state.location
    }
    if (this._isMounted) {
      this.setState({ loading: true });
    }
    this.addProject(subs);
  };

  addProject = (project) => {
    this._isMounted = true
    Http.post(this.api, project)
      .then(({ data }) => {
        const newItem = {
          id: data.id,
          name: project.name,
          project_desc: project.project_desc,
          location: project.location,
          balance: 0,
        };
        const allProjects = [newItem, ...this.state.data];
        if (this._isMounted) {
          this.setState({ data: allProjects, name: null, location: null, project_desc: null });
        }
        this.projectForm.reset();
        if (this._isMounted) {
          this.setState({ loading: false });
        }
        toast("Project Added successfully!")
      })
      .catch(() => {
        if (this._isMounted) {
          this.setState({ loading: false });
          toast("Error adding project!")
        }
      });
  };


  deleteProject = (e) => {
    this._isMounted = true
    const { key } = e.target.dataset;
    const { data: proj } = this.state;
    if (confirm("Confirmation to delete.")) {

      if (this._isMounted) {
        this.setState({ loading: true });
      }
      Http.delete(`${this.api}/${key}`)
        .then((response) => {
          if (response.status === 204) {
            const index = proj.findIndex(
              (project) => parseInt(project.id, 10) === parseInt(key, 10),
            );
            const update = [...proj.slice(0, index), ...proj.slice(index + 1)];
            if (this._isMounted) {
              this.setState({ data: update });
              this.setState({ loading: false });
            }

            toast("Project Deleted successfully!")
          }
        })
        .catch((error) => {
          console.log(error);
          toast("Error deleting project!")
        });
      if (this._isMounted) {
        this.setState({ loading: false });
      }
    }

  };

  handleSubmitUpdate = (e) => {
    this._isMounted = true
    e.preventDefault();
    const subs = {
      name: this.state.name,
      project_desc: this.state.project_desc,
      location: this.state.location
    }
    if (this._isMounted) {
      this.setState({ loading: true });
    }
    this.updateProject(subs);
  };

  updateProject = (project) => {
    Http.patch(`${this.api}/${this.state.upId}`, project)//last stop here no API YET
      .then((response) => {



        if (this._isMounted) {
          this.setState({
            data: response.data.updated,
            error: false,
          });
          this.setState({ loading: false });
        }
        toast("Project Updated successfully!")
        this.projectupForm.reset();
      })
      .catch(() => {
        if (this._isMounted) {
          this.setState({
            // error: 'Sorry, there was an error saving your project.',
            loading: false
          });
        }
        toast("Error updating project!")
      });
  };

  setUpId = (e) => {
    this._isMounted = true
    const { key } = e.target.dataset;
    if (this._isMounted) {
      this.setState({ upId: key })
    }
  };
  reset = (e) => {
    this._isMounted = true
    if (this._isMounted) {
      this.setState({ name: null, location: null, project_desc: null });
    }

  };
  buttonFormatter = (cell, row) => {
    const { loading } = this.state;
    return (
      <div>
        <center>
          <button type="button" data-key={row.id} onClick={this.setUpId}
            class=" btn btn-secondary" data-backdrop="static" data-keyboard="false" data-toggle="modal" data-target={`#proj${row.id}`}>
            <i data-key={row.id} onClick={this.setUpId} class='fas icons'>&#xf304;</i>
          </button>

    &nbsp;
        <button
            type="button"
            className="btn btn-secondary"
            onClick={this.deleteProject}
            data-key={row.id}
          >
            <i class='fas icons' onClick={this.deleteProject}
              data-key={row.id}>&#xf1f8;</i>
          </button>
        </center>
        <div class="modal" id={`proj${row.id}`}
          ref={(el) => {
            this.projectModal = el;
          }} >
          <div class="modal-dialog">
            <div class="modal-content">


              <div class="modal-header">
                <h4 class="modal-title">Update Project</h4>
                <button type="button" class="close" data-dismiss="modal" onClick={this.reset}>&times;</button>
              </div>


              <div class="modal-body">

                <form
                  method="post"
                  onSubmit={this.handleSubmitUpdate}
                  ref={(el) => {
                    this.projectupForm = el;
                  }}
                >

                  Name<br />
                  <input type="text"
                    id="upProject"
                    name="name"
                    onChange={this.handleChange}

                    class="form-control mb-2 mr-sm-2" defaultValue={row.name} />

                              Location<br />
                  <input type="text"
                    id="upProject"
                    name="location"
                    onChange={this.handleChange}


                    class="form-control mb-2 mr-sm-2" defaultValue={row.location} />

                              Description<br />
                  <input type="text"
                    id="upProject"
                    name="project_desc"
                    onChange={this.handleChange}


                    class="form-control mb-2 mr-sm-2" defaultValue={row.project_desc} />

                  <button type="submit"
                    className={classNames('btn btn-primary mb-2', {
                      'btn-loading': loading,
                    })}>Update</button>


                </form>
              </div>


              <div class="modal-footer">
                <button type="button" class="btn btn-danger" data-dismiss="modal" onClick={this.reset} >Close</button>
              </div>

            </div>
          </div>
        </div>

      </div>
    )
  }
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

      toast("Project deleted successfully!")
    }
  };
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

    toast("Project successfully updated", {
      position: toast.POSITION.BOTTOM_RIGHT,
      className: 'foo-bar'
    });

    // alert('Thw whole row :\n' + rowStr);
  }
  submitImport = (e) => {
    this._isMounted = true
    if (confirm(`Are you sure you want to insert data?`)) {
      Http.post(`/api/v1/project/import`, { items: JSON.stringify(this.state.imported) })//last stop here no API YET
        .then(({ data }) => {

          if (this._isMounted) {
            this.setState({
              // data: data.updated,
              // error: false,
            });

          }
          toast("Projects imported successfully!")

        })
        .catch(() => {

          toast("Error importing projects")
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






    if (confirm("Confirm balance update. This update will affect project's collectible but the transaction will be recorded.")) {
      const subs = {
        project_id: row.id,
        newbal: value
      }
      // console.log(subs)
      // console.log(row.balance)
      // Http.post('/api/v1/project/upbal', subs)
      Http.post('/api/v1/project/upbal', subs)
        .then((response) => {
          if (this._isMounted) {

            if (response.data.stat !== 105) {
              const { data } = this.state;
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

            // const { data, dataAll } = this.state;
            // var commentIndex = data.findIndex(function (c) {
            //   return c.id == row.id;
            // });

            // var updatedComment;
            // var newData;

            // if (response.data.stat !== 105) {

            //   updatedComment = update(data[commentIndex], { collectible_amount: { $set: value * row.unit_price }, balance: { $set: value } });

            //   newData = update(data, {
            //     $splice: [[commentIndex, 1, updatedComment]]
            //   });

            //   if (this._isMounted) {
            //     this.setState({ data: newData });
            //   }
            //   toast(response.data.message)


            //   response.isValid = true;

            // }
            // else {
            //   updatedComment = update(data[commentIndex], { balance: { $set: row.balance } });

            //   newData = update(data, {
            //     $splice: [[commentIndex, 1, updatedComment]]
            //   });

            //   response.isValid = true;

            //   toast(response.data.message)

            // }

            toast(response.data.message)

          }
        })
        .catch(() => {
          toast("Error updating project balance")
          // this.setState({
          //   error: 'Unable to fetch data.',
          // });
        });
    }

    // console.log(newData)

    // if (this._isMounted) {
    //     this.setState({ dataPrint: newData });
    // }
    // console.log(newData)

    return response;
  }
  render() {
    const { data, error, loading, imported, role } = this.state;


    const pill_form = {
      // textAlign: "center",
      // paddingLeft: "39%",
      width: "100%"
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
            <li class="breadcrumb-item active" aria-current="page">Projects</li>
          </ol>
        </nav>

        <br />
        <ToastContainer />
        {/* <center> */}
        <div style={pill_form}>
          <div class="inline_block">
            <button type="button" class="btn btn-primary" data-toggle="collapse" data-target="#project">Add New Project</button>
          </div>
            &nbsp;&nbsp;&nbsp;
            <div class="inline_block">
            <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#imp">
              Import
          </button>

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
                    <i>*import project are for those projects that do not exist yet in the system. If you want to update a project please use the update
              " <i class='fas icons'>&#xf304;</i>" icon of an item inside utilities/project
                </i>
                    <br />
                    <br />
                    <div class="inline_block" style={{ float: "right" }}>
                      <a href='/templates/project_template.csv' download>Download template here</a><br />
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
                      <TableHeaderColumn dataField='name' tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }}  >Name</TableHeaderColumn>
                      <TableHeaderColumn dataField="location" width="200">Location</TableHeaderColumn>
                      <TableHeaderColumn dataField="project_desc" width="200" >Description</TableHeaderColumn>
                      <TableHeaderColumn dataField='balance'  tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Balance</TableHeaderColumn>



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

          <div id="project" class="collapse">
            <br />

            <form class="form-inline"
              method="post"
              onSubmit={this.handleSubmit}
              ref={(el) => {
                this.projectForm = el;
              }}
            >
              <table>
                <tr>
                  <td>
                    <input type="text"
                      id="addProject"
                      name="name"
                      onChange={this.handleChange}
                      required
                      class="form-control mb-2 mr-sm-2" placeholder="Enter project name" />
                  </td>
                </tr>
                <tr>
                  <td>
                    <input type="text"
                      id="addProject"
                      name="location"
                      onChange={this.handleChange}

                      class="form-control mb-2 mr-sm-2" placeholder="Enter project location" />
                  </td>
                </tr>
                <tr>
                  <td>
                    <textarea name="project_desc" rows="4" cols="22" class="form-control mb-2 mr-sm-2" onChange={this.handleChange} placeholder="Enter project description">
                    </textarea>
                    {/* <input type="text"
                      id="addProject"
                      name="project_desc"
                      onChange={this.handleChange}

                      class="form-control mb-2 mr-sm-2" placeholder="Enter project description" /> */}
                  </td>
                </tr>
                <tr>
                  <td>
                    <button type="submit"
                      className={classNames('btn btn-primary mb-2', {
                        'btn-loading': loading,
                      })}>Add</button>
                  </td>
                </tr>
              </table>
            </form>
          </div>


          <br />
        </div>
        {/* </center> */}
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
              <TableHeaderColumn editable={false} dataField='id' tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} isKey={true} hidden={true}>id</TableHeaderColumn>
              <TableHeaderColumn editable={false} dataField='name' tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }}  >Name</TableHeaderColumn>
              <TableHeaderColumn editable={false} dataField="location" width="200">Location</TableHeaderColumn>
              <TableHeaderColumn editable={false} dataField="project_desc" width="200" >Description</TableHeaderColumn>
              <TableHeaderColumn dataField="balance" hidden={role == "Cashier" ? true : false} editable={this.state.upbeg} width="200" >Balance</TableHeaderColumn>
              <TableHeaderColumn editable={false} dataField="id" width="130" dataFormat={this.buttonFormatter}>Action</TableHeaderColumn>

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

export default connect(mapStateToProps)(Projects);
