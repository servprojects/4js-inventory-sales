import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../Http';
import { Dropdown, Popup, Button } from 'semantic-ui-react';
import { Link, Redirect } from 'react-router-dom';
import 'semantic-ui-css/semantic.min.css';
// import SaleChart from './charts/saleschart';
import DlineSalesChart from './charts/dlsalesChart';
import { LoadingBar } from 'react-redux-loading-bar'
import classNames from 'classnames';
import ReactTooltip from "react-tooltip";
import ReactToPrint from "react-to-print";
import PrintReport from '../pages/prints/printReport';
import SystemUpdates from '../pages/reports/SystemUpdates';
import LiveData from './get_live_data';

class Dashboard extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);

    // Initial state.
    this.state = {
      todo: null,
      error: false,
      role: null,
      branch_id: null,
      accu_items: null,
      dis_accrec: { display: "none" },
      show_filt: { display: "none" },
      ads: { display: "none" },
      isdis_accrec_hide: "yes",
      data: [],
      directsales: null,
      // directsales: [],
      // custcharge: [],
      custcharge: null,
      // itemcollect: [],
      itemcollect: null,
      // colprojects: [],
      colprojects: null,
      allitemcollect: [],
      offcollect: [],
      // offcollect: null,

      directsalesTemp: null,
      // directsalesTemp: [],
      // itemcollectTemp: [],
      itemcollectTemp: null,
      custchargeTemp: null,
      // custchargeTemp: [],
      // colprojectsTemp: [],
      colprojectsTemp: null,
      offcollectTemp: [],
      // offcollectTemp: null,

      datasets: [],
      datasetsTemp: [],

      // paysups: [],
      paysups: null,
      cheques: [],

      load: false,
      sysmode: 'regular',



    };

    // API endpoint.
    this.api = '/api/v1/brand';
  }

  getSystemMode() {
    Http.post(`/api/v1/sysmode`)
      .then(({ data }) => {
        console.log("data.spec")
        console.log(data.spec)

       
       
        if (this._isMounted) { this.setState({ sysmode: data.spec }); };
      })
      .catch(() => {
        this.setState({
          error: 'Unable to fetch data.',
          load: false,
        });
      });
  }

  componentDidMount() {
    this.getSystemMode();
    this.getData()

  }

  getData() {
   
    this._isMounted = true
    if (this._isMounted) { this.setState({ load: true }); };
    // Http.get(`/api/v1/header/user`)
    // Http.get(`/api/v1/dash/index`)
    Http.post(`/api/v1/dash/index`)
      .then((response) => {
        // const { data } = response.data.header;
        if (this._isMounted) {
          this.setState({
            // data: response.data.header,
            directsales: response.data.directsales,
            itemcollect: response.data.itemcollect,

            // itemcollect: response.data.itemcollect,
            allitemcollect: response.data.allitemcollect,
            custcharge: response.data.custcharge,
            colprojects: response.data.colprojects,
            offcollect: response.data.offcollect,
            datasets: response.data.datasets,

            directsalesTemp: response.data.directsales,
            // itemcollectTemp: response.data.itemcollect,
            itemcollectTemp: response.data.itemcollect,
            custchargeTemp: response.data.custcharge,
            colprojectsTemp: response.data.colprojects,
            offcollectTemp: response.data.offcollect,
            datasetsTemp: response.data.datasets,

            cheques: response.data.cheques,
            paysups: response.data.paysups,


            role: response.data.role,
            error: false,
            load: false,
          });

          console.log("loadhhhh")
          console.log(response.data.itemcollect)
        }
      })
      .catch(() => {
        this.setState({
          error: 'Unable to fetch data.',
          load: false,
        });
      });

   

  }



  handleChange = (e) => {
    const { name, value } = e.target;
    // if (this._isMounted) {
    // this.setState({ [name]: value });
    // }
    var subs;
    if (this.state.branch_id) {
      subs = {
        branch_id: this.state.branch_id,
        year: value
      }
    } else {
      subs = {
        year: value
      }
    }
    Http.post(`/api/v1/charts/sales`, subs)
      .then((response) => {
        // const { data } = response.data.header;
        if (this._isMounted) {
          this.setState({
            // data: response.data.header,

            datasets: response.data.datasets,

          });
        }
      })
      .catch(() => {
        this.setState({
          error: 'Unable to fetch data.',
        });
      });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { todo } = this.state;
    this.addTodo(todo);
  };

  addTodo = (todo) => {
    Http.post(this.api, { name: todo })
      .then(({ data }) => {
        const newItem = {
          id: data.id,
          name: todo,
        };
        const allTodos = [newItem, ...this.state.data];
        this.setState({ data: allTodos, todo: null });
        this.todoForm.reset();
      })
      .catch(() => {
        this.setState({
          error: 'Sorry, there was an error saving your to do.',
        });
      });
  };

  closeTodo = (e) => {
    const { key } = e.target.dataset;
    const { data: todos } = this.state;

    Http.patch(`${this.api}/${key}`, { status: 'closed' })
      .then(() => {
        const updatedTodos = todos.filter(
          (todo) => todo.id !== parseInt(key, 10),
        );
        this.setState({ data: updatedTodos });
      })
      .catch(() => {
        this.setState({
          error: 'Sorry, there was an error closing your to do.',
        });
      });
  };
  dissAccRec = (item) => {
    this._isMounted = true
    if (this._isMounted) {

      if (this.state.isdis_accrec_hide == "yes") {
        this.setState({
          isdis_accrec_hide: "no", dis_accrec: { display: "block" }
        });
      } else {
        this.setState({
          isdis_accrec_hide: "yes", dis_accrec: { display: "none" }
        });
      }
    }
  }

  myChangeHandlerbranch = (e, { value }) => {
    if (this._isMounted) {
      this.setState({ branch_id: value });
    }
    Http.post(`/api/v1/dash/index`, { branch_id: value })
      .then((response) => {
        // const { data } = response.data.header;
        if (this._isMounted) {
          this.setState({
            // data: response.data.header,
            directsales: response.data.directsales,
            itemcollect: response.data.itemcollect,
            custcharge: response.data.custcharge,
            colprojects: response.data.colprojects,
            offcollect: response.data.offcollect,
            datasets: response.data.datasets,

          });
        }
      })
      .catch(() => {
        this.setState({
          error: 'Unable to fetch data.',
        });
      });
  };
  handleYear = (e, { value }) => {
    var subs;
    if (this.state.branch_id) {
      subs = {
        branch_id: this.state.branch_id,
        year: value
      }
    } else {
      subs = {
        year: value
      }
    }
    Http.post(`/api/v1/charts/sales`, subs)
      .then((response) => {
        // const { data } = response.data.header;
        if (this._isMounted) {
          this.setState({
            // data: response.data.header,

            datasets: response.data.datasets,

          });
        }
      })
      .catch(() => {
        this.setState({
          error: 'Unable to fetch data.',
        });
      });

  }
  reset_branch = (e) => {

    if (this._isMounted) {
      this.setState({
        // data: response.data.header,
        directsales: this.state.directsalesTemp,
        itemcollect: this.state.itemcollectTemp,
        custcharge: this.state.custchargeTemp,
        colprojects: this.state.colprojectsTemp,
        offcollect: this.state.offcollectTemp,
        datasets: this.state.datasetsTemp,

      });

    };
  }

  printDash = (e) => {
    const { directsales, itemcollect, custcharge, colprojects, paysups, offcollect, cheques, role, allitemcollect } = this.state;
    var dr_sales = 0;
    var itmcol = 0;
    var cstcharge = 0;
    var prjcharge = 0;
    var pysup = 0;
    var ofcol = 0;
    var receivable = 0;

    itmcol = itemcollect;
    dr_sales = directsales;
    cstcharge = custcharge;
    prjcharge = colprojects;
    offcollect.map((itemex) => (ofcol += itemex.balance))
    pysup = paysups;
    receivable = itmcol + cstcharge + prjcharge + ofcol;

    const formatter = new Intl.NumberFormat('fil', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    })

    const accuDigits = [{
      drsales: formatter.format(dr_sales), acctPay: formatter.format(pysup), acctsRec: formatter.format(receivable)
    }]

    const cols = [{
      part: "Customer",
      amount: custcharge
    }, {
      part: "Project",
      amount: colprojects
    }, {
      part: "Office",
      amount: ofcol
    }]


    return (
      <>
        <hr />
        <small><i>*Charge receivables can also be receivables to other branches</i></small><br />
        Accumulated Digits<br /><br />
        <BootstrapTable
          data={accuDigits}
        >
          <TableHeaderColumn dataField='drsales' isKey={true}>Direct Sales</TableHeaderColumn>
          <TableHeaderColumn dataField='acctPay' >Accounts Payable</TableHeaderColumn>
          <TableHeaderColumn dataField='acctsRec' >Accounts Receivable</TableHeaderColumn>
        </BootstrapTable>
        <br />
        Item Collectibles<br /><br />
        <BootstrapTable
          data={allitemcollect}
        >

          <TableHeaderColumn isKey={true} dataField='branch' >Branch</TableHeaderColumn>
          <TableHeaderColumn dataField='total' >Amount</TableHeaderColumn>
        </BootstrapTable>
        <br />
        Charge Collectibles<br /><br />
        <BootstrapTable
          data={cols}
        >

          <TableHeaderColumn isKey={true} dataField='part' >Particulars</TableHeaderColumn>
          <TableHeaderColumn dataField='amount' >Amount</TableHeaderColumn>
        </BootstrapTable>
        <br />
        Upcoming bank payments <small><i>*5 days before the dated cheque</i></small><br /><br />
        <BootstrapTable

          data={cheques}


        >
          <TableHeaderColumn dataField='id' isKey={true} hidden={true}></TableHeaderColumn>
          <TableHeaderColumn dataField='code' hidden={true}>Code</TableHeaderColumn>
          <TableHeaderColumn dataField='supplier' >Supplier</TableHeaderColumn>
          <TableHeaderColumn dataField='date' >Cheque Date</TableHeaderColumn>
          <TableHeaderColumn dataField='amount'>Amount</TableHeaderColumn>
          <TableHeaderColumn dataField='days'>Days Left</TableHeaderColumn>
        </BootstrapTable>
      </>
    );
  }

  upcomingbankpayments(_ads, cheques) {
    return (
      <>
        <div style={_ads}>
          <div class="uppaymts shadow"  >
            <div class="uppaymts_cont">
              <h3 class="inline_block">  Upcoming Bank Payments </h3><i data-tip="Upcoming payments, this counts 5 days before the dated cheque." data-for="pdc" class="question circle outline icon"></i>
              <ReactTooltip
                id="pdc"
                effect="float"
              />
              <BootstrapTable
                ref='table'
                data={cheques}
                pagination={false}
                search={true}
                maxHeight="200px"
                trClassName="trBtsClass"
              // options={options} exportCSV
              >
                <TableHeaderColumn dataField='id' isKey={true} hidden={true}></TableHeaderColumn>
                <TableHeaderColumn dataField='code' hidden={true}>Code</TableHeaderColumn>
                <TableHeaderColumn dataField='supplier' >Supplier</TableHeaderColumn>
                <TableHeaderColumn dataField='date' >Cheque Date</TableHeaderColumn>
                <TableHeaderColumn dataField='amount'>Amount</TableHeaderColumn>
                <TableHeaderColumn dataField='days'>Days Left</TableHeaderColumn>
                <TableHeaderColumn dataField='id' hidden={true} dataFormat={this.btnFormatterConfirm}></TableHeaderColumn>
              </BootstrapTable>
            </div>
          </div>
        </div>

      </>
    )
  }

  accountsPayable(pysup, formatter) {
    return (
      <>
        <div class="card mb-3" style={{ width: "150%" }}  >
          <div class="row no-gutters">
            <div class="col-md-4 cradbg">
              {/* <i class="fas fa-coins cardIcon"></i> */}
              <i class="industry icon cardIcon"></i>
            </div>
            <div class="col-md-8">
              <div class="card-body">
                <h5 class="card-title inline_block">Accounts Payable</h5><i data-tip="Accumulated payables to Suppliers " data-for="payable" class="question circle outline icon"></i>
                <p class="card-text"><b>{formatter.format(pysup)}</b></p>
                <ReactTooltip
                  id="payable"
                  effect="float"
                />
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }


  accountsReceivable(receivable, formatter) {
    return (<>
      <div class="card mb-3" style={{ width: "150%" }} onClick={this.dissAccRec}  >
        <div class="row no-gutters">
          <div class="col-md-4 cradbg">
            {/* <i class="fas fa-coins cardIcon"></i> */}
            <i class="tags icon cardIcon"></i>
          </div>
          <div class="col-md-8">
            <div class="card-body">
              <h5 class="card-title inline_block">Accounts Receivable</h5><i data-tip="Accumulated receivables from Items, Projects, Customers, and Branches" data-for="rec" class="question circle outline icon"></i>
              <ReactTooltip
                id="rec"
                effect="float"
              />
              <p class="card-text"><b>{formatter.format(receivable)}</b></p>
              <p class="card-text"><small><i>*Click to expand receivables</i></small></p>

            </div>
          </div>
        </div>
      </div>

    </>)
  }

  render() {
    const { load, data, error, accu_items, directsales, itemcollect, custcharge, colprojects, paysups, offcollect, cheques, role } = this.state;
    var dr_sales = 0;
    var itmcol = 0;
    var cstcharge = 0;
    var prjcharge = 0;
    var pysup = 0;
    var ofcol = 0;
    var receivable = 0;

    // directsales.map((itemex) => (dr_sales += itemex.ds_subtotal))
    // itemcollect.map((itemex) => (itmcol += itemex.collectible_amount))
    itmcol = itemcollect;
    dr_sales = directsales;
    // custcharge.map((itemex) => (cstcharge += itemex.cc_subtotal))
    cstcharge = custcharge;
    // colprojects.map((itemex) => (prjcharge += itemex.balance))
    prjcharge = colprojects;
    offcollect.map((itemex) => (ofcol += itemex.balance))
    // ofcol = offcollect;
    // paysups.map((itemex) => (pysup += itemex.balance))
    pysup = paysups;
    receivable = itmcol + cstcharge + prjcharge + ofcol;
    // receivable = itemcollect + cstcharge + prjcharge + ofcol;


    const formatter = new Intl.NumberFormat('fil', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    })

    const styles = {
      fontFamily: 'sans-serif',
      textAlign: 'center',

    };
    var accountitle = { width: "100%", position: "absolute" };
    var _ads = this.state.ads;
    if (this.state.role == "Superadmin" || this.state.role == "Admin") {
      _ads = { display: "block", width: "150%" };
      accountitle = { width: "100%", position: "relative" };
    }


    const allrec = this.state.dis_accrec;
    const branches = offcollect.map((brnch) => ({ key: brnch.id, value: brnch.id, text: brnch.name }));


    this.years = function (startYear) {
      var currentYear = new Date().getFullYear(), years = [];
      startYear = startYear || 2000;
      while (startYear <= currentYear) {
        years.push(startYear++);
      }
      return years;
    }
    // const branches = offcollect.map((brnch) => ({ key: brnch.id, value: brnch.id, text: brnch.name }));
    // console.log(this.years(2019 - 20));

    const all_yrs = this.years(2018);
    const yrs = all_yrs.map((year) => ({ key: year, value: year, text: year }));

    console.log(yrs)
    const allyear = this.years(2019 - 20);
    // console.log(this.years(2019 - 20));

    var _show_filt = this.state.show_filt;
    if (role == "Superadmin") {
      _show_filt = { display: "block" }
    }
    // console.log(this.state.directsales)



    return (




      <div>
        {this.state.sysmode == 'pos' ? <LiveData /> : <></>}
        <div className={classNames('ui  inverted dimmer loads', {
          'active': load,
        })} >
          <center>
            <div class="ui text loader">Loading</div>
          </center>
        </div>
        <div className="contentDash" >



          <div style={{ display: "none" }}>
            <PrintReport
              itms={this.printDash()}
              details="System dashboard report"
              ref={el => (this.componentRefmis = el)}

            />

          </div>

          {/* <LoadingBar /> */}




          {/* <div class="inline_block" style={{ position: 'absolute', width: '60%', left: '50%' }}> */}
          <div style={{ width: "100%" }}>
            <div class="inline_block" style={{ width: "70%" }}>
              <div style={{ width: "65%", position: "absolute", top: "0" }}>
                <ReactToPrint

                  trigger={() =>
                    <Button circular icon='print' />}
                  content={() => this.componentRefmis}
                />
                <div style={styles}>
                  {/* <SaleChart
                data={this.state.datasets}
                type="Sales"
              /> */}

                  <DlineSalesChart
                    data={this.state.datasets}
                    type="Sales"
                  />
                </div>
                <div style={_show_filt}>
                  <div style={{ width: "100%" }}>
                    <div class="inline_block">
                      <Dropdown
                        type="select"
                        placeholder='Branch'
                        fluid
                        search
                        selection
                        // style={req_inpt}
                        onChange={this.myChangeHandlerbranch}
                        options={branches}
                        id="addItem"
                        name="brand_id"
                        required
                      />
                    </div>

                    &nbsp; &nbsp; &nbsp;
                    <div class="inline_block">
                      {/* <select class="form-control mb-2 mr-md-2" onChange={this.handleChange}>
                    {this.years(2018).map(year => (

                      <option value={year}>{year}</option>

                    ))}
                   
                  </select> */}
                      <Dropdown
                        type="select"
                        placeholder='Year'
                        fluid
                        search
                        selection
                        // style={req_inpt}
                        onChange={this.handleYear}
                        options={yrs}
                        id="addItem"
                        name="brand_id"
                        required
                      />
                    </div>

                    &nbsp; &nbsp; &nbsp;
                    <div class="inline_block">
                      <i class="undo icon" onClick={this.reset_branch}></i>
                    </div>

                  </div>



                </div>
                <hr />
                {
                  role === "Superadmin" ?
                    <>{this.state.sysmode != 'pos' ? this.upcomingbankpayments(_ads, cheques) : <></>}</>
                    : <div style={{ width: "1080px" }}></div>
                }
                {/* {this.state.role} */}

                <br /><br /><br /><br />
              </div>
            </div>
            {/* </div> */}
            <div class="inline_block" style={{ width: "20%" }}>


              <div class="card mb-3" style={{ width: "150%" }}  >
                <div class="row no-gutters">
                  <div class="col-md-4 cradbg">
                    {/* <i class="fas fa-coins cardIcon"></i> */}
                    <i class="money icon cardIcon"></i>
                  </div>
                  <div class="col-md-8">
                    <div class="card-body">
                      <h5 class="card-title inline_block">Direct Sales</h5>  <i data-tip data-for="drsales" class="question circle outline icon"></i>
                      <p class="card-text"><b>{formatter.format(dr_sales)}</b></p>

                    </div>
                  </div>
                </div>
              </div>
              {
                role === "Superadmin" ?
                  <>{this.state.sysmode != 'pos' ? this.accountsPayable(pysup, formatter) : <></>}</>
                  : <></>
              }

              {this.state.sysmode != 'pos' ?
                <>{this.accountsReceivable(receivable, formatter)}</>
                : <></>
              }

              <div style={allrec}>
                <div class="card mb-3" style={{ width: "150%" }}  >
                  <div class="row no-gutters">
                    <div class="col-md-4 cradbg">
                      {/* <i class="fas fa-coins cardIcon"></i> */}
                      <i class="shopping basket icon cardIcon"></i>
                    </div>
                    <div class="col-md-8">
                      <div class="card-body">
                        <h5 class="card-title">Items</h5>
                        <p class="card-text"><b>{formatter.format(itmcol)}</b></p>

                      </div>
                    </div>
                  </div>
                </div>
                <div class="card mb-3" style={{ width: "150%" }}  >
                  <div class="row no-gutters">
                    <div class="col-md-4 cradbg">
                      {/* <i class="fas fa-coins cardIcon"></i> */}
                      <i class="users icon cardIcon"></i>
                    </div>
                    <div class="col-md-8">
                      <div class="card-body">
                        <h5 class="card-title">Customers</h5>
                        <p class="card-text"><b>{formatter.format(cstcharge)}</b></p>

                      </div>
                    </div>
                  </div>
                </div>
                <div class="card mb-3" style={{ width: "150%" }}  >
                  <div class="row no-gutters">
                    <div class="col-md-4 cradbg">
                      {/* <i class="fas fa-coins cardIcon"></i> */}
                      <i class="building icon cardIcon"></i>
                    </div>
                    <div class="col-md-8">
                      <div class="card-body">
                        <h5 class="card-title">Projects</h5>
                        <p class="card-text"><b>{formatter.format(prjcharge)}</b></p>

                      </div>
                    </div>
                  </div>
                </div>
                <div class="card mb-3" style={{ width: "150%" }}  >
                  <div class="row no-gutters">
                    <div class="col-md-4 cradbg">
                      {/* <i class="fas fa-coins cardIcon"></i> */}
                      <i class="warehouse icon cardIcon"></i>
                    </div>
                    <div class="col-md-8">
                      <div class="card-body">
                        <h5 class="card-title">Office</h5>

                        <p class="card-text"><b>{formatter.format(ofcol)}</b></p>

                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {this.state.sysmode != 'pos' ? <SystemUpdates /> : <></>}

            </div>
          </div>
          <br />



        </div>


        <ReactTooltip id='drsales' place="right" effect="float" aria-haspopup='true' >
          <span>Accumulated cash received from Direct Sales (It includes raw sales <i><small>*item's SRP x qty</small></i>, <br />delivery fee, and discount)</span>
        </ReactTooltip>


      </div>



    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: state.Auth.isAuthenticated,
  user: state.Auth.user,
});

export default connect(mapStateToProps)(Dashboard);
