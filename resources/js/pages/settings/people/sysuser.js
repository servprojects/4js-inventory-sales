import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../../Http';
import classNames from 'classnames';
import { Dropdown, Icon } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import { Link } from 'react-router-dom';

class Sysusers extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);

    // Initial state.
    this.state = {
      loading: false,
      branch_id: null,
      error: false,
      first_name: null,
      middle_name: null,
      last_name: null,
      role: null,
      contact_no: null,
      address: null,
      email: null,
      password: null,
      confirmpassword: null,
      exist: null,
      user_details_id: null,
      display1: 'none',
      display2: 'block',
      upId: null,
      fname: null,
      lname: null,
      data: [],
      branch: [],
      personnel: [],
    };

    // API endpoint.
    // this.api = '/api/v1/position';
    this.api = '/api/v1/systemusers';
    this.apiDel = '/api/v1/ledtyioo';
  }
  componentDidMount() {
    this._isMounted = true
    Http.get(`${this.api}`)
      .then((response) => {
        if (this._isMounted) {
          this.setState({
            data: response.data.sysusers,
            branch: response.data.branch,
            personnel: response.data.personnel,
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
    const subs = {
      exist: this.state.exist,
      user_details_id: this.state.user_details_id,
      branch_id: this.state.branch_id,
      first_name: this.state.first_name,
      middle_name: this.state.middle_name,
      last_name: this.state.last_name,
      role: this.state.role,
      contact_no: this.state.contact_no,
      address: this.state.address,
      email: this.state.email,
      password: this.state.password,
    }
    if (this._isMounted) {


      if (this.state.confirmpassword !== this.state.password) {
        this.setState({
          error: 'Cannot add user, Password not matched',
        });
      } else {
        this.setState({ loading: true });
        this.setState({ error: null });
        this.addSysuser(subs);
      }

    }
  };


  addSysuser = (user) => {
    this._isMounted = true
    Http.post('/api/v1/sysuadd', user)
      .then(({ data }) => {

        // const newUser = {
        //   id: data.id,
        //   email: data.email,
        //   first_name: data.first_name,
        //   last_name: data.last_name,
        // };
        // const allUsers = [newUser, ...this.state.data];
        if (this._isMounted) {

          this.setState({
            // data: allUsers,
            data: data.users,
            branch_id: null,
            first_name: null,
            middle_name: null,
            last_name: null,
            role: null,
            contact_no: null,
            address: null,
            email: null,
            confirmpassword: null,
            password: null,
            exist: null,
            user_details_id: null,
            display1: 'none',
            display2: 'none',
          });
        }
        this.sysuserFormN.reset();
        if (this._isMounted) {
          //   if(data.otherdet[0].fname){
          //     this.setState({
          //     first_name: data.otherdet[0].fname,
          //     last_name: data.otherdet[0].lname,
          //     });
          //  }
          this.setState({ loading: false });
        }
        toast("System User added successfully!")
      })
      .catch(() => {
        if (this._isMounted) {
          toast("Error adding system user!")

          this.setState({ loading: false });
        }
      });
  };


  deleteUser = (e) => {
    this._isMounted = true
    const { key } = e.target.dataset;
    const { data: user } = this.state;
    if (confirm("Confirmation to delete.")) {
      if (this._isMounted) {
        this.setState({ loading: true });
      }
      Http.delete(`${this.apiDel}/${key}`)
        .then((response) => {
          if (response.status === 204) {
            const index = user.findIndex(
              (users) => parseInt(users.id, 10) === parseInt(key, 10),
            );
            const update = [...user.slice(0, index), ...user.slice(index + 1)];
            if (this._isMounted) {
              this.setState({ data: update });
              this.setState({ loading: false });
            }
          }
          toast("System User deleted successfully!")
        })
        .catch((error) => {
          console.log(error);
          toast("Error deleting system user!")
          if (this._isMounted) {
            this.setState({ loading: false });
          }
        });
    }
  };

  formVisibility = (e) => {
    this._isMounted = true
    const { key } = e.target.dataset;
    if (this._isMounted) {
      if (key == 'existing') {
        this.setState({ display1: 'block', display2: 'none', exist: 'yes' })
      }
      else {
        this.setState({ display1: 'none', display2: 'block', exist: 'no' })
      }

    }
  };

  myChangeHandlerbranch = (e, { value }) => {
    if (this._isMounted) {
      this.setState({ branch_id: value })
    }
  };

  myChangeHandlerPerson = (e, { value }) => {
    if (this._isMounted) {
      this.setState({ user_details_id: value })
    }
  };





  handleconfirmpass = (e) => {
    this._isMounted = true
    const { value } = e.target;

    if (value !== this.state.password) {

      if (this._isMounted) {
        this.setState({
          confirmpassword: value,

        });
        toast("Password not matched!")
      }
    } else {
      if (this._isMounted) {
        this.setState({
          confirmpassword: value,
          error: null,
        });
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
      branch_id: this.state.branch_id,
      first_name: this.state.first_name,
      middle_name: this.state.middle_name,
      last_name: this.state.last_name,
      role: this.state.role,
      contact_no: this.state.contact_no,
      email: this.state.email,
      password: this.state.password,
    }

    if (this._isMounted) {


      // if (this.state.confirmpassword !== this.state.password) {
      //   toast("Password not matched!")
      // } else {
      //   if (this._isMounted) {
      //     this.setState({ loading: true });
      //   }
      //   this.updateProperty(subs);
      // }

      if (this.state.password) {
        if (this.state.confirmpassword !== this.state.password) {
          toast("Password not matched!")
        } else {
          if (this._isMounted) {
            this.setState({ loading: true });
          }
          this.updateProperty(subs);
        }

      } else {
        this.updateProperty(subs);
      }

    }
  };

  updateProperty = (property) => {
    Http.patch(`/api/v1/sysu/${this.state.upId}`, property)//last stop here no API YET
      .then(({ data }) => {

        if (this._isMounted) {
          this.setState({
            data: data.updated,
            error: false,
          });
          this.setState({ loading: false });
          if (this._isMounted) {
            this.setState({
              branch_id: null,
              first_name: null,
              middle_name: null,
              last_name: null,
              role: null,
              contact_no: null,
              address: null,
              email: null,
              password: null,
              confirmpassword: null,
              exist: null,
              user_details_id: null,
            });
          }
        }
        toast("User Updated successfully!")
        this.updateForm.reset();

      })
      .catch(() => {
        if (this._isMounted) {
          this.setState({
            loading: false
          });
        }
        toast("Error updating user!")
      });
  };

  reset = (e) => {
    this._isMounted = true
    if (this._isMounted) {
      this.setState({
        branch_id: null,
        first_name: null,
        middle_name: null,
        last_name: null,
        role: null,
        contact_no: null,
        address: null,
        email: null,
        password: null,
        exist: null,
        user_details_id: null,
      });
    }

  };
  buttonFormatter = (cell, row) => {
    const { branch, loading } = this.state;
    const branches = branch.map((brand) => ({ key: brand.id, value: brand.id, flag: brand.id, text: brand.name }));
    return (
      <div>
        <center>
          <button type="button" data-key={row.id} onClick={this.setUpId}
            class=" btn btn-secondary" data-backdrop="static" data-keyboard="false" data-toggle="modal" data-target={`#user${row.id}`}>
            {/* <i data-key={row.id} onClick={this.setUpId} class='fas icons'>&#xf304;</i> */}
            <i data-key={row.id} onClick={this.setUpId} class='fas icons'>	
&#9998;</i>
          </button>

      &nbsp;
        <button
            type="button"
            className="btn btn-secondary"
            onClick={this.deleteUser}
            data-key={row.id}
          >
            <i class='fas icons' onClick={this.deleteUser}
              data-key={row.id}>	<Icon size='small' name='trash' />	</i> 
              
            {/* <i class='fas icons' onClick={this.deleteUser}
              data-key={row.id}>&#xf1f8;</i> */}
          </button>

         &nbsp;
         {/*  */}
          <Link to={{ pathname: '/report/user/cashflow', state: { id: row.id, path: '/report/user/cashflow' } }}>
            <button
              type="button"
              className="btn btn-secondary"

              data-key={row.id}
            >
              <i class='fas icons'
                data-key={row.id}>&#x20B1;</i>
            </button>
          </Link>
        </center>


        <div class="modal" id={`user${row.id}`}    >
          <div class="modal-dialog">
            <div class="modal-content">


              <div class="modal-header">
                <h4 class="modal-title">Update user</h4>
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
                  First Name
              <input type="text"
                    id="addsysuser"
                    name="first_name"
                    onChange={this.handleChange}

                    class="form-control mb-2 mr-sm-2" defaultValue={row.first_name} />
            Middle Name
              <input type="text"
                    id="addsysuser"
                    name="middle_name"
                    onChange={this.handleChange}


                    class="form-control mb-2 mr-sm-2" defaultValue={row.middle_name} />
            Last Name
              <input type="text"
                    id="addsysuser"
                    name="last_name"
                    onChange={this.handleChange}


                    class="form-control mb-2 mr-sm-2" defaultValue={row.last_name} />

         Role
              <select
                    id="addsysuser"
                    name="role"

                    onChange={this.handleChange}

                    class="form-control mb-2 mr-sm-2" placeholder="Enter Role" >
                    <option >{row.role}</option>
                    <option value="Superadmin" >Superadmin</option>
                    <option value="Admin" >Admin</option>
                    <option value="Cashier" >Cashier</option>
                    <option value="HR" >HR</option>
                    <option value="Inventory" >Inventory</option>
                  </select>
            Contact Number
              <input type="text"
                    id="addsysuser"
                    name="contact_no"
                    onChange={this.handleChange}


                    class="form-control mb-2 mr-sm-2" defaultValue={row.contact_no} />
           Branch

              <Dropdown
                    type="select"
                    placeholder={row.branch}
                    fluid
                    search
                    selection

                    onChange={this.myChangeHandlerbranch}
                    options={branches}
                    id="addItem"
                    name="branch_id"

                  />
            Email
              <input type="email"
                    id="addsysuser"
                    name="email"
                    onChange={this.handleChange}

                    class="form-control mb-2 mr-sm-2" defaultValue={row.email} />
           Password
              <input type="text"

                    id="addsysuser"
                    name="password"
                    onChange={this.handleChange}
                    type="password"
                    class="form-control mb-2 mr-sm-2" placeholder="Enter Password" />
            Confirm Password
              <input type="text"
                    type="password"
                    id="addsysuser"
                    name="position"
                    onChange={this.handleconfirmpass}

                    class="form-control mb-2 mr-sm-2" placeholder="Enter Confirm Password" />



                  <button type="submit"
                    className={classNames('btn btn-primary mb-2', {
                      'btn-loading': loading,
                    })}>Update</button>

                </form>
              </div>


              <div class="modal-footer">
                <button type="button" onClick={this.reset} class="btn btn-danger" data-dismiss="modal">Close</button>
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
  render() {
    const { personnel, branch, data, error, loading } = this.state;
    const pill_form = {
      // textAlign: "center",
      // paddingLeft: "30%",
    };
    const inpt_style = { width: "100%", };
    const table_style = { width: "90%", };
    const form_style = { paddingLeft: "10%", };
    const label_style = { float: "left", };
    const submit_style = {// float: "right",
    };
    const up_form = {
      paddingLeft: "28%",
      width: "100%",
    };
    const up_input = {
      width: "100%",
    };
    const mid_form = { margin: "80px", };
    const visibility_exist = { display: this.state.display1 };
    const visibility_nonexist = { display: this.state.display2 };
    const inpt_style_hide = { visibility: 'hidden' };
    var space = " ";
    const branches = branch.map((brand) => ({ key: brand.id, value: brand.id, flag: brand.id, text: brand.name }));
    const persons = personnel.map((per) => ({ key: per.id, value: per.id, flag: per.id, text: per.first_name.concat(space, per.last_name) }));
    return (
      <div>
        <ToastContainer />
        {/* <center> <h3>System Users</h3> </center> */}
        {error && (
          <div className="alert alert-warning" role="alert">
            {error}
          </div>
        )}
        <br />
        <div style={pill_form}>
          <center> <button type="button" class="btn btn-primary" data-toggle="collapse" data-target="#sysu"   >Add System User</button></center>
          {/* {this.state.user_details_id}
      {this.state.exist}
      {this.state.lname}
      {this.state.fname} */}
          <div id="sysu" class="collapse" style={form_style}>
            <br />
            {/* <button style={submit_style} type="submit" className=' btn btn-primary mb-2'  
        onClick={this.formVisibility}
        data-key='existing'>Existing Personnel</button>
        &nbsp;&nbsp;
        <button style={submit_style} data-key='nonexisting' type="submit"  onClick={this.formVisibility} className=' btn btn-primary mb-2' >Non Existing Personnel</button> */}

            <br />
            <form class="form-inline"

              method="post"
              onSubmit={this.handleSubmit}
              ref={(el) => {
                this.sysuserFormN = el;
              }}
            >
              <table style={table_style}>
                <tr>
                  <td>
                    <tr>
                      <td>
                        <label style={label_style}>First Name</label>
                        <input type="text"
                          id="addsysuser"
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
                          id="addsysuser"
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
                          id="addsysuser"
                          name="last_name"
                          onChange={this.handleChange}
                          style={inpt_style}
                          required
                          class="form-control mb-2 mr-sm-2" placeholder="Enter Last Name" />
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <label style={label_style}>Role</label>
                        <select
                          id="addsysuser"
                          name="role"
                          required
                          onChange={this.handleChange}
                          style={inpt_style}
                          class="form-control mb-2 mr-sm-2" placeholder="Enter Role" >
                          <option >Select Role</option>
                          <option value="Superadmin" >Superadmin</option>
                          <option value="Admin" >Admin</option>
                          <option value="Cashier" >Cashier</option>
                          <option value="HR" >HR</option>
                          <option value="Inventory" >Inventory</option>
                        </select>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <label style={label_style}>Contact Number</label>
                        <input type="text"
                          id="addsysuser"
                          name="contact_no"
                          onChange={this.handleChange}
                          required
                          style={inpt_style}
                          class="form-control mb-2 mr-sm-2" placeholder="Enter Contact Number" />
                      </td>
                    </tr>
                  </td>
                  <td style={mid_form}></td>
                  <td>

                    <tr>
                      <td>
                        Branch
                                  </td>
                    </tr>
                    <tr>
                      <td>
                        <Dropdown
                          type="select"
                          placeholder='Select brand'
                          fluid
                          search
                          selection
                          style={inpt_style}
                          onChange={this.myChangeHandlerbranch}
                          options={branches}
                          id="addItem"
                          name="brand_id"
                          required
                        />

                      </td>
                    </tr>
                    <tr>
                      <td>
                        <label style={label_style}>Email</label>
                        <input type="email"
                          id="addsysuser"
                          name="email"
                          onChange={this.handleChange}
                          style={inpt_style}
                          class="form-control mb-2 mr-sm-2" placeholder="Enter Email" />
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <label style={label_style}>Password</label>
                        <input type="text"
                          required
                          id="addsysuser"
                          name="password"
                          type="password"
                          onChange={this.handleChange}
                          style={inpt_style}
                          class="form-control mb-2 mr-sm-2" placeholder="Enter Password" />
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <label style={label_style}>Confirm Password</label>
                        <input type="text"
                          required
                          id="addsysuser"
                          name="position"
                          type="password"
                          onChange={this.handleconfirmpass}
                          style={inpt_style}
                          class="form-control mb-2 mr-sm-2" placeholder="Enter Confirm Password" />
                      </td>
                    </tr>
                    <tr><td>
                      <label style={inpt_style_hide}>Confirm Password</label>
                      <input type="text"
                        style={inpt_style_hide}
                        class="form-control mb-2 mr-sm-2" />
                    </td></tr>

                  </td>

                </tr>
                <tr>
                  <td> </td>
                  <td ></td>
                  <td>
                    <button style={submit_style} type="submit" className={classNames('btn btn-primary mb-2', {
                      'btn-loading': loading,
                    })} >Add</button>
                  </td>
                </tr>
              </table>


            </form>
            <form class="form-inline"
              style={visibility_nonexist}
              method="post"
              onSubmit={this.handleSubmit}
              ref={(el) => {
                this.sysuserForm = el;
              }}
              style={visibility_exist}>
              <table>
                <tr>
                  <tr>
                    <td>
                      <Dropdown
                        type="select"
                        placeholder='Select Personnel'
                        fluid
                        search
                        selection
                        style={inpt_style}
                        onChange={this.myChangeHandlerPerson}
                        options={persons}
                        id="addsysuser"
                        name="user_details_id"
                        required
                      />

                    </td>
                  </tr>
                  <tr>
                    <td>
                      <label style={label_style}>Email</label>
                      <input type="email"
                        id="addsysuser"
                        name="email"
                        onChange={this.handleChange}
                        style={inpt_style}
                        class="form-control mb-2 mr-sm-2" placeholder="Enter Email" />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <label style={label_style}>Password</label>
                      <input type="text"
                        required
                        id="addsysuser"
                        name="password"
                        onChange={this.handleChange}
                        style={inpt_style}
                        class="form-control mb-2 mr-sm-2" placeholder="Enter Password" />
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <label style={label_style}>Confirm Password</label>
                      <input type="text"
                        required
                        id="addsysuser"
                        name="position"
                        onChange={this.handleconfirmpass}
                        style={inpt_style}
                        class="form-control mb-2 mr-sm-2" placeholder="Enter Confirm Password" />
                    </td>
                  </tr>



                </tr>
                <tr>

                  <td>

                    <button style={submit_style} type="submit" className={classNames('btn btn-primary mb-2', {
                      'btn-loading': loading,
                    })} >Add</button>
                  </td>
                </tr>

              </table>
            </form>
          </div>

          <br />
        </div>
        <div>

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
              <TableHeaderColumn dataField='email' tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }}  >Email</TableHeaderColumn>
              <TableHeaderColumn dataField='id' tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} dataFormat={this.nameformatter}   >Name</TableHeaderColumn>
              <TableHeaderColumn dataField='cash_on_hand' hidden width="130" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }}   >Cash On Hand</TableHeaderColumn>
              <TableHeaderColumn dataField='first_name' tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} hidden={true} >Name</TableHeaderColumn>
              <TableHeaderColumn dataField='last_name' tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} hidden={true}  >Name</TableHeaderColumn>
              <TableHeaderColumn dataField="id" width="130" dataFormat={this.buttonFormatter}>Action</TableHeaderColumn>

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

export default connect(mapStateToProps)(Sysusers);
