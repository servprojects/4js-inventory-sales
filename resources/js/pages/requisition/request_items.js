import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../Http';
import classNames from 'classnames';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Dropdown } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import PrintComponents from "react-print-components";
import { Link } from 'react-router-dom';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';

class RequestItem extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);

    // Initial state.
    this.state = {
      timeout: 0,
      loading: false,
      loadingitm: false,
      brand: null,
      name: null,
      error: false,
      upId: null,
      upIdItem: null,
      unit_price: null,
      quantity: null,
      item_id: null,
      new_item: null,
      unit_name: null,
      urgency_status: null,
      estimated_receiving_date: null,
      type: null,
      size: null,
      status: null,
      disable: null,
      disableApp: null,
      branch_id: null,
      data: [],
      reqDetails: [],
      allitems: [],
      reqitems: [],
      reqnewitems: [],
      units: [],
      reqTo: [],
      branch: [],
      options: [],
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
        if (this._isMounted) {
          this.setState({
            reqDetails: response.data.requests,
            allitems: response.data.items,
            reqitems: response.data.reqitems,
            reqnewitems: response.data.reqnewitems,
            reqTo: response.data.reqTo,
            units: response.data.units.data,
            branch: response.data.branch.data,
            error: false,
          });
          if (response.data.requests[0].request_status == "Completed" || response.data.requests[0].request_status == "Partially Received" || response.data.requests[0].request_status == "Approved") {
            this.setState({
              disable: { display: 'none' },
              disableApp: { display: 'none' },
            });
          } else if (response.data.requests[0].request_status == "Pending") {
            this.setState({

              disableApp: { display: 'none' },
            });
          }
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

  sendforapp = (e) => {
    this._isMounted = true
    const { reqnewitems, reqitems } = this.state;
    const subs = {
      id: this.props.location.state.reqId
    }

    //  if(reqitems === undefined || reqitems.length == 0 || reqnewitems === undefined || reqnewitems.length == 0 ){ 
    //         toast("Request is empty")
    //       }else{
    Http.post(`/api/v1/sendforapp`, subs)
      .then((response) => {
        // const { data } = response.data;
        if (this._isMounted) {
          this.setState({
            reqDetails: response.data.requests,
            disableApp: { display: 'none' },
          });
          toast("Request successfully sent for approval!")
        }
      })

      .catch(() => {
        if (this._isMounted) {
          this.setState({
            error: 'Unable to fetch data.',
          });
        }
        toast("Failed to sent request for approval!")
      });
    //  }

  }


  handleChange = (e) => {
    const { name, value } = e.target;
    if (this._isMounted) {
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
    if (this._isMounted) {
      this.setState({ loading: true });
    }
    this.addReqItem(subs);
  };

  addReqItem = (property) => {
    this._isMounted = true
    Http.post(this.api, property)
      .then(({ data }) => {

        if (this._isMounted) {
          this.setState({ reqitems: data.updated, unit_price: null, quantity: null, item_id: null, new_item: null, });
        }
        this.addForm.reset();
        if (this._isMounted) {
          this.setState({ loading: false });
        }
        toast("Item added successfully!")
      })
      .catch((error) => {
        console.log(error);
        toast("Error adding item!")
        if (this._isMounted) {
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
      requisition_id: this.props.location.state.reqId,
      unit: this.state.unit_name,
      size: this.state.size,
    }
    if (this._isMounted) {
      this.setState({ loading: true });
    }
    this.addReqItemNew(subs);
  };

  addReqItemNew = (property) => {
    this._isMounted = true
    Http.post('/api/v1/reqnew', property)
      .then(({ data }) => {

        if (this._isMounted) {
          this.setState({ reqnewitems: data.updated, unit_price: null, quantity: null, item_id: null, new_item: null, unit: null, size: null, });
        }
        this.addForm.reset();
        if (this._isMounted) {
          this.setState({ loading: false });
        }
        toast("Item added successfully!")
      })
      .catch((error) => {
        console.log(error);
        toast("Error adding item!")
        if (this._isMounted) {
          this.setState({ loading: false });
        }
      });
  };
  // end new item

  deleteItem = (e) => {
    this._isMounted = true
    const { key, keyreq } = e.target.dataset;
    const { reqitems: itm } = this.state;

    if (confirm("Are you sure you want to delete this item?")) {


      if (this._isMounted) {
        this.setState({ loading: true });
      }
      Http.delete(`${this.api}/${key}?requisition_id=${keyreq}`)
        .then((response) => {
          if (response.status === 204) {
            const index = itm.findIndex(
              (brand) => parseInt(brand.id, 10) === parseInt(key, 10),
            );
            const update = [...itm.slice(0, index), ...itm.slice(index + 1)];
            if (this._isMounted) {
              this.setState({ reqitems: update });
              // this.setState({ reqitems: data.updated});
              this.setState({ loading: false });
            }
          }
          toast("Item deleted successfully!")
        })
        .catch((error) => {
          console.log(error);
          toast("Error deleting item!")
        });
    }

  };

  deleteItemnew = (e) => {
    this._isMounted = true
    const { key, keyreq } = e.target.dataset;
    const { reqnewitems: itm } = this.state;
    if (confirm("Are you sure you want to delete this item?")) {

      if (this._isMounted) {
        this.setState({ loading: true });
      }
      Http.delete(`${this.api}/${key}?requisition_id=${keyreq}`)
        .then((response) => {
          if (response.status === 204) {
            const index = itm.findIndex(
              (brand) => parseInt(brand.id, 10) === parseInt(key, 10),
            );
            const update = [...itm.slice(0, index), ...itm.slice(index + 1)];
            if (this._isMounted) {
              this.setState({ reqnewitems: update });
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

    }

  };

  // update request details

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
      urgency_status: this.state.urgency_status,
      estimated_receiving_date: this.state.estimated_receiving_date,
      type: this.state.type,
      request_to: this.state.branch_id
    }
    if (this._isMounted) {
      this.setState({ loading: true });
    }
    this.updateProperty(subs);
  };

  updateProperty = (property) => {
    Http.patch(`/api/v1/request/${this.state.upId}`, property)//last stop here no API YET
      .then(({ data }) => {

        if (this._isMounted) {
          this.setState({
            reqDetails: data.updated,
            reqTo: data.reqTo,
            error: false,
          });
          this.setState({ loading: false });
        }
        toast("Request Updated successfully!")
        this.updateForm.reset();
      })
      .catch(() => {
        if (this._isMounted) {
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
    if (this._isMounted) {
      this.setState({ upIdItem: key })
    }
  };

  handleSubmitUpdateItem = (e) => {
    this._isMounted = true
    e.preventDefault();
    const subs = {
      new_item: this.state.new_item,
      unit_price: this.state.unit_price,
      quantity: this.state.quantity,
      size: this.state.size,
      unit: this.state.unit_name,
      requisition_id: this.props.location.state.reqId
    }
    if (this._isMounted) {
      this.setState({ loading: true });
    }
    this.updatePropertyItem(subs);
  };

  updatePropertyItem = (property) => {
    Http.patch(`/api/v1/requestitems/${this.state.upIdItem}`, property)//last stop here no API YET
      .then(({ data }) => {

        if (this._isMounted) {

          this.setState({
            reqitems: data.updated1,
            reqnewitems: data.updated2,
            error: false,
          });

          this.setState({ loading: false });
        }
        toast("Request Item Updated successfully!")
        this.updateForm.reset();
      })
      .catch(() => {
        if (this._isMounted) {
          this.setState({
            loading: false
          });
        }
        toast("Error updating request item!")
      });
  };
  // update item 

  // handleSubmitUpdateNewItem

  reset = (e) => {
    this._isMounted = true
    if (this._isMounted) {
      this.setState({ urgency_status: null, estimated_receiving_date: null, type: null, size: null, unit_name: null, branch_id: null });
    }

  };

  myChangeHandlerItem = (e, { value }) => {
    if (this._isMounted) {
      this.setState({ item_id: value })
    }
  };
  myChangeHandlerUnit = (e, { value }) => {
    if (this._isMounted) {
      this.setState({ unit_name: value })
    }
  };

  myChangeHandlerbranch = (e, { value }) => {
    if (this._isMounted) {
      this.setState({ branch_id: value })
    }
  };
  buttonFormatter = (cell, row) => {
    const { loading } = this.state;
    return (
      <>
        <div class="inline_block">
          <button type="button"
            data-key={row.id} onClick={this.setUpIdItem} class="btn btn-secondary" data-backdrop="static" data-keyboard="false" data-toggle="modal" data-target={`#itemex${row.id}`}>
            <i class='fas icons'>&#xf304;</i>
          </button>
        </div>

        <div class="modal" id={`itemex${row.id}`}    >
          <div class="modal-dialog">
            <div class="modal-content">


              <div class="modal-header">
                <h4 class="modal-title">Update Item</h4>
                <button type="button" class="close" data-dismiss="modal" onClick={this.reset}>&times;</button>
              </div>


              <div class="modal-body">

                <form
                  method="post"
                  onSubmit={this.handleSubmitUpdateItem}
                  ref={(el) => {
                    this.updateForm = el;
                  }}
                >

                  <label >Estimated Price</label><br />
                  <input id="addRequest" type="number" step="0.001" defaultValue={row.unit_price} name="unit_price" class="form-control mb-2 mr-sm-2" onChange={this.handleChange} />


                  <label >Quantity</label><br />
                  <input id="addRequest" type="number" name="quantity" defaultValue={row.quantity} class="form-control mb-2 mr-sm-2" onChange={this.handleChange} />


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
        <div class="inline_block" >
          <button
            type="button"
            className="btn btn-secondary"
            onClick={this.deleteItem}
            data-key={row.id}
            data-keyreq={row.requisition_id}
          >
            <i class='fas icons'>&#xf1f8;</i>
          </button>
        </div>

      </>

    );


  }
  newitmTotalFormatter = (cell, row) => {

    return (
      <>
        {row.unit_price * row.quantity}
      </>
    );

  }
  newitmsizeFormatter = (cell, row) => {

    return (
      <>
        {row.size}-{row.unit}
      </>
    );

  }
  newbuttonFormatter = (cell, row) => {
    const { loading, units } = this.state;
    const unt = units.map((un) => ({ key: un.id, value: un.abv, text: un.name }));
    return (
      <>


        <div class="inline_block" >
          <button type="button"
            data-key={row.id} onClick={this.setUpIdItem} class="btn btn-secondary" data-backdrop="static" data-keyboard="false" data-toggle="modal" data-target={`#new${row.id}`}>
            <i class='fas icons'>&#xf304;</i>
          </button>
        </div>

        <div class="modal" id={`new${row.id}`}    >
          <div class="modal-dialog">
            <div class="modal-content">


              <div class="modal-header">
                <h4 class="modal-title">Update Item</h4>
                <button type="button" class="close" data-dismiss="modal" onClick={this.reset}>&times;</button>
              </div>


              <div class="modal-body">

                <form
                  method="post"
                  onSubmit={this.handleSubmitUpdateItem}
                  ref={(el) => {
                    this.updateForm = el;
                  }}
                >

                  <label >Item</label><br />
                  <input id="addRequest" type="text" name="new_item" class="form-control mb-2 mr-sm-2" defaultValue={row.new_item} onChange={this.handleChange} />



                  <label >Measurement</label><br />
                  <input id="addRequest" type="text" name="size" class="form-control mb-2 mr-sm-2" defaultValue={row.size} onChange={this.handleChange} />


                                              Unit Measurement

                                                  {/* <label style={label}>Unit Measurement</label><br/> */}
                  <Dropdown
                    type="select"
                    placeholder='Select item'
                    fluid
                    search
                    selection

                    onChange={this.myChangeHandlerUnit}
                    options={unt}
                    id="addItem"
                    name="unit_id"
                    required
                  />

                  <label>Unit Price</label><br />
                  <input id="addRequest" type="number" step="0.001" defaultValue={row.unit_price} name="unit_price" class="form-control mb-2 mr-sm-2" onChange={this.handleChange} />


                  <label >Quantity</label><br />
                  <input id="addRequest" type="number" name="quantity" defaultValue={row.quantity} class="form-control mb-2 mr-sm-2" onChange={this.handleChange} />


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

        <div class="inline_block" >
          <button
            type="button"
            className="btn btn-secondary"
            onClick={this.deleteItemnew}
            data-key={row.id}
            data-keyreq={row.requisition_id}
          >
            <i class='fas icons' onClick={this.deleteItemnew}
              data-key={row.id}
              data-keyreq={row.requisition_id}>&#xf1f8;</i>
          </button>
        </div>


      </>
    );

  }
  onSearchChange = (e, value) => {
    const { allitems } = this.state;
    // const { items } = this.state;
    this._isMounted = true
    if (this._isMounted) {
      this.setState({ loadingitm: true })
    }
    if (this.state.timeout) clearTimeout(this.state.timeout);
    this.state.timeout = setTimeout(() => {
      // console.log(value.searchQuery)
      var n = value.searchQuery
      var val = n.toString();
      const result = allitems.filter(function (data) {
        if (val == null) {
          return data
        }
        else if (data.code.toLowerCase().includes(val.toLowerCase()) || data.name.toLowerCase().includes(val.toLowerCase())
        ) {
          return data
        }
      }
      )

      // console.log(result)

      if (this._isMounted) {
        this.setState({ options: result, loadingitm: false })
      }
    }, 300);

  }

  render() {
    const { branch, reqTo, units, reqnewitems, reqitems, allitems, reqDetails, data, error, loading, options } = this.state;
    const pill_form = { textAlign: "center", paddingLeft: "30%", };
    const up_form = { paddingLeft: "28%", width: "100%", };
    const up_input = { width: "100%", };
    const req_tab = { width: "100%", };
    const req_list = { width: "80%", float: "right" };
    const req_inpt = { width: "100%", };
    const addBtn = { float: "right", };
    const label = { float: "left", };
    const det_cont = { paddingLeft: "30px", };
    const dis = this.state.disable;
    const disApp = this.state.disableApp;

    // const itms = allitems.map((items) => ({ key: items.id, value: items.id, text: items.name.concat('   (', items.size, items.unit, ')  ') }));
    const unt = units.map((un) => ({ key: un.id, value: un.abv, text: un.name }));
    const branches = branch.map((brnch) => ({ key: brnch.id, value: brnch.id, flag: brnch.id, text: brnch.name }));
    const opt = options.map((items) => ({ key: items.id, value: items.id, text: items.code.concat('\xa0\xa0\xa0\xa0', items.name) }));
    // Total
    const formatter = new Intl.NumberFormat('fil', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    })
    var overtotal = 0;

    return (
      <div className="contentreq">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb-item"> <Link to="/requisition"><a href="#">Your Requests</a></Link></li>
            <li class="breadcrumb-item active" aria-current="page">Purchase</li>
          </ol>
        </nav>
        <ToastContainer />
        {/* <div class="leftcolumn">&nbsp;</div>

<div class="contentwrapper">&nbsp;</div> */}
        {/* <PrintComponents
  trigger={<button>Print</button>}
>
  <h1>Content to print!</h1>
</PrintComponents> */}
        <div class="leftcolumn add_req">
          <br /><br />
          {/* {this.state.branch_id} */}
          {reqDetails.map((request) => (<center>  <h3>Request Details</h3> <br />{request.code}</center>))}

          <hr />
          <div style={req_inpt}>
            {/* {reqDetails.map((request) => (    */}

            {/* ))} */}
            {reqDetails.map((request) => (<tr><td><b>Urgency</b></td> <td style={det_cont}>{request.urgency_status}</td></tr>))}
            {reqDetails.map((request) => (<tr><td><b>Estimated Receiving Date</b></td> <td style={det_cont}>{request.estimated_receiving_date}</td></tr>))}
            {reqDetails.map((request) => (<tr><td><b>Request Type</b></td> <td style={det_cont}>{request.type}</td></tr>))}
            {reqDetails.map((request) => (<tr><td><b>Name of Requestor</b></td> <td style={det_cont}>{request.first_name}  {request.last_name}</td></tr>))}
            {reqDetails.map((request) => (<tr><td><b>Position</b></td> <td style={det_cont}>{request.position}</td></tr>))}
            {reqDetails.map((request) => (<tr><td><b>Branch Requester</b></td> <td style={det_cont}>{request.branch}</td></tr>))}
            {reqTo.map((request) => (<tr><td><b>Requesting To  </b></td> <td style={det_cont}>{request.branch}</td></tr>))}
            {reqDetails.map((request) => (
              <tr style={addBtn}  ><td>
                {/* <br/> */}

                <div style={dis}>
                  <br />
                  <button type="button"
                    data-key={request.id} onClick={this.setUpId} class="btn btn-primary" data-backdrop="static" data-keyboard="false" data-toggle="modal" data-target={`#request${request.id}`}>
                    Update
                  </button>
                </div>

                <div class="modal" id={`request${request.id}`}    >
                  <div class="modal-dialog">
                    <div class="modal-content">


                      <div class="modal-header">
                        <h4 class="modal-title">Update request</h4>
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
                                <label style={label}>Urgency</label><br />
                                <select id="addRequest" onChange={this.handleChange} style={req_inpt} name="urgency_status" class="form-control mb-2 mr-sm-2">
                                  <option>Urgency Status</option>
                                  <option value="Urgent">Urgent</option>
                                  <option value="Noturgent">Not Urgent</option>
                                </select>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <label style={label}>Estimated Receiving Date</label><br />
                                <input id="addRequest" type="date" placeholder={request.estimated_receiving_date} name="estimated_receiving_date" class="form-control mb-2 mr-sm-2" style={req_inpt} onChange={this.handleChange} />

                              </td>
                            </tr>
                            <tr>
                              <td>
                                <label style={label}>Request Type</label><br />
                                <select id="addRequest" onChange={this.handleChange} style={req_inpt} name="type" class="form-control mb-2 mr-sm-2">
                                  <option>Request Type</option>
                                  <option value="Purchase">Purchase</option>
                                  <option value="Transfer">Transfer</option>
                                </select>
                              </td>
                            </tr>
                            <tr>
                              <td>
                                <label style={label}>Request To</label><br />
                                <Dropdown
                                  type="select"
                                  placeholder='Select branch'
                                  fluid
                                  search
                                  selection
                                  style={req_inpt}
                                  onChange={this.myChangeHandlerbranch}
                                  options={branches}
                                  id="addItem"
                                  name="branch_id"
                                  required
                                  clearable={true}

                                />
                                <br />
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
            <br />
            <br />
            <br />

            <hr />
            {reqDetails.map((request) => (<center><b>{request.request_status}</b></center>))}
            <button onClick={this.sendforapp} style={disApp} className={classNames('btn btn-primary mb-2', {
              'btn-loading': loading,
            })} >Send for approval</button>

          </div>
          <br />
          <br />

          <hr />



          <div style={dis} >
            {/* { this.props.location.state.reqId} */}
            <center>  <h3>Add Item for purchase</h3> </center>
            <br />
            <p><i>*New item tab is for those items that doe not exist yet in the system. Once new item is requested, it is not yet added to the system unless it is received.</i></p>
            <br />
            <ul class="nav nav-tabs" role="tablist">
              <li class="nav-item">
                <a class="nav-link active" data-toggle="tab" href="#item">Existing Item</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" data-toggle="tab" href="#itemcat">New Item</a>
              </li>

            </ul>
            <div class="tab-content">

              <div id="item" class="container tab-pane active"><br />
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
                          <label style={label}>Item &nbsp;
                           {/* {this.state.item_id} */}
                          </label><br />
                          <Dropdown
                            type="select"
                            placeholder='Select item'
                            fluid
                            search
                            selection
                            style={req_inpt}
                            onChange={this.myChangeHandlerItem}
                            onSearchChange={this.onSearchChange}
                            // options={itms}
                            options={opt}
                            id="addItem"
                            name="brand_id"
                            required
                            clearable={true}
                            loading={this.state.loadingitm}
                          />

                        </center>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <center>
                          <label style={label}>Estimated Price &nbsp; {this.state.unit_price}</label><br />
                          {/* <input id="addRequest" required type="number" step="0.001" name="unit_price" class="form-control mb-2 mr-sm-2" style={req_inpt} onChange={this.handleChange} /> */}
                          <input id="addRequest" required type="number" step="0.001" name="unit_price" class="form-control mb-2 mr-sm-2" style={req_inpt} onBlur={this.handleChange} />

                        </center>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <center>
                          <label style={label}>Quantity &nbsp; {this.state.quantity}</label><br />
                          {/* <input id="addRequest" required type="number" name="quantity" class="form-control mb-2 mr-sm-2" style={req_inpt} onChange={this.handleChange} /> */}
                          <input id="addRequest" required type="number" name="quantity" class="form-control mb-2 mr-sm-2" style={req_inpt} onBlur={this.handleChange} />


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

              <div id="itemcat" class="container tab-pane fade"><br />
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
                          <label style={label}>Item  </label><br />
                          {/* <input id="addRequest" required type="text" name="new_item" class="form-control mb-2 mr-sm-2" style={req_inpt} onChange={this.handleChange} /> */}
                          <input id="addRequest" required type="text" name="new_item" class="form-control mb-2 mr-sm-2" style={req_inpt} onBlur={this.handleChange} />


                        </center>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <center>
                          <label style={label}>Estimated Price</label><br />
                          {/* <input id="addRequest" required type="number" step="0.001" name="unit_price" class="form-control mb-2 mr-sm-2" style={req_inpt} onChange={this.handleChange} /> */}
                          <input id="addRequest" required type="number" step="0.001" name="unit_price" class="form-control mb-2 mr-sm-2" style={req_inpt} onBlur={this.handleChange} />

                        </center>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <center>
                          <label style={label}>Measurement</label><br />
                          {/* <input id="addRequest" name="size" class="form-control mb-2 mr-sm-2" style={req_inpt} onChange={this.handleChange} /> */}
                          <input id="addRequest" name="size" class="form-control mb-2 mr-sm-2" style={req_inpt} onBlur={this.handleChange} />

                        </center>
                      </td>
                    </tr>
                    <tr><td>Unit Measurement</td></tr>
                    <tr>
                      <td>
                        <center>
                          {/* <label style={label}>Unit Measurement</label><br/> */}
                          <Dropdown
                            type="select"
                            placeholder='Select item'
                            fluid
                            search
                            selection
                            style={req_inpt}
                            onChange={this.myChangeHandlerUnit}
                            options={unt}
                            id="addItem"
                            name="unit_id"
                            required
                            clearable={true}

                          />
                        </center>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <center>
                          <label style={label}>Quantity</label><br />
                          {/* <input id="addRequest" required type="number" name="quantity" class="form-control mb-2 mr-sm-2" style={req_inpt} onChange={this.handleChange} /> */}
                          <input id="addRequest" required type="number" name="quantity" class="form-control mb-2 mr-sm-2" style={req_inpt} onBlur={this.handleChange} />


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
              <br /><br /><br /> <br /><br /><br /> <br /><br /><br /> <br /><br /><br />

            </div>


          </div>

        </div>

        <div class="contentwrapper_new">
          <div >
            <ul class="nav nav-tabs" role="tablist">
              <li class="nav-item">
                <a class="nav-link active" data-toggle="tab" href="#exe">Existing Items</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" data-toggle="tab" href="#new">New Items</a>
              </li>

            </ul>
            <div class="tab-content">

              <div id="exe" class="container tab-pane active"><br />



                {/* Start Existing items */}





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
                      data={reqitems}
                      pagination={true}
                      search={true}

                    // style={itemTabs}

                    // options={options} exportCSV
                    >
                      <TableHeaderColumn dataField='id' tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} isKey={true} hidden={true}>id</TableHeaderColumn>
                      <TableHeaderColumn dataField='id' hidden={true} tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }}  >id</TableHeaderColumn>
                      <TableHeaderColumn dataField="item" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Name</TableHeaderColumn>
                      <TableHeaderColumn dataField="item_size" width="80">Size</TableHeaderColumn>
                      <TableHeaderColumn dataField="new_price" width="100" >Price</TableHeaderColumn>
                      <TableHeaderColumn dataField="quantity" width="80">Qty</TableHeaderColumn>
                      <TableHeaderColumn dataField="sub_total" width="110">Total</TableHeaderColumn>
                      <TableHeaderColumn dataField="status" width="120" >Status</TableHeaderColumn>
                      <TableHeaderColumn dataField="requisition_id" hidden={true} width="120" >Status</TableHeaderColumn>
                      <TableHeaderColumn dataField='id' width="120" dataFormat={this.buttonFormatter} tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Action</TableHeaderColumn>

                    </BootstrapTable>

                    {reqitems.map((itemex) => (
                      <p class="disb">{overtotal += itemex.sub_total}</p>
                    ))}

                    {reqnewitems.map((itemex) => (
                      <p class="disb">{overtotal += itemex.unit_price * itemex.quantity}</p>
                    ))}






                    {/* <table className="table table-borderless reqtables">
                      <tbody>
                        <tr>
                       
                          <th>Name</th>
                          <th>Measurement</th>
                          <th>Price</th>
                          <th>Quantity</th>
                          <th>Total</th>
                          <th>Status</th>
                          <th>Action</th>

                        </tr>
                        {reqitems.map((itemex) => (

                          <tr key={itemex.id}>
                            
                            <td>{itemex.item}</td>
                            <td>{itemex.item_size}-{itemex.item_unit}</td>
                            <td>{itemex.new_price}</td>
                            <td>{itemex.quantity}</td>
                            <td>{itemex.sub_total}</td>
                            <td>{itemex.status}</td>

                            <td>
                              <tr>
                                <td>
                                  <div style={dis}>
                                    <button type="button"
                                      data-key={itemex.id} onClick={this.setUpIdItem} class="btn btn-secondary" data-backdrop="static" data-keyboard="false" data-toggle="modal" data-target={`#itemex${itemex.id}`}>
                                      <i class='fas icons'>&#xf304;</i>
                                    </button>
                                  </div>
                                </td>
                                <div class="modal" id={`itemex${itemex.id}`}    >
                                  <div class="modal-dialog">
                                    <div class="modal-content">


                                      <div class="modal-header">
                                        <h4 class="modal-title">Update Item</h4>
                                        <button type="button" class="close" data-dismiss="modal" onClick={this.reset}>&times;</button>
                                      </div>


                                      <div class="modal-body">

                                        <form class="form-inline"
                                          method="post"
                                          onSubmit={this.handleSubmitUpdateItem}
                                          ref={(el) => {
                                            this.updateForm = el;
                                          }}
                                        >
                                          <table style={up_form} class="table-borderless">

                                            <tr>
                                              <td>
                                                <label style={label}>Estimated Price</label><br />
                                                <input id="addRequest" type="number" step="0.001" placeholder={itemex.unit_price} name="unit_price" class="form-control mb-2 mr-sm-2" style={req_inpt} onChange={this.handleChange} />

                                              </td>
                                            </tr>
                                            <tr>
                                              <td>
                                                <label style={label}>Quantity</label><br />
                                                <input id="addRequest" type="number" name="quantity" placeholder={itemex.quantity} class="form-control mb-2 mr-sm-2" style={req_inpt} onChange={this.handleChange} />

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

                                <td>
                                  <div style={dis}>
                                    <button
                                      type="button"
                                      className="btn btn-secondary"
                                      onClick={this.deleteItem}
                                      data-key={itemex.id}
                                      data-keyreq={itemex.requisition_id}
                                    >
                                      <i class='fas icons'>&#xf1f8;</i>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                             
                              <p class="disb">{overtotal += itemex.sub_total}</p>
                            </td>
                          </tr>


                        ))}
                      </tbody>
                    </table> */}
                  </div>
                </div>

                {/* End Existing Item */}
              </div>

              <div id="new" class="container tab-pane fade"><br />
                {/* Start New items */}





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
                      data={reqnewitems}
                      pagination={true}
                      search={true}

                    // style={itemTabs}

                    // options={options} exportCSV
                    >
                      <TableHeaderColumn dataField='id' tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} isKey={true} hidden={true}>id</TableHeaderColumn>
                      <TableHeaderColumn dataField='id' hidden={true} tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }}  >id</TableHeaderColumn>
                      <TableHeaderColumn dataField="new_item" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Name</TableHeaderColumn>
                      <TableHeaderColumn dataField="size" dataFormat={this.newitmsizeFormatter} width="80">Size</TableHeaderColumn>
                      <TableHeaderColumn dataField="unit" hidden={true} width="80">Size</TableHeaderColumn>
                      <TableHeaderColumn dataField="unit_price" width="100" >Price</TableHeaderColumn>
                      <TableHeaderColumn dataField="quantity" width="80">Qty</TableHeaderColumn>
                      <TableHeaderColumn dataField="quantity" dataFormat={this.newitmTotalFormatter} width="110">Total</TableHeaderColumn>
                      <TableHeaderColumn dataField="status" width="120" >Status</TableHeaderColumn>
                      <TableHeaderColumn dataField="requisition_id" hidden={true} width="120" >Status</TableHeaderColumn>
                      <TableHeaderColumn dataField='id' width="120" dataFormat={this.newbuttonFormatter} tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Action</TableHeaderColumn>

                    </BootstrapTable>


                    {/* <table className="table table-borderless reqtables">
                      <tbody>
                        <tr>
                         
                          <th>Name</th>
                          <th>Measurement</th>
                          <th>Price</th>
                          <th>Quantity</th>
                          <th>Total</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                        {reqnewitems.map((items) => (
                          <tr key={items.id}>
                           
                            <td>{items.new_item}</td>
                            <td>{items.size}-{items.unit}</td>
                            <td>{items.unit_price}</td>
                            <td>{items.quantity}</td>
                            <td>{items.unit_price * items.quantity}</td>
                            <td>{items.status}</td>
                            <td>
                              <tr>
                                <td>
                                  <div style={dis} >
                                    <button type="button"
                                      data-key={items.id} onClick={this.setUpIdItem} class="btn btn-secondary" data-backdrop="static" data-keyboard="false" data-toggle="modal" data-target={`#new${items.id}`}>
                                      <i class='fas icons'>&#xf304;</i>
                                    </button>
                                  </div>
                                </td>
                                <div class="modal" id={`new${items.id}`}    >
                                  <div class="modal-dialog">
                                    <div class="modal-content">


                                      <div class="modal-header">
                                        <h4 class="modal-title">Update Item</h4>
                                        <button type="button" class="close" data-dismiss="modal" onClick={this.reset}>&times;</button>
                                      </div>


                                      <div class="modal-body">

                                        <form class="form-inline"
                                          method="post"
                                          onSubmit={this.handleSubmitUpdateItem}
                                          ref={(el) => {
                                            this.updateForm = el;
                                          }}
                                        >
                                          <table style={up_form} class="table-borderless">

                                            <tr>
                                              <td>
                                                <label style={label}>Item</label><br />
                                                <input id="addRequest" type="text" name="new_item" class="form-control mb-2 mr-sm-2" placeholder={items.new_item} style={req_inpt} onChange={this.handleChange} />

                                              </td>
                                            </tr>
                                            <tr>
                                              <td>
                                                <center>
                                                  <label style={label}>Measurement</label><br />
                                                  <input id="addRequest" type="text" name="size" class="form-control mb-2 mr-sm-2" style={req_inpt} onChange={this.handleChange} />

                                                </center>
                                              </td>
                                            </tr>
                                            <tr><td>Unit Measurement</td></tr>
                                            <tr>
                                              <td>
                                                <center>
                                                 
                                                  <Dropdown
                                                    type="select"
                                                    placeholder='Select item'
                                                    fluid
                                                    search
                                                    selection
                                                    style={req_inpt}
                                                    onChange={this.myChangeHandlerUnit}
                                                    options={unt}
                                                    id="addItem"
                                                    name="unit_id"
                                                    required
                                                  />
                                                </center>
                                              </td>
                                            </tr>
                                            <tr>
                                              <td>
                                                <label style={label}>Unit Price</label><br />
                                                <input id="addRequest" type="number" step="0.001" placeholder={items.unit_price} name="unit_price" class="form-control mb-2 mr-sm-2" style={req_inpt} onChange={this.handleChange} />

                                              </td>
                                            </tr>
                                            <tr>
                                              <td>
                                                <label style={label}>Quantity</label><br />
                                                <input id="addRequest" type="number" name="quantity" placeholder={items.quantity} class="form-control mb-2 mr-sm-2" style={req_inpt} onChange={this.handleChange} />

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
                                <td>
                                  <div style={dis} >
                                    <button
                                      type="button"
                                      className="btn btn-secondary"
                                      onClick={this.deleteItemnew}
                                      data-key={items.id}
                                      data-keyreq={items.requisition_id}
                                    >
                                      <i class='fas icons'>&#xf1f8;</i>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                              <p class="disb">{overtotal += items.unit_price * items.quantity}</p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table> */}
                  </div>
                </div>

                {/* End New Item */}
              </div>


            </div>
          </div>
        </div>
        <b><p class="total">{formatter.format(overtotal)}</p></b>
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
