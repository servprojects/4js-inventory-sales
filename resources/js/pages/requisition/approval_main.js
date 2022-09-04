import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../Http';
import classNames from 'classnames';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';
import {BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table'; 

class ApprovalRequests extends Component {
      _isMounted = false;
  constructor(props) {
    super(props);

    // Initial state.
    this.state = {
      loading: false,
      urgency_status: null, 
      estimated_receiving_date: null,
      type: null,
      error: false,
      upId: null,
      data: [],
    };

    // API endpoint.
    this.api = '/api/v1/approval/requests';
  }
  componentDidMount() {
      this._isMounted = true
    Http.get(`${this.api}`)
      .then((response) => {
        const { data } = response.data.requests;
      if(this._isMounted){
        this.setState({
          data: response.data.requests,
          error: false,
        });
         }
      })
      
      .catch(() => {
 if(this._isMounted){
        this.setState({
          error: 'Unable to fetch data.',
        });
      }  
      });
  }

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
          urgency_status: this.state.urgency_status,
          estimated_receiving_date: this.state.estimated_receiving_date,
          type: this.state.type
        }
    if(this._isMounted){
        this.setState({ loading: true });
        }
        this.addRequest(subs);
      };
    
      addRequest = (request) => {
    this._isMounted = true
        Http.post(this.api, request)
          .then(({ data }) => {
            const newItem = {
              id: data.id,
              code: data.code,
              urgency_status: request.urgency_status,
              estimated_receiving_date: request.estimated_receiving_date,
              type: request.type,
              request_status: data.status,
            };
            const allRequest = [newItem, ...this.state.data];
            if(this._isMounted){
            this.setState({ data: allRequest, urgency_status: null, estimated_receiving_date: null, type: null });
            }
            this.addForm.reset();
            if(this._isMounted){
               this.setState({ loading: false });
            }
            toast("Request Added successfully!")
          })
          .catch(() => {
             if(this._isMounted){
               
                toast("Error adding request!")
                this.setState({ loading: false });
              }
          });
      };

//   handleChange = (e) => {
//     const { name, value } = e.target;
//  if(this._isMounted){
//     this.setState({ [name]: value });
//     }
//   };

//   handleSubmit = (e) => {
//     e.preventDefault();
//     const subs = {
//         urgency_status: this.state.urgency_status,
//         estimated_receiving_date: this.state.estimated_receiving_date,
//         type: this.state.type
//       }
//  if(this._isMounted){
//     this.setState({ loading: true });
//     }
//     this.addProperty(subs);
//   };

//   addProperty = (property) => {
//     this._isMounted = true
//     Http.post('/api/v1/requestadd', { property })
//       .then(({ data }) => {
//         const newItem = {
//           id: data.id,
//           urgency_status: property.urgency_status,
//           estimated_receiving_date: property.estimated_receiving_date,
//           type: property.type,
//         };
//         const allProperty = [newItem, ...this.state.data];
//         if(this._isMounted){
//             this.setState({ data: allProperty,urgency_status: null, estimated_receiving_date: null, type: null, });
//         }
//         this.addForm.reset();
//         if(this._isMounted){
//             this.setState({ loading: false });
//         }
//            toast("Request added successfully!")
//       })
//       .catch((error) => {
//         console.log(error);
//         if(this._isMounted){
//        toast("Error adding request!")
//         }
//         this.setState({ loading: false });
//       });
//   };

//   deleteBrand = (e) => {
//     this._isMounted = true
//     const { key } = e.target.dataset;
//     const { data: brd } = this.state;
// if(this._isMounted){
//     this.setState({ loading: true });
//     }
//     Http.delete(`${this.api}/${key}`)
//       .then((response) => {
//         if (response.status === 204) {
//           const index = brd.findIndex(
//             (brand) => parseInt(brand.id, 10) === parseInt(key, 10),
//           );
//           const update = [...brd.slice(0, index), ...brd.slice(index + 1)];
// if(this._isMounted){
//           this.setState({ data: update });
//           this.setState({ loading: false });
//           }
//         }
//         toast("Brand deleted successfully!")
//       })
//       .catch((error) => {
//         console.log(error);
//         toast("Error deleting brand!")
//       });
//   };


  
// setUpId = (e) => {
//     this._isMounted = true
//     const { key } = e.target.dataset;
//     if(this._isMounted){
//       this.setState({upId: key})
//     }
// };

// handleSubmitUpdate = (e) => {
//   this._isMounted = true
//   e.preventDefault();
//   const subs = {
//     name: this.state.name
//   }
// if(this._isMounted){
//   this.setState({ loading: true });
//   }
//   this.updateProperty(subs);
// };

// updateProperty = (property) => {
//   Http.patch(`${this.api}/${this.state.upId}`, property)//last stop here no API YET
//     .then(({ data }) => {

//     if(this._isMounted){
//       this.setState({
//         data: data.updated.data,
//         error: false,
//       });
//       this.setState({ loading: false });
//        }
//        toast("Brand Updated successfully!")
//        this.updateForm.reset();
//     })
//     .catch(() => {
//     if(this._isMounted){
//       this.setState({
//         loading: false
//       });
//       }
//       toast("Error updating brand!")
//     });
// };

