import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../Http';
import classNames from 'classnames';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import { Dropdown, Loader } from 'semantic-ui-react';
// import PrintRequest from '../prints/printRequest';
import 'semantic-ui-css/semantic.min.css';
import ReactToPrint from "react-to-print";
import update from 'immutability-helper';
import PrintPhys from '../pages/prints/printPhys';
import PrintReportItem from './prints/excelPhyscount';
import ReactHTMLTableToExcel from 'react-html-table-to-excel';
class SpecPhysicalCount extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);

    // Initial state.
    this.state = {
      load: false,
      loading: false,
      urgency_status: null,
      estimated_receiving_date: null,
      type: null,
      error: false,
      upId: null,
      branch_id: null,
      status: null,
      modType: null,
      saving: false,
      reason: "Mismatched inventory",
      prevData: "no",
      data: [],
      branch: [],
      items: [],
      allitems: [],
      oldallitems: [],
      forPrint: [],
      physcnts: [],
      categories: [],
      allitemsTemp: [],
      mismatched: [],
      modalData: [],
    };

    // API endpoint.
    // this.api = '/api/v1/request';
    this.api = '/api/v1/physcount';
  }
  componentDidMount() {
    this._isMounted = true
    if (this._isMounted) { this.setState({ load: true }); };
    // this.props.location.state.id
    Http.post(`/api/v1/physcount/items`, { id: this.props.location.state.id, branch_id: this.props.location.state.branch_id })
      .then((response) => {

        if (this._isMounted) {

          this.setState({

            allitems: response.data.allItems,
            oldallitems: response.data.oldallItems,
            allitemsTemp: response.data.allItems,
            physcnts: response.data.allphys,
            origItems: response.data.origItems,
            categories: response.data.categories,
            load: false
          });
          // console.log(response.data.allphys[0].items);


        }

      })

      .catch(() => {
        if (this._isMounted) {
          this.setState({
            error: 'Unable to fetch data.',
            load: false
          });
        }
      });
  }

  myChangeHandlerCats = (e, { value }) => {
    const { allitemsTemp } = this.state;
    var result = allitemsTemp.filter(function (v) {
      return v.category_id == value;
    })
    if (this._isMounted) {
      this.setState({ allitems: result })
    }

  };


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
      if (confirm("Are you sure you want to perform physical count? All item balances will be based today's date.")) {
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
        if (this._isMounted) {
          this.setState({ physcnts: response.data.allphys, });
        }
      })
      .catch(() => {
        if (this._isMounted) {

          toast("Error adding Physical count")
        }
      });
  };

  handleSubmitUpdate = (e) => {
    this._isMounted = true
    const { allitems, prevData } = this.state;
    e.preventDefault();
    const subs = {
      items: allitems,
      prevData: prevData
    }
    // if (this._isMounted) {
    //   this.setState({ loading: true });
    // }

    if (confirm("Are you sure you want to update physical count?")) {
      this.upPhys(subs);
    }


  };
  upPhys = (request) => {
    this._isMounted = true
    Http.patch(`${this.api}/${this.props.location.state.id}`, request)
      .then((response) => {

        toast("Physical count updated successfully!")
        // if (this._isMounted) {
        //   this.setState({ physcnts: response.data.allphys, });
        // }
      })
      .catch(() => {
        if (this._isMounted) {

          toast("Error updating Physical count")
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
    const { data: brd } = this.state;
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
  };
  buttonFormatter = (cell, row) => {
    const { origItems } = this.state;
    var result = origItems.filter(function (v) {
      return v.id == row.item_id;
    })
    return (
      <div>
        {result[0].name}
      </div>
    )

    // return '<Link to=\'{{ pathname: /approvalitems, state:{reqId: '+row.id+'} }}\'> <button type="button" class=\'btn btn-secondary \' > View  </button></Link>';
    // return '<Link to=\'{{ pathname: /approvalitems, state:{reqId: '+row.id+'} }}\'> <button type="button" class=\'btn btn-secondary \' > View  </button></Link>';
  }
  dataFormatter = (cell, row) => {
    const { origItems } = this.state;
    var result = origItems.filter(function (v) {
      return v.id == row.item_id;
    })
    return (

      result[0].name

    )

    // return '<Link to=\'{{ pathname: /approvalitems, state:{reqId: '+row.id+'} }}\'> <button type="button" class=\'btn btn-secondary \' > View  </button></Link>';
    // return '<Link to=\'{{ pathname: /approvalitems, state:{reqId: '+row.id+'} }}\'> <button type="button" class=\'btn btn-secondary \' > View  </button></Link>';
  }
  jobStatusValidator = (value, row) => {
    const { allitems } = this.state;
    const nan = isNaN(parseInt(value, 10));
    if (nan) {
      return 'Quantity must be a integer!';
    }

    var commentIndex = allitems.findIndex(function (c) {
      return c.item_id == row.item_id;
    });

    var dm = new Date().toLocaleString();

    var updatedComment = update(allitems[commentIndex], { phys_count: { $set: value }, date_mod: { $set: dm } });

    var newData = update(allitems, {
      $splice: [[commentIndex, 1, updatedComment]]
    });
    if (this._isMounted) {
      this.setState({ allitems: newData });
    }

    if (this.state.saving == true) {
      if (confirm("This physical count of " + row.name + " will update its balance. Make sure the amount is the actual inventory of the item. For confirmation the new balance is : " + value)) {
       const subs = {
        item_id: row.item_id,
        branch_id: this.props.location.state.branch_id,
        new_balance: value,
        description: this.state.reason
       }
       console.log("subs")
       console.log(subs)
        Http.post(`/api/v1/mod/inventory/update`, subs )
        .then((response) => {
          toast("Inventory successfully udpated")
        })
        .catch(() => {
          toast("Failed to update inventory")
        });
      }
    }

    return true;
  }

  resetFilter = (e) => {
    const { allitemsTemp } = this.state;

    if (this._isMounted) {
      this.setState({ allitems: allitemsTemp })
    }

  };

  

  upSaving = (e) => {
    if (this.state.saving == false) {
      if (confirm("When you update physical count, branch item balances will be update. Confirmations will pop up every update.")) {
        if (this._isMounted) {
          this.setState({ saving: !this.state.saving })
        }
      }
    } else {
      if (confirm("Updating of branch item balances will be disabled. All changes will not update item balances")) {
        if (this._isMounted) {
          this.setState({ saving: !this.state.saving })
        }
      }
    }
  };

  mismatcheditms = (e) => {
    const { allitemsTemp } = this.state;

    var result = allitemsTemp.filter(function (v) {

      if (v.sys_count != v.phys_count) {
        return v
      }
      // return v.id == row.item_id;
    })
    console.log(result)
    if (this._isMounted) {
      // this.setState({ mismatched: result })
      this.setState({ modalData: result, modType: "mis" })
    }

  };
  previtms = (e) => {
    const { oldallitems } = this.state;


    // console.log("oldallitems")
    // console.log(oldallitems)
    if (this._isMounted) {
      this.setState({ modalData: oldallitems, modType: "prev" })
    }

  };
  reset = (e) => {



    // console.log("oldallitems")
    // console.log(oldallitems)
    if (this._isMounted) {
      this.setState({ modalData: [] })
    }

  };
  useprevitms = (e) => {
    const { allitems, allitemsTemp, oldallitems } = this.state;


    // console.log("oldallitems")
    // console.log(oldallitems)
    if (confirm("Are you sure you want to shift to previous data?")) {
      if (this._isMounted) {
        this.setState({ allitems: oldallitems, allitemsTemp: oldallitems, prevData: "yes" })
      }
    }


  };

  cacDiff = (unit_price, sys_count, phys_count) => {
    var up = unit_price;
    var sc = sys_count;
    var pc = phys_count;

    var sc_col = up * sc;
    var pc_col = up * pc;

    var val = sc_col - pc_col;

    return val;
  }

  diffTotal = (cell, row) => {

    var val = this.cacDiff(row.unit_price, row.sys_count, row.phys_count);

    return (
      <>
        <span style={val != 0 ? { color: "red" } : {}}> {val} </span>
      </>
    )

  }

  sys_col = (cell, row) => {
    var up = row.unit_price;
    var sc = row.sys_count;


    return (
      <>
        {up * sc}
      </>
    )

  }

  phys_col = (cell, row) => {
    var up = row.unit_price;
    var ps = row.phys_count;


    return (
      <>
        {up * ps}
      </>
    )

  }


  modalTable = (data) => {

    var sorted = data.sort(function (a, b) {
      return a.name.localeCompare(b.name);
    });
    return (<>

      <BootstrapTable
        ref='table'
        data={sorted}
        // data={data}
        pagination={true}
        search={true}

      // options={options} exportCSV
      >

        <TableHeaderColumn dataField='code' width="145"  >Code</TableHeaderColumn>
        <TableHeaderColumn dataField='item_id' isKey={true} hidden={true} >Description</TableHeaderColumn>
        <TableHeaderColumn dataField='name'   >Description</TableHeaderColumn>
        <TableHeaderColumn dataField='brand' width="100"  >Brand</TableHeaderColumn>
        <TableHeaderColumn dataField='size' width="80"   >Size</TableHeaderColumn>
        <TableHeaderColumn dataField='unit' width="80"  >Unit</TableHeaderColumn>
        <TableHeaderColumn dataField='category_id' hidden={true} >cat-d</TableHeaderColumn>
        <TableHeaderColumn dataField='sys_count' width="130"  >System Count</TableHeaderColumn>
        <TableHeaderColumn dataField='phys_count' width="130" >Physical count</TableHeaderColumn>
        {/* <TableHeaderColumn dataField='name' width="50" dataFormat={this.buttonFormatter} ></TableHeaderColumn> */}
      </BootstrapTable>
    </>);
  }
  render() {
    const { loading, allitems, categories, physcnts, mismatched, modalData, modType, load } = this.state;
    // const {  data, error, loading } = this.state;


    const cellEditProp = {
      mode: 'click',
      blurToSave: true
    };


    const cats = categories.map((index) => ({ key: index.id, value: index.id, text: index.name }));
    var physdate = " ";
    var physbranch = " ";
    var sysphysdate = " ";
    var liveup = " ";
    physcnts.map((item) => {
      physdate = item.date
      sysphysdate = item.syscount_date
      physbranch = item.name
      liveup = item.live_update
    })

    var sorted = allitems.sort(function (a, b) {
      return a.name.localeCompare(b.name);
    });

    console.log(sorted)

    var total_missed = 0;


    allitems.map((i) => {
      total_missed += this.cacDiff(i.unit_price, i.sys_count, i.phys_count)
    });



    const formatter = new Intl.NumberFormat('fil', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    })

    return (
      <div className="content">

        <nav aria-label="breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb-item"> <Link to="/physicalCount"><a href="#">Physical Counts</a></Link></li>
            <li class="breadcrumb-item active" aria-current="page">Items</li>
          </ol>
        </nav>
        <ToastContainer />
        {/* {this.state.urgency_status}
    {this.state.estimated_receiving_date}
    {this.state.type} */}
        {/* {this.state.branch_id} */}


        {/* {this.props.location.state.id} */}
        {/* <center> <h3>Physical Counts </h3> </center> */}
        <button onClick={this.handleSubmitUpdate} class="ui button secondary">
          Save Changes
        </button>


        <ReactToPrint

          trigger={() =>
            <button onClick={this.handleSubmitUpdate} class="ui button">
              <i class="print icon"></i> Print
          </button>}
          content={() => this.componentRef}
        />

        <ReactHTMLTableToExcel
          id="test-table-xls-button"
          className=" ui button"
          table="physcount"
          filename={"Physical_count_" + physdate + "_" + physbranch}
          sheet="tablexls"
          buttonText="Excel" />


        <button onClick={this.mismatcheditms} class="ui button" data-toggle="modal" data-backdrop="static" data-keyboard="false" data-target="#exampleModal">
          Mismatched counts
        </button>

        <button onClick={this.previtms} class="ui button" data-toggle="modal" data-target="#exampleModal">
          Previous data version
        </button>




        <div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div class="modal-dialog modal-xl" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">{modType == "mis" ? "Mismatched" : "Previous version of data"}</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close" onClick={this.reset}>
                  <span aria-hidden="true" onClick={this.reset}>&times;</span>
                </button>
              </div>
              <div class="modal-body">
                {this.modalTable(modalData)}

              </div>
              <div class="modal-footer">
                {
                  modType == "prev" ?
                    <button onClick={this.useprevitms} class="ui button" >
                      Use previous data
                  </button>
                    : <>
                      <ReactHTMLTableToExcel
                        id="test-table-xls-button"
                        className=" ui button"
                        table="mismatch"
                        filename={"Mismateched_physical_count_" + physdate + "_" + physbranch}
                        sheet="tablexls"
                        buttonText="Excel" />
                    </>
                }
&nbsp;&nbsp;&nbsp;

                <ReactToPrint

                  trigger={() =>
                    <button type="button" class="btn btn-primary">Print</button>}
                  content={() => this.componentRefmis}
                />
                <div style={{ display: "none" }}>
                  <PrintPhys

                    date={physdate}
                    branch={physbranch}
                    // allitems={mismatched}
                    allitems={modalData}
                    ref={el => (this.componentRefmis = el)}

                  />
                </div>

              </div>
            </div>
          </div>
        </div>
        <br /><br />
        <div class="float_right" style={{ width: "100%" }}>
          <div class="slcItemCat">
            <Dropdown type="select" placeholder='Select Category' fluid search selection balance
              onChange={this.myChangeHandlerCats}
              options={cats}
              class="form-control form-control-lg "
              required
            />
          </div>
         &nbsp;&nbsp; &nbsp;
        <div class="inline_block">
            <i class="undo icon" onClick={this.resetFilter}  ></i>
          </div>
          <br />
          <br />
        </div>

        <div class="ui toggle checkbox">
          <input type="checkbox" name="public" checked={this.state.saving == true ? true : false} onClick={this.upSaving} />
          <label> Update Inventory Balance </label>
        </div>
        {
          this.state.saving == true ?
          <>
            <br />
            <br />
            <label for="reason"> Reason for updating </label>
            <input type="text" id="reason" name="reason" onBlur={this.handleChange} defaultValue={this.state.reason} class="form-control form-control-lg" placeholder="Reason for updating" style={{ width: "20%" }} />
          </>
          : <></>
        }
        <div class="physdetails shadow-2xl">
          <div style={{ padding: "4%" }}>
            {/* {physcnts.map((item) => ( */}
            <div>
              <table>
                <tr><td><b>Date Started</b></td><td>:</td> <td> {physdate} </td></tr>
                <tr><td><b>Stock Date As of</b></td><td>:</td> <td> {sysphysdate} </td></tr>
                <tr><td><b>Branch</b></td><td>:</td> <td> {physbranch} </td></tr>
                <tr><td><b>Live update</b></td><td>:</td> <td> {liveup == "yes" ? "Enable" : "Disabled"} </td></tr>

              </table>
              {/* <div style={{ display: "none" }} >
                  {physdate = item.date}
                  {sysphysdate = item.syscount_date}
                  {physbranch = item.name}
                </div> */}

              <small>If live update is <b>Enabled</b>, item balances will update to its current balance. If <b>Disabled</b>, it will only record the item's balance of the day that you disabled the Live Update</small>
            </div>
            {/* ))} */}
          </div>
          {/* {physbranch} */}
          <div style={{ display: "none" }} >

            <PrintPhys

              date={physdate}
              branch={physbranch}
              allitems={allitems}
              ref={el => (this.componentRef = el)}

            />
          </div>

        </div>

        <div style={{ display: "none" }}>
          <PrintReportItem
            data={allitems}
            datamis={modalData}
            print="normal"
            date={physdate}
            sysdate={sysphysdate}
            branch={physbranch}
            total_missed={total_missed}
            // sdate={this.props.location.state.begDate}
            // edate={this.props.location.state.endDate}
            // type={this.props.location.state.type}
            ref={el => (this.itemRef = el)}
          />
        </div>

        <br /><br /><br />
        {/* <br /><br /><br /> */}

        { load == true ? <Loader active inline='centered' /> : false}
        <small>Total Mismatched collectibles</small><small style={{ float: "right" }}>To enter physical count amount, click each item's physical count cell</small>
        <h3>{formatter.format(total_missed)}</h3>
        {/* {this.state.prevData} */}
        <div style={{ zoom: "80%" }}>
          <BootstrapTable
            ref='table'
            data={sorted}
            // data={allitems}
            pagination={true}
            search={true}
            cellEdit={cellEditProp}
          // options={options} exportCSV
          >

            <TableHeaderColumn dataField='code' editable={false} width="145"  >Code</TableHeaderColumn>
            <TableHeaderColumn dataField='item_id' isKey={true} hidden={true} >Description</TableHeaderColumn>
            <TableHeaderColumn dataField='name' tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} width="200" editable={false}  >Description</TableHeaderColumn>
            <TableHeaderColumn dataField='brand' tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} editable={false} width="100"  >Brand</TableHeaderColumn>
            <TableHeaderColumn dataField='size' editable={false} width="80"   >Size</TableHeaderColumn>
            <TableHeaderColumn dataField='unit' editable={false} width="80"  >Unit</TableHeaderColumn>
            <TableHeaderColumn dataField='category_id' hidden={true} >cat-d</TableHeaderColumn>
            <TableHeaderColumn dataField='unit_price' width="80" editable={false} >SRP</TableHeaderColumn>
            <TableHeaderColumn dataField='sys_count' className="upTabStyle" width="130" editable={false} >System Count</TableHeaderColumn>
            <TableHeaderColumn dataField='item_id' width="100" dataFormat={this.sys_col} >Amount</TableHeaderColumn>
            <TableHeaderColumn dataField='phys_count' className="upTabStyle" width="130" editable={{ validator: this.jobStatusValidator }}>Physical count</TableHeaderColumn>
            <TableHeaderColumn dataField='item_id' width="100" dataFormat={this.phys_col} >Amount</TableHeaderColumn>
            {/* <TableHeaderColumn dataField='name' width="50" dataFormat={this.buttonFormatter} ></TableHeaderColumn> */}
            <TableHeaderColumn dataField='item_id' width="130" dataFormat={this.diffTotal} >Collectible Diff.</TableHeaderColumn>
            <TableHeaderColumn dataField='date_mod' editable={false}  width="185"  >Date mod.</TableHeaderColumn>
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

export default connect(mapStateToProps)(SpecPhysicalCount);
