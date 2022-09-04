import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../Http';
import classNames from 'classnames';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


class Transfer extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);

    // Initial state.
    this.state = {
      loading: false,
      brand: null,
      name: null,
      code: null,
      error: false,
      upId: null,
      reqDetails: [],
      reqTo: [],
      data: [],
    };

    // API endpoint.
    this.api = '/api/v1/brand';
  }
  componentDidMount() {
    this._isMounted = true
    //     Http.get(`/api/v1/transaction/receive/transfer`)
    //       .then((response) => {

    //       if(this._isMounted){
    //         this.setState({
    //           data: response.data.reqitems,
    //           error: false,
    //         });
    //          }
    //       })

    //       .catch(() => {
    //  if(this._isMounted){
    //         this.setState({
    //           error: 'Unable to fetch data.',
    //         });
    //       }  
    //       });
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
  };



  setUpId = (e) => {
    this._isMounted = true
    const { key } = e.target.dataset;
    if (this._isMounted) {
      this.setState({ upId: key })
    }
  };

  // getCode = (e) => {
  //     this._isMounted = true
  //     const { key } = e.target.dataset;
  //     if(this._isMounted){
  //       this.setState({code: key})
  //     }
  // };

  handleSubmitCode = (e) => {
    this._isMounted = true
    e.preventDefault();
    const subs = {
      code: this.state.code
    }
    if (this._isMounted) {
      this.setState({ loading: true });
    }
    this.getRequisition(subs);
  };

  // getRequisition = (subs) => {
  //     this._isMounted = true
  //     Http.post('/api/v1/transaction/receive/transfer', subs)
  //       .then(({ response }) => {
  //         if(this._isMounted){
  //           this.setState({ data: response.data.reqitems, });
  //           }
  //           this.checkForm.reset();
  //            toast("Request Exist!")
  //       })
  //       .catch(() => {
  //         if(this._isMounted){
  //        toast("Error getting request!")
  //         }
  //       });
  //   };

  getRequisition = (branch) => {
    this._isMounted = true
    Http.post('/api/v1/transaction/receive/transfer', branch)
      .then(({ data }) => {
        if (data.type == 'Purchase') {
          this.setState({ loading: false });
          toast("Request not for transfer")
        } else {

          if (data.reqTo[0].branch_id != data.branch_id) {
            toast("This is not your request");
            if (this._isMounted) {
              this.setState({
                loading: false,
              });
            }
          } else {

            if (data.status == 'Disapproved') {
              this.setState({ loading: false });
              toast("Request is not approved")
            } else if (data.status == 'Pending') {
              this.setState({ loading: false });
              toast("Request is still pending")
            } else if (data.status == 'Approved') {
              this.setState({ loading: false });
              toast("Request is not yet released")
            } else {
              if (this._isMounted) {
                this.setState({
                  data: data.reqitems,
                  reqDetails: data.requests,
                  reqTo: data.reqTo,
                  loading: false
                });
              }
              toast("Request Exist")
            }

            // if(data.status == 'Approved')
          }

        }

        this.checkForm.reset();


      })
      .catch(() => {
        if (this._isMounted) {
          toast("Error getting request!")
          this.setState({ loading: false });
        }
      });
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
  setUpId = (e) => {
    this._isMounted = true
    const { key } = e.target.dataset;
    if (this._isMounted) {
      this.setState({ upId: key })
    }
  };

  receiveItem = (property) => {
    Http.patch(`/api/v1/transaction/receive/transferitem/${this.state.upId}`, { code: this.state.code })//last stop here no API YET
      .then(({ data }) => {

        if (this._isMounted) {
          this.setState({
            data: data.updated,
            error: false,
          });
          this.setState({ loading: false });
        }
        toast("Item received successfully!")

      })
      .catch(() => {
        if (this._isMounted) {
          this.setState({
            loading: false
          });
        }
        toast("Error receiving item!")
      });
  };
  buttonFormatter = (cell, row) => {
    return (
      //  <button
      //  type="button"
      //  className="btn btn-primary"
      //  data-key={row.id}
      //  >
      //  Receive
      //  </button>
      <div>
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#exampleModal" data-key={row.id} onClick={this.setUpId}>
          Receive
    </button>
        <div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div class="modal-dialog" role="document">
            <div class="modal-content">

              <div class="modal-body">
                <center>   Your are about to receive items.<br />
              Please do have Physical counts before you confirm that you receive the items.<br />
                  <hr />
             The quantity of the items and prices will be<br /> reflected to your branch once you click confirm.<br /> </center>

              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" data-dismiss="modal" onClick={this.receiveItem}>Confirm</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  render() {
    const { reqTo, reqDetails, data, error, loading } = this.state;
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
    const det_cont = { paddingLeft: "30px", };
    return (
      <div>
        <ToastContainer />
        <br />
        <div class="transContN">
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
              <li class="breadcrumb-item active" aria-current="page">Receiving</li>
              <li class="breadcrumb-item active" aria-current="page">Transfer</li>
            </ol>
          </nav>
          <center>
            {/* {this.state.upId} */}
            <div class="input-group mb-3">
              <form class="form-inline"
                method="post"
                onSubmit={this.handleSubmitCode}
                ref={(el) => {
                  this.checkForm = el;
                }}
              >

                <input type="text" class="form-control" placeholder="Requisition Code" name="code" onChange={this.handleChange} />
                <div class="input-group-append">
                  <button className={classNames('input-group-text', {
                    'btn-loading': loading,
                  })} type="submit">Check Code</button>

                </div>
              </form>
            </div>
          </center>
          {/* {this.state.code} */}

          {/* <div class="transCont"> */}

          <h2>  <b>TRANSFER</b>  </h2>


          {reqDetails.map((request) => (<center><hr /> <h3>Request Details</h3> <br />{request.code}</center>))}
          {reqDetails.map((request) => (<tr><td><b>Urgency</b></td> <td style={det_cont}>{request.urgency_status}</td></tr>))}
          {reqDetails.map((request) => (<tr><td><b>Estimated Receiving Date</b></td> <td style={det_cont}>{request.estimated_receiving_date}</td></tr>))}
          {reqDetails.map((request) => (<tr><td><b>Request Type</b></td> <td style={det_cont}>{request.type}</td></tr>))}
          {reqDetails.map((request) => (<tr><td><b>Name of Requestor</b></td> <td style={det_cont}>{request.first_name}  {request.last_name}</td></tr>))}
          {reqDetails.map((request) => (<tr><td><b>Position</b></td> <td style={det_cont}>{request.position}</td></tr>))}
          {reqDetails.map((request) => (<tr><td><b>Branch Requester</b></td> <td style={det_cont}>{request.branch}</td></tr>))}
          {reqTo.map((request) => (<tr><td><b>Requesting To  </b></td> <td style={det_cont}>{request.branch}</td></tr>))}

          <BootstrapTable
            ref='table'
            data={data}
            pagination={true}
            search={true}
          >
            <TableHeaderColumn tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} dataField='item' isKey={true}>Item</TableHeaderColumn>
            <TableHeaderColumn dataField='item_size' width="110">Measurement</TableHeaderColumn>
            <TableHeaderColumn dataField='item_unit' width="100">Unit</TableHeaderColumn>
            <TableHeaderColumn dataField='quantity' width="100">Quantity</TableHeaderColumn>
            <TableHeaderColumn dataField="id"  width="150" dataFormat={this.buttonFormatter}>Action</TableHeaderColumn>
          </BootstrapTable>
        </div>

      </div>

    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: state.Auth.isAuthenticated,
  user: state.Auth.user,
});

export default connect(mapStateToProps)(Transfer);
