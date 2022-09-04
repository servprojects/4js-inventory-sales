import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../../Http';
import classNames from 'classnames';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';

class Positions extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);

    // Initial state.
    this.state = {
      loading: false,
      position: null,
      name: null,
      error: false,
      upId: null,
      data: [],
    };

    // API endpoint.
    this.api = '/api/v1/position';
  }
  componentDidMount() {
    this._isMounted = true
    Http.get(`${this.api}`)
      .then((response) => {
        // const { data } = response.data;
        if (this._isMounted) {
          this.setState({
            data: response.data.positions.data,
            error: false,
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
    const { position } = this.state;
    if (this._isMounted) {
      this.setState({ loading: true });
    }
    this.addPosition(position);
  };

  addPosition = (position) => {
    this._isMounted = true
    Http.post(this.api, { name: position })
      .then(({ data }) => {
        const newItem = {
          id: data.id,
          name: position,
        };
        const allPositions = [newItem, ...this.state.data];
        if (this._isMounted) {
          this.setState({ data: allPositions, position: null });
        }
        this.positionForm.reset();
        if (this._isMounted) {
          this.setState({ loading: false });
        }
        toast("Position added successfully!")
      })
      .catch(() => {
        if (this._isMounted) {
          toast("Error adding position!")

        }
      });
  };

  deletePosition = (e) => {
    this._isMounted = true
    const { key } = e.target.dataset;
    const { data: pos } = this.state;
    if (this._isMounted) {
      this.setState({ loading: true });
    }
    Http.delete(`${this.api}/${key}`)
      .then((response) => {
        if (response.status === 204) {
          const index = pos.findIndex(
            (position) => parseInt(position.id, 10) === parseInt(key, 10),
          );
          const update = [...pos.slice(0, index), ...pos.slice(index + 1)];
          if (this._isMounted) {
            this.setState({ data: update });
            this.setState({ loading: false });
          }
        }
        toast("Position deleted successfully!")
      })
      .catch((error) => {
        console.log(error);
        toast("Error deleting position!")
        if (this._isMounted) {
          this.setState({ loading: false });
        }
      });
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
      name: this.state.name
    }
    if (this._isMounted) {
      this.setState({ loading: true });
    }
    this.updateProperty(subs);
  };

  updateProperty = (property) => {
    Http.patch(`${this.api}/${this.state.upId}`, property)//last stop here no API YET
      .then(({ data }) => {

        if (this._isMounted) {
          this.setState({
            data: data.updated.data,
            error: false,
          });
          this.setState({ loading: false });
        }
        toast("Position Updated successfully!")
        this.updateForm.reset();
      })
      .catch(() => {
        if (this._isMounted) {
          this.setState({
            loading: false
          });
        }
        toast("Error updating position!")
      });
  };

  reset = (e) => {
    this._isMounted = true
    if (this._isMounted) {
      this.setState({ name: null });
    }

  };
  buttonFormatter = (cell, row) => {

    return (
      <div>
        <button type="button" data-key={row.id} onClick={this.setUpId}
          class=" btn btn-secondary" data-backdrop="static" data-keyboard="false" data-toggle="modal" data-target={`#position${row.id}`}>
          <i data-key={row.id} onClick={this.setUpId} class='fas icons'>&#xf304;</i>
        </button>

  &nbsp;
        <button
          type="button"
          className="btn btn-secondary"
          onClick={this.deletePosition}
          data-key={row.id}
        >
          <i class='fas icons' onClick={this.deletePosition}
            data-key={row.id}>&#xf1f8;</i>
        </button>
      </div>
    )
  }
  render() {
    const { data, error, loading } = this.state;
    const pill_form = {
      // textAlign: "center",
      // paddingLeft: "30%",
      width: "20%",
    };
    const up_form = {
      paddingLeft: "28%",
      width: "100%",
    };
    const up_input = {
      width: "100%",
    };
    return (
      <div style={{ marginTop: "2%", marginLeft: "3%", marginRight: "3%" }}>
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb">
          <li class="breadcrumb-item"> <Link to="/payroll"><a href="#">Employee Management</a></Link></li>
            <li class="breadcrumb-item active" aria-current="page">Positions</li>
          </ol>
        </nav>
        <ToastContainer />
        {/* <center> <h3>POSITIONS</h3> </center> */}

        <br />
        <center>
          <div style={pill_form}>
            <form class="form-inline"
              method="post"
              onSubmit={this.handleSubmit}
              ref={(el) => {
                this.positionForm = el;
              }}
            >
              <input type="text"
                id="addposition"
                name="position"
                onChange={this.handleChange}

                class="form-control mb-2 mr-sm-2" placeholder="Enter new position" />
              <button type="submit" className={classNames('btn btn-primary mb-2', {
                'btn-loading': loading,
              })} >Add</button>
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
            <BootstrapTable
              ref='table'
              data={data}
              pagination={true}
              search={true}

            // style={itemTabs}

            // options={options} exportCSV
            >
              <TableHeaderColumn dataField='id' tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} isKey={true} hidden={true}>id</TableHeaderColumn>
              <TableHeaderColumn dataField='name' tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }}  >Name</TableHeaderColumn>
              <TableHeaderColumn dataField="id" width="200" dataFormat={this.buttonFormatter}>Action</TableHeaderColumn>

            </BootstrapTable>
            {/* <table className="table table-striped">
            <tbody>
              <tr>
                <th>Name</th>
                <th>Action</th>
              </tr> */}
            {data.map((position) => (
              // <tr key={position.id}>
              //   <td>{position.name}</td>
              //   <td>
              //   <button  type="button"
              //       data-key={position.id} onClick={this.setUpId} data-backdrop="static" data-keyboard="false"  class="btn btn-secondary" data-toggle="modal" data-target= {`#position${position.id}`}>
              //     Update
              //   </button>
              <div class="modal" id={`position${position.id}`}    >
                <div class="modal-dialog">
                  <div class="modal-content">


                    <div class="modal-header">
                      <h4 class="modal-title">Update position</h4>
                      <button type="button" onClick={this.reset} class="close" data-dismiss="modal">&times;</button>
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
                                id="upposition"
                                name="name"
                                onChange={this.handleChange}
                                style={up_input}
                                class="form-control mb-2 mr-sm-2" defaultValue={position.name} />
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
              //   &nbsp;
              //     <button
              //       type="button"
              //       className="btn btn-secondary"
              //        onClick={this.deletePosition}
              //       data-key={position.id}
              //     >
              //       Delete
              //     </button>
              //   </td>
              // </tr>
            ))}
            {/* </tbody>
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

export default connect(mapStateToProps)(Positions);
