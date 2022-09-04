import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../Http';
import classNames from 'classnames';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import { Dropdown, Radio } from 'semantic-ui-react';
// import PrintRequest from '../prints/printRequest';
import 'semantic-ui-css/semantic.min.css';
import ReactToPrint from "react-to-print";
import update from 'immutability-helper';
class PhysicalCount extends Component {
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
      physcnts: [],
    };

    // API endpoint.
    // this.api = '/api/v1/request';
    this.api = '/api/v1/physcount';
  }
  componentDidMount() {
   this.getContent()
  }
  getContent = ()=>{
    this._isMounted = true
    Http.get(`${this.api}`)
      .then((response) => {
        // const { data } = response.data.requests;
        // const { data } = response.requests.data;
        if (this._isMounted) {
          // this.setState({
          //   data,
          //   // branch: response.data.branch.data,
          //   error: false,
          // });
          this.setState({
            // branch: response.data.branch.data,
            branch: response.data.branch,
            physcnts: response.data.allphys,
            // error: false,
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
      branch_id: this.state.branch_id
    }
    // if (this._isMounted) {
    //   this.setState({ loading: true });
    // }
    if (this.state.branch_id) {
      if (confirm("Are you sure you want to perform physical count? All item balances will be based on today's date.")) {
        this.addPhysCnt(subs);
      }
    } else {
      toast("No Branch selected")
    }


  };

  addPhysCnt = (request) => {
    this._isMounted = true
    Http.post(this.api, request)
      .then((response) => {

        toast("Physical count added successfully!")
        // if (this._isMounted) {
        //   this.setState({ physcnts: response.data.allphys, });
        // }
        this.getContent()
      })
      .catch(() => {
        if (this._isMounted) {

          toast("Error adding Physical count")
        }
      });
  };

  myChangeHandlerbranch = (e, { value }) => {
    if (this._isMounted) {
      this.setState({ branch_id: value })
    }
  };


  deleteReq = (e) => {
    this._isMounted = true
    const { key } = e.target.dataset;
    const { physcnts: brd } = this.state;


    if (confirm("Are you sure you want to delete this physical count? You will lost all the data that you have inputted")) {


      Http.delete(`${this.api}/${key}`)
        .then((data) => {
          // if (data.status === 199) {
          const index = brd.findIndex(
            (brand) => parseInt(brand.id, 10) === parseInt(key, 10),
          );
          const update = [...brd.slice(0, index), ...brd.slice(index + 1)];
          if (this._isMounted) {
            this.setState({ physcnts: update });
          }
          toast("Physical count successfully!")
          // }

        })
        .catch((error) => {
          console.log(error);
          toast("Error deleting physical count!")
        });
    }

  };
  buttonFormatter = (cell, row) => {
    // const { items } = this.state;
    // var reff = "print" + row.id;
    // var disp = { display: "none" }
    // if (row.request_status == "Approved" || row.request_status == "Completed" || row.request_status == "Partially Received") {
    //   disp = { display: "block" }
    // }
    // var result = items.filter(function (v) {
    //   return v.requisition_id == row.id;
    // })
    return (
      <div>

        <div class="inline_block"><Link to={{ pathname: `/specPhysicalCount`, state: { id: row.id ,branch_id: row.branch_id } }}> <i class="eye icon regIcon"></i>  </Link></div>
    {/* Temporary disabled */}
       {/* {row.description == "Monthly" ? <></> : <div class="inline_block"><Link><i class="trash icon regIcon" data-key={row.id} onClick={this.deleteReq}></i></Link></div>} */}
   {/* Temporary disabled */}
   
   
   
        {/*    <div class="inline_block">
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
        </div> */}
      </div>
    )

    // return '<Link to=\'{{ pathname: /approvalitems, state:{reqId: '+row.id+'} }}\'> <button type="button" class=\'btn btn-secondary \' > View  </button></Link>';
    // return '<Link to=\'{{ pathname: /approvalitems, state:{reqId: '+row.id+'} }}\'> <button type="button" class=\'btn btn-secondary \' > View  </button></Link>';
  }
  upPhys = (e) => {
    this._isMounted = true
    const { key, tog } = e.target.dataset;
    const {physcnts } = this.state;
   
    var dis = "disable live update? This will stop updating the system item count to its current balances";
    var enb = "enable live update? This will update the system item count to its current balances";
    var conf = tog == "yes" ? dis : enb;
    if (confirm("Are you sure you want to " + conf)) {
      Http.post(`/api/v1/physcount/update/live`, { id: key })
        .then((response) => {

          toast("Physical count updated successfully!")

          var commentIndex = physcnts.findIndex(function (c) {
            return c.id == key;
          });
          var updatedComment = update(physcnts[commentIndex], { live_update: { $set: tog == "yes" ? "no" : "yes" } });
          var newData = update(physcnts, {
            $splice: [[commentIndex, 1, updatedComment]]
          });
          if (this._isMounted) {
            this.setState({ physcnts: newData });
          }

          // if (this._isMounted) {
          //   this.setState({ physcnts: response.data.allphys, });
          // }
        })
        .catch(() => {
          if (this._isMounted) {

            toast("Error updating Physical count")
          }
        });
    }

  };
  liveUpDisp = (cell, row) => {

    return (
      <>
        {/* <Radio toggle checked={row.live_update == "yes" ? true : false} data-key={row.id} data-tog={row.live_update} onClick={this.upPhys(row.id, row.live_update)} /> */}
{
  row.description == "Monthly" ? <></> :
  <div class="ui toggle checkbox">
  <input type="checkbox" name="public" checked={row.live_update == "yes" ? true : false} data-key={row.id} data-tog={row.live_update} onClick={this.upPhys} />
  <label> </label>
</div>
}
      </>
    )
  }
  render() {
    const { branch, data, error, loading, items, physcnts } = this.state;
    // const {data, error, loading} = this.state;
    const pill_form = { textAlign: "center", paddingLeft: "30%", };
    const up_form = { paddingLeft: "28%", width: "100%", };
    const up_input = { width: "100%", };
    const req_tab = { width: "100%", };
    const req_list = { width: "80%", float: "right" };
    const req_inpt = { width: "100%", };
    const addBtn = { float: "right", };
    const label = { float: "left", };


    const branches = branch.map((brnch) => ({ key: brnch.id, value: brnch.id, flag: brnch.id, text: brnch.name }));

    var sorted = physcnts.sort(function (a, b) {
      return b.date.localeCompare(a.date);
    });

    return (
      <div className="content">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb-item active" aria-current="page">Physical Counts</li>
          </ol>
        </nav>
        <ToastContainer />
        {/* {this.state.urgency_status}
    {this.state.estimated_receiving_date}
    {this.state.type} */}
        {/* {this.state.branch_id} */}
        <div class="leftcolumn">
          <center>  <h3>Select Branch</h3> </center>
          <br />
          <form class="form-inline"
            method="post"
            onSubmit={this.handleSubmit}
            ref={(el) => {
              this.addForm = el;
            }}
          >
            <table style={req_tab}>

              {/* <tr>
                <td>
                  <center>
                    <label style={label}>Estimated Receiving Date</label><br />
                    <input required id="addRequest" type="date" name="estimated_receiving_date" class="form-control mb-2 mr-sm-2" style={req_inpt} onChange={this.handleChange} />

                  </center>
                </td>
              </tr> */}

              <tr>
                <td>
                  <center>
                    {/* <label style={label}>Branch</label><br /> */}
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
          <center> <h3>Physical Counts </h3> </center>
          <BootstrapTable
            ref='table'
            data={sorted}
            // data={physcnts}
            pagination={true}
            search={true}
          // options={options} exportCSV
          >

            <TableHeaderColumn dataField='id' width="50" isKey={true} >ID</TableHeaderColumn>
            {/* <TableHeaderColumn dataField='id' isKey={true} hidden={true}>ID</TableHeaderColumn> */}
            <TableHeaderColumn dataField='date' width="150">Date Started</TableHeaderColumn>
            <TableHeaderColumn dataField='name'>Branch</TableHeaderColumn>
            <TableHeaderColumn dataField='branch_id' hidden>Branch</TableHeaderColumn>
            <TableHeaderColumn dataField='description' hidden>Branch</TableHeaderColumn>
            <TableHeaderColumn dataFormat={this.liveUpDisp} width="100" dataField='live_update'>Live Update</TableHeaderColumn>
            <TableHeaderColumn dataField='name' width="80" dataFormat={this.buttonFormatter} ></TableHeaderColumn>
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

export default connect(mapStateToProps)(PhysicalCount);
