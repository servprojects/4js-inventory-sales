import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../../Http';
import classNames from 'classnames';
import { Dropdown } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


class Employee extends Component {
 _isMounted = false;
  constructor(props) {
    super(props);
    
    this.state = {
      loading: false,
      first_name: null,
      last_name: null,
      middle_name: null,
      contact_no: null,
      address: null,
      error: false,
      branch_id: false,
      position_id: false,
      position_name: false,
      branch_location: false,
      upId: null,
      data: [],
      branch: [],
      position: [],
    };

    
    // API endpoint.
    this.api = '/api/v1/empsfsa';
    

  }




   componentDidMount(){
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
           if(this._isMounted){
                this.setState({
                  data: response.data.employee,
                  branch: response.data.branches.data,
                  position: response.data.positions.data
                
                });
          }   
          
        }) 
       
          
  }

  
 
  

 
  myChangeHandlerBranch = (e, { value }) => {
    if(this._isMounted){
      this.setState({branch_id: value })
    }
  };
  myChangeHandlerPosition = (e, { value }) => {
    if(this._isMounted){
        this.setState({position_id: value })
     }
  };

  // myChangeHandlerCategory = (e, { value }) => this.setState({category_id: value });
  // myChangeHandlerBrand = (e, { value }) => this.setState({brand_id: value });
 
  handleChange = (e) => {
    this._isMounted = true
    const { name, value } = e.target;
if(this._isMounted){
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
      branch_id: this.state.branch_id,
      position_id: this.state.position_id
    }
if(this._isMounted){
    this.setState({ loading: true });
    }
    this.addEmp(subs);
  };
//  first_name: data.brand[0].brand,
  addEmp = (emp) => {
    this._isMounted = true
    Http.post(this.api, emp)
      .then(({ data }) => {
        const newEmp = {
          id: data.id,
          first_name: emp.first_name,
          last_name: emp.last_name,
          middle_name: emp.middle_name,
          contact_no: emp.contact_no,
          address: emp.address,
          branch_location: data.branches[0].branch_location,
          position_name: data.positions[0].position_name,
         
        };
        const allEmps = [newEmp, ...this.state.data];
if(this._isMounted){
        this.setState({ data: allEmps, first_name: null, last_name: null, middle_name: null, contact_no: null, address: null, branch_id: null, position_id: null, position_name: null, branch_location: null});
        }
        this.employeeForm.reset();
if(this._isMounted){
        this.setState({ loading: false });
      }  
      toast("Emloyee added successfully!")
      })
      .catch(() => {
if(this._isMounted){
        toast("Error adding employee!")
        
        this.setState({ loading: false });
      }
      });
  };

  deleteEmp = (e) => {
    this._isMounted = true
    const { key } = e.target.dataset;
    const { data: emp } = this.state;
if(this._isMounted){
    this.setState({ loading: true });
    }
    Http.delete(`${this.api}/${key}`)
      .then((response) => {
        if (response.status === 204) {
          const index = emp.findIndex(
            (item) => parseInt(item.id, 10) === parseInt(key, 10),
          );
          const update = [...emp.slice(0, index), ...emp.slice(index + 1)];
      if(this._isMounted){
          this.setState({ data: update });
          this.setState({ loading: false });
      }    
        }
        toast("Emloyee deleted successfully!")
      })
      .catch((error) => {
        console.log(error);
        toast("Error deleting employee!")
        if(this._isMounted){
          this.setState({ loading: false });
          }
      });
  };

  setUpId = (e) => {
    this._isMounted = true
    const { key } = e.target.dataset;
    if(this._isMounted){
      this.setState({upId: key})
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
      branch_id: this.state.branch_id,
      position_id: this.state.position_id
    }
    
    if(this._isMounted){
         
      
      if(this._isMounted){
        this.setState({ loading: true });
        }
        this.updateProperty(subs);
       
  }
};

updateProperty = (property) => {
Http.patch(`/api/v1/empsfsa/${this.state.upId}`, property)//last stop here no API YET
  .then(({ data }) => {

  if(this._isMounted){
    this.setState({
      data: data.updated,
      error: false,
    });
    this.setState({ loading: false });
    if(this._isMounted){
      this.setState({
       first_name: null, last_name: null, middle_name: null, contact_no: null, address: null, branch_id: null, position_id: null, position_name: null, branch_location: null
       });
      }
     }
     toast("User Updated successfully!")
     this.updateForm.reset();

  })
  .catch(() => {
  if(this._isMounted){
    this.setState({
      loading: false
    });
    }
    toast("Error updating user!")
  });
};

