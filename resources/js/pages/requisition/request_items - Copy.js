import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../Http';
import classNames from 'classnames';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Dropdown } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';

class RequestItem extends Component {
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
      upIdItem: null,
      unit_price: null,
      quantity: null,
      item_id: null,
      new_item: null,
      urgency_status: null, 
      estimated_receiving_date: null,
      type: null,
      data: [],
      reqDetails: [],
      allitems: [],
      reqitems: [],
      reqnewitems: [],
    };

    // API endpoint.
    this.api = '/api/v1/requestitems';
  }
  componentDidMount() {
      this._isMounted = true
      const subs = {
        id: this.props.location.state.reqId
      }
    Http.post(`/api/v1/requestindex`, subs)
      .then((response) => {
        // const { data } = response.data;
      if(this._isMounted){
        this.setState({
          reqDetails: response.data.requests,
          allitems: response.data.items,
          reqitems: response.data.reqitems,
          reqnewitems: response.data.reqnewitems,
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
    const { name, value } = e.target;
 if(this._isMounted){
    this.setState({ [name]: value });
    }
  };
// existing item
  handleSubmit = (e) => {
    this._isMounted = true
    e.preventDefault();
    const subs = {
      new_item: this.state.new_item,
      item_id: this.state.item_id,
      unit_price: this.state.unit_price,
      quantity: this.state.quantity,
      requisition_id: this.props.location.state.reqId
    }
    if(this._isMounted){
    this.setState({ loading: true });
    }
    this.addReqItem(subs);
  };

  addReqItem = (property) => {
    this._isMounted = true
    Http.post(this.api, property)
      .then(({ data }) => {
        
        if(this._isMounted){
         this.setState({ reqitems: data.updated, unit_price: null,quantity: null, item_id: null, new_item: null,});
        }
        this.addForm.reset();
        if(this._isMounted){
        this.setState({ loading: false });
        }
        toast("Item added successfully!")
      })
      .catch((error) => {
        console.log(error);
       toast("Error adding item!")
       if(this._isMounted){
        this.setState({ loading: false });
        }
      });
  };
// end existing item
// new item
handleSubmitNew = (e) => {
  this._isMounted = true
  e.preventDefault();
  const subs = {
    new_item: this.state.new_item,
    unit_price: this.state.unit_price,
    quantity: this.state.quantity,
    requisition_id: this.props.location.state.reqId
  }
  if(this._isMounted){
  this.setState({ loading: true });
  }
  this.addReqItemNew(subs);
};

addReqItemNew = (property) => {
  this._isMounted = true
  Http.post('/api/v1/reqnew', property)
    .then(({ data }) => {
      
      if(this._isMounted){
       this.setState({ reqnewitems: data.updated, unit_price: null,quantity: null, item_id: null, new_item: null,});
      }
      this.addForm.reset();
      if(this._isMounted){
      this.setState({ loading: false });
      }
      toast("Item added successfully!")
    })
    .catch((error) => {
      console.log(error);
     toast("Error adding item!")
     if(this._isMounted){
      this.setState({ loading: false });
      }
    });
};
// end new item

  deleteItem = (e) => {
    this._isMounted = true
    const { key, keyreq } = e.target.dataset;
    const { reqitems: itm } = this.state;
if(this._isMounted){
    this.setState({ loading: true });
    }
    Http.delete(`${this.api}/${key}?requisition_id=${keyreq}`)
      .then((response) => {
        if (response.status === 204) {
          const index = itm.findIndex(
            (brand) => parseInt(brand.id, 10) === parseInt(key, 10),
          );
          const update = [...itm.slice(0, index), ...itm.slice(index + 1)];
      if(this._isMounted){
          this.setState({ reqitems: update });
          // this.setState({ reqitems: data.updated});
          this.setState({ loading: false });
          }
        }
        toast("Brand deleted successfully!")
      })
      .catch((error) => {
        console.log(error);
        toast("Error deleting brand!")
      });
  };

// update request details
  
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
    urgency_status: this.state.urgency_status,
    estimated_receiving_date: this.state.estimated_receiving_date,
    type: this.state.type
  }
if(this._isMounted){
  this.setState({ loading: true });
  }
  this.updateProperty(subs);
};

updateProperty = (property) => {
  Http.patch(`/api/v1/request/${this.state.upId}`, property)//last stop here no API YET
    .then(({ data }) => {

    if(this._isMounted){
      this.setState({
        reqDetails: data.updated,
        error: false,
      });
      this.setState({ loading: false });
       }
       toast("Request Updated successfully!")
       this.updateForm.reset();
    })
    .catch(() => {
    if(this._isMounted){
      this.setState({
        loading: false
      });
      }
      toast("Error updating request!")
    });
};





      // update item 
      setUpIdItem = (e) => {
        this._isMounted = true
        const { key } = e.target.dataset;
        if(this._isMounted){
          this.setState({upIdItem: key})
        }
      };

      handleSubmitUpdateItem = (e) => {
      this._isMounted = true
      e.preventDefault();
      const subs = {
        unit_price: this.state.unit_price,
        quantity: this.state.quantity,
        requisition_id: this.props.location.state.reqId
      }
      if(this._isMounted){
      this.setState({ loading: true });
      }
      this.updatePropertyItem(subs);
      };

    updatePropertyItem = (property) => {
    Http.patch(`/api/v1/requestitems/${this.state.upIdItem}`, property)//last stop here no API YET
      .then(({ data }) => {

      if(this._isMounted){
      
        this.setState({
          reqitems: data.updated,
          error: false,
        });
              
        this.setState({ loading: false });
        }
        toast("Request Item Updated successfully!")
        this.updateForm1.reset();
      })
      .catch(() => {
      if(this._isMounted){
        this.setState({
          loading: false
        });
        }
        toast("Error updating request item!")
      });
    };

// handleSubmitUpdateNewItem

reset = (e) => {
  this._isMounted = true
    if(this._isMounted){
      this.setState({ urgency_status: null,  estimated_receiving_date: null, type: null,});
      }
  
};

myChangeHandlerItem = (e, { value }) => {
  if(this._isMounted){
    this.setState({item_id: value })
  }
};

  render() {
    const {reqnewitems, reqitems, allitems, reqDetails, data, error, loading } = this.state;
    const pill_form = {textAlign: "center",paddingLeft: "30%",};
    const up_form = {paddingLeft: "28%", width: "100%",};
    const up_input = { width: "100%", };
    const req_tab = {width: "100%", };
    const req_list = {width: "80%", float: "right"};
    const req_inpt = {width: "100%", };
    const addBtn = {float: "right", };
    const label = {float: "left", };
    const det_cont = {paddingLeft: "30px", };

    const itms = allitems.map((items) =>  ({ key: items.id , value: items.id,  text: items.name })  );
    return (
<div className="content">
<ToastContainer />
<table  style={req_tab}>
        <tr>
        <td>
           {this.props.location.state.reqId}
           {this.state.item_id}
           {this.state.new_item}
           {this.state.upIdItem}
                
           {reqDetails.map((request) => ( <center>  <h3>Request Details</h3> <br/>{request.code}</center>))}
                    
                    <hr/>
        <div style={req_inpt}>
            {/* {reqDetails.map((request) => (    */}
            
             {/* ))} */}
             {reqDetails.map((request) => ( <tr><td><b>Urgency</b></td> <td style={det_cont}>{request.urgency_status}</td></tr>))}
             {reqDetails.map((request) => ( <tr><td><b>Estimated Receiving Date</b></td> <td style={det_cont}>{request.estimated_receiving_date}</td></tr>))}
             {reqDetails.map((request) => ( <tr><td><b>Request Type</b></td> <td style={det_cont}>{request.type}</td></tr>))}
             {reqDetails.map((request) => ( <tr><td><b>Name of Requestor</b></td> <td style={det_cont}>{request.first_name}  {request.last_name}</td></tr>))}
             {reqDetails.map((request) => ( <tr><td><b>Position</b></td> <td style={det_cont}>{request.position}</td></tr>))}
             {reqDetails.map((request) => ( <tr><td><b>Branch</b></td> <td style={det_cont}>{request.branch}</td></tr>))}
             {reqDetails.map((request) => (
            <tr style={addBtn}  ><td>
              
                  <button  type="button"
                      data-key={request.id} onClick={this.setUpId}  class="btn btn-primary" data-backdrop="static" data-keyboard="false" data-toggle="modal" data-target= {`#request${request.id}`}>
                    Update
                  </button>
                  <div class="modal" id={`request${request.id}`}    >
                    <div class="modal-dialog">
                      <div class="modal-content">
                      
                       
                        <div class="modal-header">
                          <h4 class="modal-title">Update request</h4>
                          <button type="button" class="close" onClick={this.reset} data-dismiss="modal">&times;</button>
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
                                    <label style={label}>Urgency</label><br/>
                                                <select id="addRequest"  onChange={this.handleChange} style={req_inpt} name="urgency_status" class="form-control mb-2 mr-sm-2">
                                                    <option>Urgency Status</option>
                                                    <option value="Urgent">Urgent</option>
                                                    <option value="Noturgent">Not Urgent</option>
                                                </select>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>
                                    <label style={label}>Estimated Receiving Date</label><br/>
                                                <input id="addRequest" type="date" placeholder={request.estimated_receiving_date} name="estimated_receiving_date" class="form-control mb-2 mr-sm-2"  style={req_inpt}  onChange={this.handleChange}/>
                                                
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>
                                    <label style={label}>Request Type</label><br/>
                                                <select id="addRequest"  onChange={this.handleChange} style={req_inpt} name="type" class="form-control mb-2 mr-sm-2">
                                                    <option>Request Type</option>
                                                    <option value="Purchase">Purchase</option>
                                                    <option value="Transfer">Transfer</option>
                                                </select>      
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
            </td></tr>
                  ))}
        </div>
        <br/>
        <br/>
           <hr/>
            
               
                <div >
                <center>  <h3>Add New Item</h3> </center>
                   <br/>
                   <ul class="nav nav-tabs" role="tablist">
                      <li class="nav-item">
                        <a class="nav-link active" data-toggle="tab" href="#item">Existing Item</a>
                      </li>
                      <li class="nav-item">
                        <a class="nav-link" data-toggle="tab" href="#itemcat">New Item</a>
                      </li> 
                      
                  </ul>
                  <div class="tab-content">

                    <div id="item" class="container tab-pane active"><br/>
                    <form class="form-inline"
                                    method="post"
                                    onSubmit={this.handleSubmit}
                                    ref={(el) => {
                                    this.addForm = el;
                                    }} 
                                    >
                                <table style={req_tab}>
                                   
                                    <tr>
                                        <td>
                                            <center>
                                                <label style={label}>Item</label><br/>
                                                <Dropdown
                                                  type="select"
                                                  placeholder='Select item'
                                                  fluid
                                                  search
                                                  selection
                                                  style={req_inpt}
                                                  onChange={this.myChangeHandlerItem}
                                                  options={itms}
                                                  id="addItem"
                                                  name="brand_id" 
                                                  required
                                                  />
                                                
                                            </center>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <center>
                                                <label style={label}>Unit Price</label><br/>
                                                <input id="addRequest" type="number" step="0.001" name="unit_price" class="form-control mb-2 mr-sm-2"  style={req_inpt}  onChange={this.handleChange}/>
                                                
                                            </center>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <center>
                                                <label style={label}>Quantity</label><br/>
                                                <input id="addRequest" type="number" name="quantity" class="form-control mb-2 mr-sm-2"  style={req_inpt}  onChange={this.handleChange}/>
                                                
                                                
                                            </center>
                                        </td>
                                    </tr>
                                    
                                    <tr>
                                        <td >
                                        {/* <button type="submit" style={addBtn} className={classNames('btn btn-primary mb-2')} >Add</button> */}
                                        
                                        <button type="submit" style={addBtn} className={classNames('btn btn-primary mb-2', {
                                        'btn-loading': loading,
                                        })} >Add</button>
                                        </td>
                                    </tr>
                                </table>
                            </form>
                    </div>

                  <div id="itemcat" class="container tab-pane fade"><br/>
                  <form class="form-inline"
                                  method="post"
                                  onSubmit={this.handleSubmitNew}
                                  ref={(el) => {
                                  this.addForm = el;
                                  }} 
                                  >
                              <table style={req_tab}>
                                  <tr>
                                      <td>
                                          <center>
                                              <label style={label}>Item</label><br/>
                                              <input id="addRequest" type="text"  name="new_item" class="form-control mb-2 mr-sm-2"  style={req_inpt}  onChange={this.handleChange}/>
                                              
                                              
                                          </center>
                                      </td>
                                  </tr>
                                  <tr>
                                      <td>
                                          <center>
                                              <label style={label}>Unit Price</label><br/>
                                              <input id="addRequest" type="number" step="0.001" name="unit_price" class="form-control mb-2 mr-sm-2"  style={req_inpt}  onChange={this.handleChange}/>
                                              
                                          </center>
                                      </td>
                                  </tr>
                                  <tr>
                                      <td>
                                          <center>
                                              <label style={label}>Quantity</label><br/>
                                              <input id="addRequest" type="number" name="quantity" class="form-control mb-2 mr-sm-2"  style={req_inpt}  onChange={this.handleChange}/>
                                              
                                              
                                          </center>
                                      </td>
                                  </tr>
                                  
                                  <tr>
                                      <td >
                                      {/* <button type="submit" style={addBtn} className={classNames('btn btn-primary mb-2')} >Add</button> */}
                                      
                                      <button type="submit" style={addBtn} className={classNames('btn btn-primary mb-2', {
                                      'btn-loading': loading,
                                      })} >Add</button>
                                      </td>
                                  </tr>
                              </table>
                          </form>
                  </div>
                  
                    
                  </div>
                           
                            
                </div>
                <br/>
                <br/>
                <br/>
            </td>
           
            <td>
        <div style={req_list}>      
            <ul class="nav nav-tabs" role="tablist">
                <li class="nav-item">
                  <a class="nav-link active" data-toggle="tab" href="#exe">Existing Items</a>
                </li>
                <li class="nav-item">
                  <a class="nav-link" data-toggle="tab" href="#new">New Items</a>
                </li> 
                
            </ul>
            <div class="tab-content">

              <div id="exe" class="container tab-pane active"><br/>
            
              

              {/* Start Existing items */}
                
                      
                            
                        
                       
                        <div>
                            {error && (
                                <div className="alert alert-warning" role="alert">
                                    {error}
                                </div>
                                )}
                            <br/>
                            <div className="todos">
                                <table className="table ">
                                    <tbody>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Unit Price</th>
                                        <th>Quantity</th>
                                        <th>Total</th>
                                        <th>Action</th>
                                    </tr>
                                    {reqitems.map((itemex) => (
                                        <tr key={itemex.id}>
                                        <td>{itemex.id}</td>
                                        <td>{itemex.item}</td>
                                        <td>{itemex.unit_price}</td>
                                        <td>{itemex.quantity}</td>
                                        <td>{itemex.unit_price*itemex.quantity}</td>
                                        <td>
                                        <button  type="button"
                                            data-key={itemex.id} onClick={this.setUpIdItem}  class="btn btn-secondary" data-backdrop="static" data-keyboard="false" data-toggle="modal" data-target= {`#itemex${itemex.id}`}>
                                            Update
                                        </button>
                                        <div class="modal" id={`itemex${itemex.id}`}    >
                                            <div class="modal-dialog">
                                            <div class="modal-content">
                                            
                                            
                                                <div class="modal-header">
                                                <h4 class="modal-title">Update Item</h4>
                                                <button type="button" class="close" data-dismiss="modal" onClick={this.reset}>&times;</button>
                                                </div>
                                                
                                                
                                                <div class="modal-body">
                                                
                                                <form  class="form-inline"
                                                            method="post"
                                                            onSubmit={this.handleSubmitUpdateItem}
                                                            ref={(el) => {
                                                            this.updateForm1 = el;
                                                            }} 
                                                            >
                                                        <table style={up_form}  class="table-borderless">
                                                        
                                                         <tr>
                                                            <td>
                                                            <label style={label}>Unit Price</label><br/>
                                                            <input id="addRequest" type="number" step="0.001" placeholder={itemex.unit_price} name="unit_price" class="form-control mb-2 mr-sm-2"  style={req_inpt}  onChange={this.handleChange}/>
                                                
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                            <label style={label}>Quantity</label><br/>
                                                            <input id="addRequest" type="number" name="quantity" placeholder={itemex.quantity} class="form-control mb-2 mr-sm-2"  style={req_inpt}  onChange={this.handleChange}/>
                                                
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
                                            onClick={this.deleteItem}
                                            data-key={itemex.id}
                                            data-keyreq={itemex.requisition_id}
                                          >
                                          Delete
                                          </button>
                                        </td>
                                        </tr> 
                                    ))}
                                    </tbody>
                                </table>
                                </div>
                        </div>
                    
                  {/* End Existing Item */}
                  </div>

              <div id="new" class="container tab-pane fade"><br/>
                  {/* Start New items */}
                
                      
                            
                        
                       
                        <div>
                            {error && (
                                <div className="alert alert-warning" role="alert">
                                    {error}
                                </div>
                                )}
                            <br/>
                            <div className="todos">
                                <table className="table ">
                                    <tbody>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Unit Price</th>
                                        <th>Quantity</th>
                                        <th>Total</th>
                                        <th>Action</th>
                                    </tr>
                                    {reqnewitems.map((items) => (
                                        <tr key={items.id}>
                                        <td>{items.id}</td>
                                        <td>{items.new_item}</td>
                                        <td>{items.unit_price}</td>
                                        <td>{items.quantity}</td>
                                        <td>{items.unit_price*items.quantity}</td>
                                        <td>
                                        <button  type="button"
                                            data-key={items.id} onClick={this.setUpIdItem}  class="btn btn-secondary" data-backdrop="static" data-keyboard="false" data-toggle="modal" data-target= {`#new${items.id}`}>
                                            Update
                                        </button>
                                        <div class="modal" id={`new${items.id}`}    >
                                            <div class="modal-dialog">
                                            <div class="modal-content">
                                            
                                            
                                                <div class="modal-header">
                                                <h4 class="modal-title">Update Item</h4>
                                                <button type="button" class="close" data-dismiss="modal" onClick={this.reset}>&times;</button>
                                                </div>
                                                
                                                
                                                <div class="modal-body">
                                                
                                                <form  class="form-inline"
                                                            method="post"
                                                            onSubmit={this.handleSubmitUpdateItem}
                                                            ref={(el) => {
                                                            this.updateForm = el;
                                                            }} 
                                                            >
                                                        <table style={up_form}  class="table-borderless">
                                                        
                                                         <tr>
                                                            <td>
                                                            <label style={label}>Item</label><br/>
                                                            <input id="addRequest" type="text"  name="new_item" class="form-control mb-2 mr-sm-2"  placeholder={items.new_item}  style={req_inpt}  onChange={this.handleChange}/>
                                                
                                                            </td>
                                                        </tr>
                                                         <tr>
                                                            <td>
                                                            <label style={label}>Unit Price</label><br/>
                                                            <input id="addRequest" type="number" step="0.001" placeholder={items.unit_price} name="unit_price" class="form-control mb-2 mr-sm-2"  style={req_inpt}  onChange={this.handleChange}/>
                                                
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td>
                                                            <label style={label}>Quantity</label><br/>
                                                            <input id="addRequest" type="number" name="quantity" placeholder={items.quantity} class="form-control mb-2 mr-sm-2"  style={req_inpt}  onChange={this.handleChange}/>
                                                
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
                                            onClick={this.deleteItem}
                                            data-key={items.id}
                                            data-keyreq={items.requisition_id}
                                          >
                                          Delete
                                          </button>
                                        </td>
                                        </tr> 
                                    ))}
                                    </tbody>
                                </table>
                                </div>
                        </div>
                    
                  {/* End New Item */}
              </div>


            </div>
          </div>
        </td>
        
    </tr>
</table>
          {/* {this.props.match.params.reqID} */}
          {/* {this.props.location.state.reqId} */}
  </div>      
    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: state.Auth.isAuthenticated,
  user: state.Auth.user,
});

export default connect(mapStateToProps)(RequestItem);
