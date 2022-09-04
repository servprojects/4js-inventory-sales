import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../../Http';
import classNames from 'classnames';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import { Icon } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';

class ItemCat extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);

    // Initial state.
    this.state = {
      loading: false,
      name: null,
      upId: null,
      error: false,
      data: [],
    };

    // API endpoint.
    this.api = '/api/v1/category';
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
    const { category } = this.state;
    if (this._isMounted) {
      this.setState({ loading: true });
    }
    this.addCategory(category);
  };

  addCategory = (category) => {
    this._isMounted = true
    Http.post(this.api, { name: category })
      .then(({ data }) => {
        const newItem = {
          id: data.id,
          name: category,
        };
        const allCategory = [newItem, ...this.state.data];
        if (this._isMounted) {
          this.setState({ data: allCategory, name: null });
        }
        this.categoryForm.reset();
        if (this._isMounted) {
          this.setState({ loading: false });
        }
        toast("Category added successfully!")
      })
      .catch(() => {
        if (this._isMounted) {
          toast("Error adding category!")

        }
      });
  };


  deleteItemcat = (e) => {
    this._isMounted = true
    const { key } = e.target.dataset;
    const { data: ic } = this.state;
    if (this._isMounted) {
      this.setState({ loading: true });
    }
    Http.delete(`${this.api}/${key}`)
      .then((response) => {
        if (response.status === 204) {
          const index = ic.findIndex(
            (itemcat) => parseInt(itemcat.id, 10) === parseInt(key, 10),
          );
          const update = [...ic.slice(0, index), ...ic.slice(index + 1)];
          if (this._isMounted) {
            this.setState({ data: update });
            this.setState({ loading: false });
          }
        }
        toast("Category deleted successfully!")
      })
      .catch((error) => {
        console.log(error);
        toast("Error deleting category!")
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
        toast("Category Updated successfully!")
        this.updateForm.reset();
      })
      .catch(() => {
        if (this._isMounted) {
          this.setState({
            loading: false
          });
        }
        toast("Error updating category!")
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
          class=" btn btn-secondary" data-backdrop="static" data-keyboard="false" data-toggle="modal" data-target={`#category${row.id}`}>
          {/* <i data-key={row.id} onClick={this.setUpId}  class='fas icons'>&#xf304;</i> */}
          <i data-key={row.id} onClick={this.setUpId}  class='fas icons'><Icon data-key={row.id} onClick={this.setUpId} size='small' name='pencil' /></i>
        </button>

    &nbsp;
        <button
          type="button"
          className="btn btn-secondary"
          onClick={this.deleteItemcat}
          data-key={row.id}
        >
          {/* <i class='fas icons'  onClick={this.deleteItemcat}
            data-key={row.id}>&#xf1f8;</i>   */}
          <i class='fas icons'  onClick={this.deleteItemcat}
            data-key={row.id}><Icon onClick={this.deleteItemcat}
            data-key={row.id} size='small' name='trash' /></i>
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
              this.categoryForm = el;
            }}
          >
            <input type="text"
              id="addcategory"
              name="category"
              onChange={this.handleChange}

              class="form-control mb-2 mr-sm-2" placeholder="Enter new category" />
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
                  <th>Id</th>
                  <th>Name</th>
                  <th>Action</th>
                </tr> */}
                {data.map((category) => (
                  // <tr key={category.id}>
                  //   <td>{category.id}</td>
                  //   <td>{category.name}</td>
                  //   <td>
                  //     <button type="button"
                  //       data-key={category.id} onClick={this.setUpId} data-backdrop="static" data-keyboard="false" class="btn btn-secondary" data-toggle="modal" data-target={`#category${category.id}`}>
                  //       Update
                  // </button>
                      <div class="modal" id={`category${category.id}`}    >
                        <div class="modal-dialog">
                          <div class="modal-content">


                            <div class="modal-header">
                              <h4 class="modal-title">Update category</h4>
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
                                        id="upBrand"
                                        name="name"
                                        onChange={this.handleChange}
                                        style={up_input}
                                        defaultValue={category.name}
                                        class="form-control mb-2 mr-sm-2" placeholder={category.name} />
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
                              <button type="button" onClick={this.reset} class="btn btn-danger" data-dismiss="modal">Close</button>
                            </div>

                          </div>
                        </div>
                      </div>
                  // &nbsp;
                  //   <button
                  //       type="button"
                  //       className="btn btn-secondary"
                  //       onClick={this.deleteItemcat}
                  //       data-key={category.id}
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

export default connect(mapStateToProps)(ItemCat);