reset = (e) => {
  this._isMounted = true
    if(this._isMounted){
      this.setState({
        first_name: null, last_name: null, middle_name: null, contact_no: null, address: null, branch_id: null, position_id: null, position_name: null, branch_location: null
       });
      }
  
};
nameformatter = (cell, row) => {

  return (
    <div>
      {row.first_name}&nbsp; {row.last_name}
    </div>
  )
}
buttonFormatter = (cell, row) => {

  return (
    <div>
      <button type="button" data-key={row.id} onClick={this.setUpId}
        class=" btn btn-secondary" data-backdrop="static" data-keyboard="false" data-toggle="modal"  data-target= {`#emps${row.id}`}>
        <i data-key={row.id} onClick={this.setUpId}  class='fas icons'>&#xf304;</i>
      </button>

  &nbsp;
      <button
        type="button"
        className="btn btn-secondary"
        onClick={this.deleteEmp}
        data-key={row.id}
      >
        <i class='fas icons'    onClick={this.deleteEmp}
          data-key={row.id}>&#xf1f8;</i>
      </button>
    </div>
  )
}
  render() {
    
    // const product = products;
    const {branch, position, data, error, loading } = this.state;
    const pill_form = {
        // textAlign: "center",
        // paddingLeft: "30%",
      };
    const inpt_style = {
        width: "100%",
      };
    const table_style = {
        width: "90%",
      }; 
    const form_style = {
        paddingLeft: "10%",
      };
    const label_style = {
        float: "left",
      };
    const submit_style = {
        // float: "right",
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


    const brnd = branch.map((branch) =>  ({ key: branch.id , value: branch.id, flag: branch.id, text: branch.name })  );
    const pstn = position.map((pst) =>  ({ key: pst.id , value: pst.id, flag: pst.id, text: pst.name })  );
    
    

    return (
     
  <div>
 <ToastContainer />
   <center> <h3>Employee</h3> </center>
   <br/>
   {error && (
          <div className="alert alert-warning" role="alert">
            {error}
          </div>
        )}
  <div style={pill_form}>
        <center> <button type="button" class="btn btn-primary" data-toggle="collapse" data-target="#empl"   >Add Employee</button></center>
      {this.state.branch_id}
      {this.state.position_id}
        <div id="empl" class="collapse" style={form_style}>
                  <br/>
                  <form class="form-inline"
                          method="post"
                          onSubmit={this.handleSubmit}
                          ref={(el) => {
                            this.employeeForm = el;
                          }} 
                          >
                      <table style={table_style}>
                        <tr>
                          <td>
                                  <tr>
                                      <td>
                                          <label style={label_style}>First Name</label>
                                          <input type="text"
                                          id="addemp"
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
                                          id="addemp"
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
                                          id="addemp"
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
                                          id="addemp"
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
                                      <label style={label_style}>Address</label>
                                      <input type="text"
                                      id="addemp"
                                      name="address"
                                      onChange={this.handleChange}
                                      required
                                      style={inpt_style}
                                      class="form-control mb-2 mr-sm-2" placeholder="Enter Address" />
                                  </td>
                              </tr>
                              <tr>
                                  <td>
                                      Branch
                                  </td>
                              </tr>
                              <tr>
                                  <td>
                                  <Dropdown
                                                          type="select"
                                                          placeholder='Select branch'
                                                          fluid
                                                          search
                                                          selection
                                                          style={inpt_style}
                                                          onChange={this.myChangeHandlerBranch}
                                                          options={brnd}
                                                          id="addemp"
                                                          name="branch_id" 
                                                          required
                                                          />
                                                        
                                  </td>
                              </tr>
                              <tr>
                                  <td>
                                      Position
                                  </td>
                              </tr> 
                              <tr>
                                  <td>
                                  <Dropdown
                                                          type="select"
                                                          placeholder='Select position'
                                                          fluid
                                                          search
                                                          selection
                                                          style={inpt_style}
                                                          onChange={this.myChangeHandlerPosition}
                                                          options={pstn}
                                                          id="addemp"
                                                          name="position_id" 
                                                          required
                                                          />
                                                        
                                  </td>
                              </tr>
                             
                              <tr>
                              <td>
                                  <br/>
                                        <button style={submit_style} type="submit" className={classNames('btn btn-primary mb-2', {
                                        'btn-loading': loading,
                                    })} >Add</button>
                              </td>
                              </tr>

                            </td>
                          
                        </tr> 
                        
                      </table>
                      
                          
                  </form>
              </div>

          <br/>
        </div>
  <div>
    <br/>
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
              <TableHeaderColumn dataField='name'  tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} dataFormat={this.nameformatter} >Name</TableHeaderColumn>
              <TableHeaderColumn dataField="position_name"  width="200">Position</TableHeaderColumn>
              <TableHeaderColumn dataField="branch_location"  width="200">Address</TableHeaderColumn>
              <TableHeaderColumn dataField='first_name'  tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }}  hidden={true} >Name</TableHeaderColumn>
              <TableHeaderColumn dataField='last_name'  tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} hidden={true}  >Name</TableHeaderColumn>
              
              <TableHeaderColumn dataField="id"  width="200" dataFormat={this.buttonFormatter}>Action</TableHeaderColumn>
             
            </BootstrapTable>
          {/* <table className="table">
            
            <tbody>
              <tr>
                <th>Name</th>
                <th>Position</th>
                <th>Branch Location</th>
                <th>Action</th>
              </tr> */}
              {data.map((emps) => (
                // <tr key={emps.id}>
                //   <td>{emps.first_name} {emps.last_name}</td>
                //   <td>{emps.position_name}</td>
                //   <td>{emps.branch_location}</td>
                //   <td>
                //   <button  type="button"
                //       data-key={emps.id} onClick={this.setUpId}  class="btn btn-secondary" data-backdrop="static" data-keyboard="false" data-toggle="modal" data-target= {`#emps${emps.id}`}>
                //     Update
                //   </button>
                  <div class="modal" id={`emps${emps.id}`}    >
                    <div class="modal-dialog">
                      <div class="modal-content">
                      
                       
                        <div class="modal-header">
                          <h4 class="modal-title">Update Employee</h4>
                          <button type="button" class="close" data-dismiss="modal" onClick={this.reset}>&times;</button>
                        </div>
                        
                        
                        <div class="modal-body">
                          
                        <form  class="form-inline"
                                    method="post"
                                    onSubmit={this.handleSubmitUpdate}
                                    ref={(el) => {
                                      this.updateForm = el;
                                    }} 
                                    >
                                <table style={up_form}  class="table-borderless">
                                  <tr>
                                    <td>
                                    <label style={label_style}>First Name</label>
                                          <input type="text"
                                          id="addemp"
                                          name="first_name"
                                          onChange={this.handleChange}
                                          style={inpt_style}
                                         
                                          class="form-control mb-2 mr-sm-2" placeholder={emps.first_name} />
                                    </td>
                                  </tr>
                                 <tr>
                                    <td>
                                   <label style={label_style}>Middle Name</label>
                                          <input type="text"
                                          id="addemp"
                                          name="middle_name"
                                          onChange={this.handleChange}
                                          style={inpt_style}
                                          
                                          class="form-control mb-2 mr-sm-2" placeholder={emps.middle_name} />
                                    </td>
                                  </tr>
                                 <tr>
                                    <td>
                                   <label style={label_style}>Last Name</label>
                                          <input type="text"
                                          id="addemp"
                                          name="last_name"
                                          onChange={this.handleChange}
                                          style={inpt_style}
                                          
                                          class="form-control mb-2 mr-sm-2" placeholder={emps.last_name} />
                                    </td>
                                  </tr>
                                 <tr>
                                    <td>
                                   <label style={label_style}>Contact Number</label>
                                          <input type="text"
                                          id="addemp"
                                          name="contact_no"
                                          onChange={this.handleChange}
                                          
                                          style={inpt_style}
                                          class="form-control mb-2 mr-sm-2" placeholder={emps.contact_no} />
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>
                                   <label style={label_style}>Address</label>
                                      <input type="text"
                                      id="addemp"
                                      name="address"
                                      onChange={this.handleChange}
                                      
                                      style={inpt_style}
                                      class="form-control mb-2 mr-sm-2" placeholder={emps.address} />
                                    </td>
                                  </tr>
                                  <tr>
                                  <td>
                                      Branch
                                  </td>
                                  </tr>
                                  <tr>
                                    <td>
                                   <Dropdown
                                                          type="select"
                                                          placeholder={emps.branch}
                                                          fluid
                                                          search
                                                          selection
                                                          style={inpt_style}
                                                          onChange={this.myChangeHandlerBranch}
                                                          options={brnd}
                                                          id="addemp"
                                                          name="branch_id" 
                                                         
                                                          />
                                    </td>
                                  </tr>
                                  <tr>
                                  <td>
                                      Position
                                  </td>
                                 </tr>   
                                  <tr>
                                    <td>
                                   <Dropdown
                                                          type="select"
                                                          placeholder={emps.position_name}
                                                          fluid
                                                          search
                                                          selection
                                                          style={inpt_style}
                                                          onChange={this.myChangeHandlerPosition}
                                                          options={pstn}
                                                          id="addemp"
                                                          name="position_id" 
                                                          
                                                          />
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
                //       onClick={this.deleteEmp}
                //       data-key={emps.id}
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

export default connect(mapStateToProps)(Employee);
