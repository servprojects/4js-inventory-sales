import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../Http';
import classNames from 'classnames';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Dropdown } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import { Link } from 'react-router-dom';

class ApprovalRequestItemExist extends Component {
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
      unit_name: null,
      urgency_status: null,
      estimated_receiving_date: null,
      status: null,
      disable: null,
      request_id: this.props.location.state.reqId,
      type: null,
      size: null,
      data: [],
      reqDetails: [],
      allitems: [],
      reqitems: [],
      reqnewitems: [],
      units: [],
      recs: [],
      res: [],
    };

    // API endpoint.
    this.api = '/api/v1/requestitems';
    this.apiApp = '/api/v1/approval/requests';
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
            res: response.data.res,
            reqnewitems: response.data.reqnewitems,
            units: response.data.units.data,
            error: false,
            status: response.data.requests[0].request_status,
          });
          // {display : 'none'}
          if (response.data.requests[0].request_status == "Completed" || response.data.requests[0].request_status == "Partially Received") {
            this.setState({
              disable: { display: 'none' },
            });
          }


          var arr = response.data.res;
          // console.log(response.data.res)

          console.log(arr);
          // var o = arr.reduce((a, b) => {
          //   a[b.item_id] = a[b.item_id] || [];
          //   a[b.item_id].push({ [b.branch_id]: b.balance });
          //   return a;
          // }, []);

          // var a = Object.keys(o).map(function (k) {
          //   return { item_id: k, branch_id: [Object.assign.apply([],o[k])] };
          // });

          var o = arr.reduce((a, b) => {
            a[b.item_id] = a[b.item_id] || [];
            a[b.item_id].push({ [b.branch_id]: b.balance });
            return a;
          }, {});

          var a = Object.keys(o).map(function (k) {
            return { item_id: k, branch_id: [Object.assign.apply({}, o[k])] };
          });

          console.log(a);

          this.setState({
            recs: a,

          });

        }
      })

      // request_status
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
        toast("Brand deleted successfully!")
      })
      .catch((error) => {
        console.log(error);
        toast("Error deleting brand!")
      });
  };

  deleteItemnew = (e) => {
    this._isMounted = true
    const { key, keyreq } = e.target.dataset;
    const { reqnewitems: itm } = this.state;
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
      type: this.state.type
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
      this.setState({ urgency_status: null, estimated_receiving_date: null, type: null, size: null, unit_name: null });
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
  // Approvals
  handleApprove = (e) => {
    this._isMounted = true
    const { key } = e.target.dataset;
    e.preventDefault();
    const subs = {
      request_status: key,
    }
    if (this._isMounted) {
      this.setState({ loading: true });
    }
    this.updateRequest(subs);
  };
  updateRequest = (property) => {
    Http.patch(`/api/v1/approval/requests/${this.state.request_id}`, property)//last stop here no API YET
      .then(({ data }) => {

        if (this._isMounted) {

          this.setState({
            reqDetails: data.updated,
            error: false,
          });

          this.setState({ loading: false });
        }
        if (property.request_status == "Approved") {
          toast("Request Approved!")
        } else {
          toast("Request Dissapproved!")
        }

        // this.updateForm.reset();
      })
      .catch(() => {
        if (this._isMounted) {
          this.setState({
            loading: false
          });
        }
        toast("Error approving request!")
      });
  };


  // Approvals
  render() {
    const { units, reqnewitems, reqitems, allitems, reqDetails, data, error, loading, recs, res } = this.state;
    const pill_form = { textAlign: "center", paddingLeft: "30%", };
    const up_form = { paddingLeft: "28%", width: "100%", };
    const up_input = { width: "100%", };
    const req_tab = { width: "100%", };
    const req_list = { width: "100%", float: "right" };
    const req_det = { width: "40%" };
    const req_inpt = { width: "100%", };
    const addBtn = { float: "right", };
    const label = { float: "left", };
    const det_cont = { paddingLeft: "30px", };
    const dis = this.state.disable;

    const itms = allitems.map((items) => ({ key: items.id, value: items.id, text: items.name.concat('   (', items.size, items.unit, ')  ') }));
    const unt = units.map((un) => ({ key: un.id, value: un.name, text: un.name }));
    var prevItem=" ";
    return (
      <div className="content">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb-item active" aria-current="page"> <Link to="/branchrequest">Branch Requests</Link></li>
            <li class="breadcrumb-item active" aria-current="page">Transfer</li>
          </ol>
        </nav>
        <ToastContainer />

        <div class="leftcolumn">
          {/* {this.state.status} */}
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
            {reqDetails.map((request) => (<tr><td><b>Branch</b></td> <td style={det_cont}>{request.branch}</td></tr>))}
            {reqDetails.map((request) => (
              <tr style={addBtn}  ><td>


              </td></tr>
            ))}
          </div>
          <br />
          <br />

          <hr />
          {reqDetails.map((request) => (<center><b>{request.request_status}</b></center>))}
          <hr />
          <center>
            <div style={dis}>
              <button type="button"
                data-key="Approved"
                onClick={this.handleApprove} class="btn btn-secondary" data-backdrop="static" data-keyboard="false" data-toggle="modal"
              //  data-target= {`#itemex${itemex.id}`}
              >
                Approve
                            </button>
                                &nbsp;
                              <button type="button"
                // data-key={itemex.id} 
                data-key="Disapproved"
                onClick={this.handleApprove} class="btn btn-secondary" data-backdrop="static" data-keyboard="false" data-toggle="modal"
              //  data-target= {`#itemex${itemex.id}`}
              >
                Disapprove
                            </button>
            </div>
          </center>

        </div>

        <div class="contentwrapper">
          <button class="ui button" style={{ position: "absolute", right: "0" }} data-toggle="modal" data-target="#modal">Item balances</button>

          <div class="modal fade" id="modal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg" role="document">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="exampleModalLabel">Item balances</h5>
                  <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div class="modal-body">
                  <table class="table table-hover">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Branch</th>
                        <th>Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {res.map((itm, index) => (
                        // <tr>
                        //   <td>{itm.item_id}</td>
                        //   {itm.branch_id.map((itm,index) => (
                          
                        //    <td>fdfds{0.[index]}</td> 
                        //   ))}

                        // </tr>
                        
                        <tr>
                          <td>{itm.item === prevItem ? <></> : itm.item}</td>
                          <td>{itm.branch}</td>
                          <td>{itm.balance}</td>
                      <p style={{display: "none"}}> {prevItem = itm.item}</p>
                        </tr>
                        
                      ))}

                    </tbody>
                  </table>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                </div>
              </div>
            </div>
          </div>









          <div style={req_list}>
            <ul class="nav nav-tabs" role="tablist">
              <li class="nav-item">
                <a class="nav-link active" data-toggle="tab" href="#exe">Existing Items</a>
              </li>
              {/* <li class="nav-item">
                          <a class="nav-link" data-toggle="tab" href="#new">New Items</a>
                        </li>  */}

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
                  <BootstrapTable
                    ref='table'
                    data={reqitems}
                    pagination={true}
                    search={true}
                  // options={options} exportCSV
                  >
                    <TableHeaderColumn dataField='item' tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} isKey={true}>Name</TableHeaderColumn>
                    <TableHeaderColumn dataField='item_size' width="80">Size</TableHeaderColumn>
                    {/* <TableHeaderColumn dataField='original_price'>Price</TableHeaderColumn> */}
                    <TableHeaderColumn dataField="quantity">Quantity</TableHeaderColumn>
                    <TableHeaderColumn dataField="status">Status</TableHeaderColumn>
                    {/* <TableHeaderColumn dataField="sub_total">Total</TableHeaderColumn> */}
                  </BootstrapTable>

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
                  <BootstrapTable
                    ref='table'
                    data={reqnewitems}
                    pagination={true}
                    search={true}
                  // options={options} exportCSV
                  >
                    <TableHeaderColumn dataField='new_item' tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }}>Name</TableHeaderColumn>
                    <TableHeaderColumn dataField='item_size'>Measurement</TableHeaderColumn>
                    <TableHeaderColumn dataField='unit_price'>Price</TableHeaderColumn>
                    <TableHeaderColumn dataField="quantity">Quantity</TableHeaderColumn>
                    <TableHeaderColumn dataField="id" isKey={true}>Total</TableHeaderColumn>
                  </BootstrapTable>

                </div>

                {/* End New Item */}
              </div>


            </div>
          </div>
        </div>

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

export default connect(mapStateToProps)(ApprovalRequestItemExist);
