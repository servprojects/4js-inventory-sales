import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../Http';
import classNames from 'classnames';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import { Dropdown } from 'semantic-ui-react';
import PrintRequest from '../prints/printRequest';
import 'semantic-ui-css/semantic.min.css';
import ReactToPrint from "react-to-print";

class MainRequest extends Component {
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
      branch_id: null,
      status: null,
      data: [],
      branch: [],
      items: [],
      forPrint: [],
    };

    // API endpoint.
    this.api = '/api/v1/request';
  }
  componentDidMount() {
    this._isMounted = true
    var dat;
    Http.get(`${this.api}`)
      .then((response) => {
        const { data } = response.data.requests;
        // const { data } = response.requests.data;
        if (this._isMounted) {
          this.setState({
            data,
            // branch: response.data.branch.data,
            error: false,
          });
          this.setState({
            // branch: response.data.branch.data,
            branch: response.data.branch.data,
            items: response.data.items,
            error: false,
          });

          dat = data;



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
    const { estimated_receiving_date, type, branch_id } = this.state;
    const subs = {
      urgency_status: this.state.urgency_status ? this.state.urgency_status : 'Urgent',
      estimated_receiving_date: this.state.estimated_receiving_date,
      type: this.state.type,
      request_to: this.state.branch_id
    }


    if (estimated_receiving_date == null || type == null || branch_id == null) {
      console.log(estimated_receiving_date)
      console.log(type)
      console.log(branch_id)
      toast("Estimated date, request type, or request to must not be empty")
    } else {
      if (this._isMounted) {
        this.setState({ loading: true });
      }
      this.addRequest(subs);
    }

  };

  addRequest = (request) => {
    this._isMounted = true
    Http.post(this.api, request)
      .then(({ data }) => {

        if (data.status === 155) {
          toast("You cannot request transfer from your own branch.")
          this.setState({ loading: false });
        } else {



          // const newItem = {
          //   id: data.id,
          //   code: data.code,
          //   urgency_status: request.urgency_status,
          //   estimated_receiving_date: request.estimated_receiving_date,
          //   type: request.type,
          //   request_status: data.status,
          // };
          // const allRequest = [newItem, ...this.state.data];
          if (this._isMounted) {
            // this.setState({ data: allRequest, urgency_status: null, estimated_receiving_date: null, type: null, branch_id: null });
            this.setState({ data: data.requests.data, urgency_status: null, estimated_receiving_date: null, type: null, branch_id: null });
          }
          this.addForm.reset();
          if (this._isMounted) {
            this.setState({ loading: false });
          }
          toast("Request Added successfully!")

        }

      })
      .catch(() => {
        if (this._isMounted) {

          toast("Error adding request!")
          this.setState({ loading: false });
        }
      });
  };

  myChangeHandlerbranch = (e, { value }) => {
    if (this._isMounted) {
      this.setState({ branch_id: value })
    }
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
  deleteReq = (e) => {
    this._isMounted = true
    const { key } = e.target.dataset;
    const { data: brd } = this.state;

    if (confirm("Are you sure you want to delete request?")) {



      if (this._isMounted) {
        this.setState({ loading: true });
      }

      const { data } = this.state;
      var result = data.filter(function (v) {
        return v.id == key;
      })
      if (result[0].request_status == "Pending" || !result[0].request_status || result[0].request_status == "Requested") {
        Http.delete(`${this.api}/${key}`)
          .then((data) => {
            // if (data.status === 199) {
            const index = brd.findIndex(
              (brand) => parseInt(brand.id, 10) === parseInt(key, 10),
            );
            const update = [...brd.slice(0, index), ...brd.slice(index + 1)];
            if (this._isMounted) {
              this.setState({ data: update });
              this.setState({ loading: false });
            }
            toast("Request deleted successfully!")
            // }

          })
          .catch((error) => {
            console.log(error);
            toast("Error deleting request!")
          });

      } else {
        toast("Request cannot be deleted. It may involved in some transactions")

      }
      if (this._isMounted) {

        this.setState({ loading: false });
      }

    }


  };
  buttonFormatter = (cell, row) => {
    const { items } = this.state;
    var reff = "print" + row.id;
    var disp = { display: "none" }
    if (row.request_status == "Approved" || row.request_status == "Completed" || row.request_status == "Partially Received" || row.request_status == "Released") {
      disp = { display: "block" }
    }
    var result = items.filter(function (v) {
      return v.requisition_id == row.id;
    })
    return (
      <div>

        <div class="inline_block"><Link to={{ pathname: `/requestitems/${row.type}`, state: { reqId: row.id } }}> <i class="eye icon regIcon"></i>  </Link></div>
        <div class="inline_block"><Link><i class="trash icon regIcon" data-key={row.id} onClick={this.deleteReq}></i></Link></div>
        <div class="inline_block">
          <div style={disp}>
            <ReactToPrint

              trigger={() => <Link> <i class="print icon regIcon"></i></Link>}
              content={() => reff}
            />
          </div>
        </div>
        <div class="disb">
          <PrintRequest
            code={row.code}
            type={row.type}
            request_status={row.request_status}
            id={row.id}
            estimated_receiving_date={row.estimated_receiving_date}
            branch_req_to={row.branch_req_to}
            branch={row.branch}
            last_name={row.last_name}
            first_name={row.first_name}
            position={row.position}
            request_status={row.request_status}
            created_at={row.created_at}
            items={result}
            ref={el => (reff = el)}


          />
        </div>
      </div>
    )

    // return '<Link to=\'{{ pathname: /approvalitems, state:{reqId: '+row.id+'} }}\'> <button type="button" class=\'btn btn-secondary \' > View  </button></Link>';
    // return '<Link to=\'{{ pathname: /approvalitems, state:{reqId: '+row.id+'} }}\'> <button type="button" class=\'btn btn-secondary \' > View  </button></Link>';
  }
  render() {
    const { branch, data, error, loading, items } = this.state;
    // const {  data, error, loading } = this.state;
    const pill_form = { textAlign: "center", paddingLeft: "30%", };
    const up_form = { paddingLeft: "28%", width: "100%", };
    const up_input = { width: "100%", };
    const req_tab = { width: "100%", };
    const req_list = { width: "80%", float: "right" };
    const req_inpt = { width: "100%", };
    const addBtn = { float: "right", };
    const label = { float: "left", };


    const branches = branch.map((brnch) => ({ key: brnch.id, value: brnch.id, text: brnch.name }));

    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();
    if (dd < 10) {
      dd = '0' + dd
    }
    if (mm < 10) {
      mm = '0' + mm
    }

    today = yyyy + '-' + mm + '-' + dd;
    return (
      <div className="content">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb-item active" aria-current="page">Your Requests</li>
          </ol>
        </nav>
        <ToastContainer />
        {/* {this.state.urgency_status}
    {this.state.estimated_receiving_date}
    {this.state.type} */}
        {/* {this.state.branch_id} */}
        <div class="leftcolumn">
          <center>  <h3>Add New Request</h3> </center>
          <br />
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
                    <label style={label}>Urgency</label><br />
                    <select required id="addRequest" onChange={this.handleChange} value="Urgent" style={req_inpt} name="urgency_status" class="form-control mb-2 mr-sm-2">
                      <option>Urgency Status</option>
                      <option value="Urgent">Urgent</option>
                      <option value="Noturgent">Not Urgent</option>
                    </select>

                  </center>
                </td>
              </tr>
              <tr>
                <td>
                  <center>
                    <label style={label}>Estimated Receiving Date</label><br />
                    <input required id="addRequest" type="date" name="estimated_receiving_date" min={today} class="form-control mb-2 mr-sm-2" style={req_inpt} onChange={this.handleChange} />

                  </center>
                </td>
              </tr>
              <tr>
                <td>
                  <center>
                    <label style={label}>Request Type</label><br />
                    <select required id="addRequest" placeholder='Select type' onChange={this.handleChange} style={req_inpt} name="type" class="form-control mb-2 mr-sm-2">
                      <option>Request Type</option>
                      <option value="Purchase">Purchase</option>
                      <option value="Transfer">Transfer</option>
                    </select>

                  </center>
                </td>
              </tr>
              <tr>
                <td>
                  <center>
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
                      name="brand_id"
                      required={true}
                      clearable
                    />

                  </center>
                </td>
              </tr>

              <tr>
                <td >
                  <br />
                  <button type="submit" style={addBtn} className={classNames('btn btn-primary mb-2', {
                    'btn-loading': loading,
                  })} >Add</button>
                </td>
              </tr>
            </table>
          </form>


        </div>

        <div class="contentwrapper">
          <center> <h3>Requests </h3> </center>
          <BootstrapTable
            ref='table'
            data={data}
            pagination={true}
            search={true}
          // options={options} exportCSV
          >
            {/* <TableHeaderColumn dataField='id' >Code</TableHeaderColumn> */}
            {/* <TableHeaderColumn dataField='id' >Id</TableHeaderColumn> */}
            <TableHeaderColumn dataField='code' isKey={true}>Code</TableHeaderColumn>
            <TableHeaderColumn dataField='type'>Type</TableHeaderColumn>
            <TableHeaderColumn dataField='request_status'>Status</TableHeaderColumn>
            <TableHeaderColumn dataField="id" width="90" dataFormat={this.buttonFormatter}></TableHeaderColumn>
            <TableHeaderColumn dataField='estimated_receiving_date' hidden={true}></TableHeaderColumn>
            <TableHeaderColumn dataField='branch_req_to' hidden={true}></TableHeaderColumn>
            <TableHeaderColumn dataField='branch' hidden={true}></TableHeaderColumn>
            <TableHeaderColumn dataField='last_name' hidden={true}></TableHeaderColumn>
            <TableHeaderColumn dataField='first_name' hidden={true}></TableHeaderColumn>
            <TableHeaderColumn dataField='position' hidden={true}></TableHeaderColumn>
            <TableHeaderColumn dataField='created_at' hidden={true}></TableHeaderColumn>
          </BootstrapTable>

          {/* <BootstrapTable
            ref='table'
            data={items}
            pagination={true}
            search={true}
          // options={options} exportCSV
          > */}
          {/* <TableHeaderColumn dataField='id' >Code</TableHeaderColumn> */}
          {/* <TableHeaderColumn dataField='id' >Id</TableHeaderColumn> */}
          {/* <TableHeaderColumn dataField='item' isKey={true}>name</TableHeaderColumn>
            <TableHeaderColumn dataField='requisition_id'>req id</TableHeaderColumn>
            
          </BootstrapTable> */}
        </div>


      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: state.Auth.isAuthenticated,
  user: state.Auth.user,
});

export default connect(mapStateToProps)(MainRequest);