// reset = (e) => {
//   this._isMounted = true
//     if(this._isMounted){
//       this.setState({name: null});
//       }
  
// };
 buttonFormatter(cell, row){
  return '<BootstrapButton type="submit"></BootstrapButton>';
}
handleExportCSVButtonClick = (onClick) => {
  // Custom your onClick event here,
  // it's not necessary to implement this function if you have no any process before onClick
  console.log('This is my custom function for ExportCSVButton click event');
  onClick();
}
createCustomExportCSVButton = (onClick) => {
  return (
    <ExportCSVButton
      btnText='Down CSV'
      onClick={ () => this.handleExportCSVButtonClick(onClick) }/>
  );
}
 buttonFormatter = (cell, row) => {
 return( <Link to={{ pathname: `/approvalitems/${row.type}`, state:{reqId: row.id} }}>
  <button
  type="button"
  className="btn btn-primary"
  data-key={row.id}
  >
  View
  </button>
</Link>)
  // return '<Link to=\'{{ pathname: /approvalitems, state:{reqId: '+row.id+'} }}\'> <button type="button" class=\'btn btn-secondary \' > View  </button></Link>';
  // return '<Link to=\'{{ pathname: /approvalitems, state:{reqId: '+row.id+'} }}\'> <button type="button" class=\'btn btn-secondary \' > View  </button></Link>';
}

  render() {
      const { data, error, loading } = this.state;
      const pill_form = {textAlign: "center",paddingLeft: "30%",};
      const up_form = { paddingLeft: "28%", width: "100%", };
      const up_input = {width: "100%",  };
      const req_tab = {width: "100%", };
      const req_list = {width: "80%", float: "right"};
      const req_inpt = {width: "100%", };
      const addBtn = {float: "right", };
      const label = {float: "left", };
    
      const products = [{
        id: 1,
        name: "Product1",
        price: 120
    }, {
        id: 2,
        name: "Product2",
        price: 80
    }];

    const options = {
      exportCSVBtn: this.createCustomExportCSVButton
    };
return (
<div  className="content">
<ToastContainer />
    {/* {this.state.urgency_status}
    {this.state.estimated_receiving_date}
    {this.state.type} */}
     <center> <h3>Requests </h3> </center>
     <BootstrapTable
          ref='table'
          data={ data }
          pagination={ true }
          search={ true }
          options={options} exportCSV
          >
          <TableHeaderColumn dataField='code' isKey={ true }>Code</TableHeaderColumn>
          <TableHeaderColumn dataField='branch'>Branch</TableHeaderColumn>
          <TableHeaderColumn dataField='type'>Type</TableHeaderColumn>
          <TableHeaderColumn dataField='request_status'>Status</TableHeaderColumn>
          <TableHeaderColumn dataField="id" dataFormat={this.buttonFormatter}>Buttons</TableHeaderColumn>
        </BootstrapTable>

    {/* <table  style={req_tab}>
        <tr>
          
           
            <td>
                <div >
                        <center> <h3>Requests </h3> </center>
                            
                        
                       
                        <div>
                            {error && (
                                <div className="alert alert-warning" role="alert">
                                    {error}
                                </div>
                                )}
                            <br/>
                            <div className="todos">
                                <table className="table table-striped">
                                    <tbody>
                                    <tr>
                                        <th>Code</th>
                                        <th>Branch</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr> */}
                                    {/* {data.map((request) => (
                                        <tr key={request.id}>
                                        <td>{request.code}</td>
                                        <td>{request.branch}</td>
                                        <td>{request.request_status}</td>
                                        <td> */}
                                        {/* <button  type="button"
                                            data-key={brand.id} onClick={this.setUpId}  class="btn btn-secondary" data-backdrop="static" data-keyboard="false" data-toggle="modal" data-target= {`#brand${brand.id}`}>
                                            Update
                                        </button>
                                        <div class="modal" id={`brand${brand.id}`}    >
                                            <div class="modal-dialog">
                                            <div class="modal-content">
                                            
                                            
                                                <div class="modal-header">
                                                <h4 class="modal-title">Update Brand</h4>
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
                                                            Name<br/>
                                                            <input type="text"
                                                            id="upBrand"
                                                            name="name"
                                                            onChange={this.handleChange}
                                                            style={up_input}
                                                            class="form-control mb-2 mr-sm-2" placeholder={brand.name} />
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
                                        &nbsp; */}
                                         {/* <Link to="/requestitems/{request.id}"> */}
                                         {/* <Link to={{ pathname: '/approvalitems', state:{reqId: request.id} }}>
                                            <button
                                            type="button"
                                            className="btn btn-secondary"
                                            data-key={request.id}
                                            >
                                            View
                                            </button>
                                        </Link>
                                        </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                                </div>
                        </div>
                    </div>
            </td>
            
        </tr>
    </table> */}
</div>
    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: state.Auth.isAuthenticated,
  user: state.Auth.user,
});

export default connect(mapStateToProps)(ApprovalRequests);
