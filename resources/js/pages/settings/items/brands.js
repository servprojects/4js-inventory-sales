import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../../Http';
import classNames from 'classnames';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import { Icon } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';

class Brands extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);

    // Initial state.
    this.state = {
      loading: false,
      brand: null,
      name: null,
      error: false,
      upId: null,
      data: [],
    };

    // API endpoint.
    this.api = '/api/v1/brand';
  }
  componentDidMount() {
    this._isMounted = true
    Http.get(`${this.api}`)
      .then((response) => {
        const { data } = response.data;
        if (this._isMounted) {
          this.setState({
            data,
            error: false,
          });
          console.log(data)
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
    const { name, value } = e.target;
    if (this._isMounted) {
      this.setState({ [name]: value });
    }
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { brand } = this.state;
    if (this._isMounted) {
      this.setState({ loading: true });
    }
    this.addBrand(brand);
  };

  addBrand = (brand) => {
    this._isMounted = true
    Http.post(this.api, { name: brand })
      .then(({ data }) => {
        const newItem = {
          id: data.id,
          name: brand,
        };
        const allBrands = [newItem, ...this.state.data];
        if (this._isMounted) {
          this.setState({ data: allBrands, brand: null });
        }
        this.brandForm.reset();
        if (this._isMounted) {
          this.setState({ loading: false });
        }
        toast("Brand added successfully!")
      })
      .catch(() => {
        if (this._isMounted) {
          toast("Error adding brand!")
        }
      });
  };
  deleteBrand = (e) => {
    this._isMounted = true
    const { key } = e.target.dataset;
    const { data: brd } = this.state;
    if (this._isMounted) {
      this.setState({ loading: true });
    }
    Http.delete(`${this.api}/${key}`)
      .then((response) => {
        if (response.status === 204) {
          const index = brd.findIndex(
            (brand) => parseInt(brand.id, 10) === parseInt(key, 10),
          );
          const update = [...brd.slice(0, index), ...brd.slice(index + 1)];
          if (this._isMounted) {
            this.setState({ data: update });
            this.setState({ loading: false });
          }
        }
        toast("Brand deleted successfully!")
      })
      .catch((error) => {
        console.log(error);
        toast("Error deleting brand!")
      });
      if (this._isMounted) {
        this.setState({ loading: false });
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
        toast("Brand Updated successfully!")
        this.updateForm.reset();
      })
      .catch(() => {
        if (this._isMounted) {
          this.setState({
            loading: false
          });
        }
        toast("Error updating brand!")
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
          class=" btn btn-secondary" data-backdrop="static" data-keyboard="false" data-toggle="modal"  data-target={`#brand${row.id}`}>
          {/* <i data-key={row.id} onClick={this.setUpId}  class='fas icons'>&#xf304;</i> */}
          <i data-key={row.id} onClick={this.setUpId}  class='fas icons'><Icon data-key={row.id} onClick={this.setUpId} size='small' name='pencil' /></i>
        </button>

    &nbsp;
        <button
          type="button"
          className="btn btn-secondary"
          onClick={this.deleteBrand}
          data-key={row.id}
        >
          <i class='fas icons'  onClick={this.deleteBrand}
            data-key={row.id}><Icon onClick={this.deleteBrand}
            data-key={row.id} size='small' name='trash' /></i>
          {/* <i class='fas icons'  onClick={this.deleteBrand}
            data-key={row.id}>&#xf1f8;</i> */}
        </button>
      </div>
    )
  }

  render() {
    const { data, error, loading } = this.state;
    const pill_form = {
      textAlign: "center",
      paddingLeft: "30%",
    };
    const up_form = {
      paddingLeft: "28%",
      width: "100%",
    };
    const up_input = {
      width: "100%",
    };
    return (
      <div>
        <ToastContainer />
       

        <br />
        <div style={pill_form}>
          <form class="form-inline"
            method="post"
            onSubmit={this.handleSubmit}
            ref={(el) => {
              this.brandForm = el;
            }}
          >
            <input type="text"
              id="addBrand"
              name="brand"
              onChange={this.handleChange}

              class="form-control mb-2 mr-sm-2" placeholder="Enter new brand" />
            <button type="submit" className={classNames('btn btn-primary mb-2', {
              'btn-loading': loading,
            })} >Add</button>
          </form>
          <br />
        </div>
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
              <TableHeaderColumn dataField='name'  tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }}  >Name</TableHeaderColumn>
              <TableHeaderColumn dataField="id"  width="200" dataFormat={this.buttonFormatter}>Action</TableHeaderColumn>
             
            </BootstrapTable>
            {/* <table className="table table-striped">
              <tbody>
                <tr>
                  <th>Name</th>
                  <th>Action</th>
                </tr> */}
                {data.map((brand) => (
                  // <tr key={brand.id}>
                  //   <td>{brand.name}</td>
                  //   <td>
                  //     <button type="button"
                  //       data-key={brand.id} onClick={this.setUpId} class="btn btn-secondary" data-backdrop="static" data-keyboard="false" data-toggle="modal" data-target={`#brand${brand.id}`}>
                  //       Update
                  // </button>
                      <div class="modal" id={`brand${brand.id}`}    >
                        <div class="modal-dialog">
                          <div class="modal-content">


                            <div class="modal-header">
                              <h4 class="modal-title">Update Brand</h4>
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
                                        id="upBrand"
                                        name="name"
                                        onChange={this.handleChange}
                                        style={up_input}
                                        class="form-control mb-2 mr-sm-2" defaultValue={brand.name} />
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
                  // &nbsp;
                  //   <button
                  //       type="button"
                  //       className="btn btn-secondary"
                  //       onClick={this.deleteBrand}
                  //       data-key={brand.id}
                  //     >
                  //       Delete
                  //   </button>
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

export default connect(mapStateToProps)(Brands);
