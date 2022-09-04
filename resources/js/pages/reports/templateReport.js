import React, { Component, useState } from 'react';
import { connect } from 'react-redux';
import Http from '../../Http';
import classNames from 'classnames';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { DateRangePicker } from 'react-date-range';
import { addDays } from 'date-fns';
import ReactToPrint from "react-to-print";
import PrintReport from '../prints/printReport';
// import ExRep from '../prints/excelReports';
import PrintReportItem from '../prints/printReportItem';
// import SimpleDR from '../reports/simpleDateRangeForm';
// import IndvItems from '../reports/indvItems';
import CSVReader from 'react-csv-reader'
import SaleChart from '../charts/saleschart';
import DlineChart from '../charts/doublelineChart';
import update from 'immutability-helper';
import { Dropdown, Icon, Button } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { withRouter } from 'react-router'
import { PropTypes } from "prop-types";
import { id } from 'date-fns/esm/locale';
import PrintPayCharge from '../transactions/Invoices/paycharge';
import ComponentToPrint from "../transactions/Invoices/sale_charge";
import ComponentToPrintReg from '../new_pos/components/receipt/sale_receipt';
import UpToggle from '../reports/upToggleCashOnHAnd';
import ReactHTMLTableToExcel from 'react-html-table-to-excel';

class TemplateReport extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);

    // Initial state.
    this.state = {
      location: PropTypes.object.isRequired,
      error: null,
      upIdItem: null,
      repCode: null,
      relCode: null,
      retCode: null,
      sdate: null,
      edate: null,
      pur_type: null,
      year: null,
      nip: null,
      granted: null,
      mod_date: null,
      reason: null,
      type: null,
      upD_date: null,
      role: null,
      upD_id: null,
      upD_trcode: null,
      upD_charge_code: null,
      upD_type: null,
      exData: null,

      data: [],
      branches: [],
      details: [],
      tranItems: [],
      replacement: [],
      imported: [],
      dataset: [],
      datasetTemp: [],
      imported: [],
      permission: [],

      sysmode: "normal",
      datesel: [
        {
          startDate: new Date(),
          endDate: addDays(new Date(), 7),
          key: 'selection'
        }
      ],
    };
    // API endpoint.
    this.api = '/api/v1/reports/sales';

  }
  componentDidMount() {
    this._isMounted = true
    Http.get(`${this.api}`)
      .then((response) => {
        // const { data } = response.data.transaction.data;
        if (this._isMounted) {

          this.setState({
            branches: response.data.branches,
            role: response.data.role,

          });
        }
        // console.log(response.data.branches)
      })

      .catch(() => {
        if (this._isMounted) {
          this.setState({
            error: 'Unable to fetch data.',
          });
        }
      });

    if (this._isMounted) {

      this.setState({
        sdate: this.props.sdate,
        edate: this.props.edate,

      });
    }
    this.getSystemMode()
    this.getPermission()
  }

  // componentDidUpdate() {
  //   this._isMounted = true;
  //   if (this._isMounted) {

  //     this.setState({
  //       sdate: this.props.sdate,
  //       edate: this.props.edate,

  //     });
  //   }
  // }


  getPermission() {
    Http.get(`/api/v1/header/user`)
      .then(({ data }) => {
        var perm = JSON.parse(data.header[0].permission);
        console.log("perm")
        console.log(perm)
        if (this._isMounted) { this.setState({ permission: perm.length > 0 ? perm : [""] }); };
      })
      .catch(() => {
        this.setState({
          error: 'Unable to fetch data.',
          load: false,
        });
      });
  }


  handleChange = (e) => {
    this._isMounted = true

    const { name, value } = e.target;


    if (this._isMounted) {
      if (name == "npip") {
        this.setState({ nip: value });
      } else {
        this.setState({ [name]: value });
      }


    }
  };
  exitSupAcc = (e) => {
    this._isMounted = true;
    if (this._isMounted) {
      this.setState({
        granted: "no"
      })
    }

  }

  setUpId = (e) => {
    this._isMounted = true
    const { key, type } = e.target.dataset;
    if (this._isMounted) {
      this.setState({
        upIdItem: key, repCode: null,
        relCode: null,
        type: type,
        retCode: null, details: [], tranItems: [],
        replacement: []
      })
    }
    // toast("test");
    // console.log("test")
    // console.log(key)
    Http.post(`/api/v1/reports/saleItems`, { id: key })
      .then((response) => {
        // const { data } = response.data.transaction.data;
        if (this._isMounted) {



          this.setState({
            tranItems: response.data.items,
            details: response.data.details,
            replacement: response.data.replacement,
            repCode: response.data.repCode,
            relCode: response.data.relCode,
            retCode: response.data.retCode,

          });
          // console.log("iiiiiiiii")
          // console.log(response.data.items)
          // console.log(response.data.details)
        }
      })

      .catch(() => {
        if (this._isMounted) {
          this.setState({
            error: 'Unable to fetch data.',
          });
        }
      });



  };

  handleChangePur = (e) => {
    this._isMounted = true
    const { type, branch } = e.target.dataset;
    const { name, value } = e.target;
    if (this._isMounted) {
      this.setState({ [name]: value });

    }
    // console.log(value)

    Http.post(`/api/v1/reports/chart`, { pur_type: value, year: this.state.year, type: type, branch_id: branch })
      .then((response) => {
        // const { data } = response.data.transaction.data;
        if (this._isMounted) {



          this.setState({
            datasets: response.data.datasets,


          });

        }
        // console.log(response.data.datasets)
      })

      .catch(() => {
        if (this._isMounted) {
          this.setState({
            error: 'Unable to fetch data.',
          });
        }
      });



  };
  handleChangeYear = (e) => {
    this._isMounted = true
    const { type, branch } = e.target.dataset;
    const { name, value } = e.target;
    if (this._isMounted) {
      this.setState({ [name]: value });

    }


    Http.post(`/api/v1/reports/chart`, { pur_type: this.state.pur_type, year: value, type: type, branch_id: branch })
      .then((response) => {
        // const { data } = response.data.transaction.data;
        if (this._isMounted) {



          this.setState({
            datasets: response.data.datasets,


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



  };
  ptab = (showItems, showRet, showRepl, tranItems, hidSup, print) => {
    var pag = true
    var se = true

    if (print == "print") {
      pag = false
      se = false
    }
    const total = (cell, row) => {
      return (
        <>
          {row.original_price * row.quantity}
        </>
      );
    }
    return (
      <div>
        <div class={showItems}  >
          <div class={showRet}>
            <hr />
            <h4>RETURNED ITEMS</h4>
          </div>
          <div class={showRepl}>
            <hr />
            <h4>REPLACED ITEMS</h4>
          </div>

          <BootstrapTable
            ref='table'
            data={tranItems}
            pagination={pag}
            search={se}
          // options={options} exportCSV
          >
            <TableHeaderColumn tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} dataField='item_status' >Status</TableHeaderColumn>
            <TableHeaderColumn tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} dataField='item_name' isKey={true}>Item Name</TableHeaderColumn>
            <TableHeaderColumn width="100" dataField='quantity'>Quantity</TableHeaderColumn>
            <TableHeaderColumn width="120" hidden={true} dataField='beg_balance'>Beg Item Bal</TableHeaderColumn>
            <TableHeaderColumn width="120" dataField='end_bal'>End Item Bal</TableHeaderColumn>
            <TableHeaderColumn width="200" hidden={hidSup} dataField='supplier'>Supplier</TableHeaderColumn>
            <TableHeaderColumn width="100" hidden={hidSup} dataField='original_price'>Org. <br /> Price</TableHeaderColumn>
            <TableHeaderColumn width="100" hidden={hidSup} dataField='original_price' dataFormat={total}>Total</TableHeaderColumn>
            <TableHeaderColumn width="100" dataField='unit_price'>SRP</TableHeaderColumn>
          </BootstrapTable>

        </div>
      </div>
    )
  }
  printDetailsEach = (e, print) => {
    const { tranItems, details, replacement } = this.state;
    const formatter = new Intl.NumberFormat('fil', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    })
    var hidSup = true;
    var showSale = "disnone"
    var showItems = "temp"
    var showPcBtn = "disnone"
    var showNonPcBtn = "disnone"
    var showReceiving = "disnone"
    var showReleasing = "disnone"
    var showPaycharge = "disnone"
    var showCredit = "disnone"
    var showRepl = "disnone"
    var showRet = "disnone"
    var showRetRepl = "disnone"
    var showDebit = "disnone"
    var showAccPay = "disnone"
    var showExPay = "disnone"

    // DIRECT SALE AND CHARGE
    if (e === "Direct Sale" || e === "Charge") { //last_here
      showSale = "temp"
      var showpartial = "disnone"
      var showamountres = "disnone"
      if (e === "Charge") {
        showpartial = {}
      }
      if (e === "Direct Sale") {
        showpartial = "disnone"
        showamountres = {}
      }

      var rtype = "Purchase no request";
      var rt;
      details.map((d) => (
        rt = d.req_type
      ))

      if (!!rt) {
        rtype = rt;
      }
      // console.log("rt")
      // console.log(rt)
      //   if (variable == null){
      //     // your code here.
      // }

      // rtype = "Purchase no request";

      // console.log("tranItems")
      // console.log(tranItems)


      console.log("set for new receipt")
      console.log(details)
      console.log(tranItems)
      console.log("details[0]")
      console.log(details[0])

      return (
        <div>

          <div class={showSale}>
            <ReactToPrint

              trigger={() => <i class="print icon regIcon"></i>}
              ref={ref => this.ref = ref}
              content={() => this.componentRefSC}
            />

            {details.map((d) => (
              <div>
                <table class="table-borderless table-sm " >
                  <tr>
                    <td>
                      <div class="inline_block">
                        <table class="table-borderless table-sm  printDet">
                          <tr>
                            <td>
                              <tr><td><b>Transaction Details</b></td><td></td><td></td></tr>
                              <tr><td>Code</td><td>:</td><td>{d.code}</td></tr>
                              <tr><td>Transaction date</td><td>:</td><td>{d.date_transac}</td></tr>
                              <tr><td>Transaction type</td><td>:</td><td>{e}</td></tr>
                              <tr><td>Customer name</td><td>:</td><td>{d.customer_name}</td></tr>
                              <tr><td>Accountability</td><td>:</td><td>{d.accountability}</td></tr>
                              <tr><td>Transaction branch</td><td>:</td><td>{d.branch}</td></tr>
                              <tr><td>Date Printed</td><td>:</td><td>{d.date_printed}</td></tr>
                            </td>
                          </tr>
                        </table>
                      </div>
                    </td>
                    <td>
                      <div class="inline_block">
                        <table class="table-borderless table-sm  printDet">
                          <tr>
                            <td>
                              <tr><td><b>Delivery Details</b></td><td></td><td></td></tr>
                              <tr><td>Address</td><td>:</td><td>{d.address}</td></tr>
                              <tr><td>Contact no.</td><td>:</td><td>{d.contact}</td></tr>
                            </td>
                          </tr>
                        </table>
                      </div>
                    </td>
                    <td>
                      <div class="inline_block">
                        <table class="table-borderless table-sm  printDet">
                          <tr>
                            <td>
                              <tr><td><b>Payment Details</b></td><td></td><td></td></tr>
                              <tr><td>Delivery fee</td><td>:</td><td>{formatter.format(d.delivery_fee)}</td></tr>
                              <tr><td>Discount</td><td>:</td><td>{formatter.format(d.discount)}</td></tr>
                              <tr><td>Amount Due</td><td>:</td><td>{formatter.format(d.payable)}</td></tr>
                              <tr class={showamountres}><td>Amount Received</td><td>:</td><td>{formatter.format(d.amount_received)}</td></tr>
                              <tr class={showpartial}><td>Partial Payment</td><td>:</td><td>{formatter.format(d.partial)}</td></tr>
                              <tr><td>{d.imported == 'yes' ? <b>Imported</b> : <></>}</td><td></td><td></td></tr>
                            </td>
                          </tr>
                        </table>
                      </div>
                    </td>
                    <td>
                      <tr><td><b>Prepared By: </b> {d.prepare} </td></tr>

                    </td>
                  </tr>
                </table>

                <div style={{ display: "none" }}>

                  {
                    this.state.sysmode != 'pos' ?
                      <ComponentToPrint
                        name={d.customer_name}
                        discount={d.discount}
                        payable={d.payable}
                        delivery_fee={d.delivery_fee}
                        items={tranItems}
                        // date={this.state.live_date}
                        code={d.code}
                        type={e}
                        ref={el => (this.componentRefSC = el)}
                        amountres={d.amount_received}
                        cashier={d.prepare}
                        branch={d.branch}
                        printdate={d.date_transac}
                        // partial={this.state.partialAmountCharge}
                        dev_add={d.address}
                        dev_cont={d.contact}
                        series_no={d.series_no}
                        curBranch={d.branch_id}
                      // ref={componentRef}

                      />

                      :
                      <ComponentToPrintReg items={tranItems} rctype="report" time={d.date_printed} data={details[0]} ref={el => (this.componentRefSC = el)} />
                  }
                </div>
              </div>


            ))
            }
          </div >
          <br />
          {this.ptab(showItems, showRet, showRepl, tranItems, hidSup, print)}




        </div >
      )
    }
    // RECEIVING
    if (e === "Import") {
      showReceiving = "temp"
      hidSup = false;

      return (
        <div>
          <table class="table-borderless table-sm " >
            <div class={showReceiving}>

              <ReactToPrint

                trigger={() => <i class="print icon regIcon"></i>} //last_here_to

                content={() => this.reff}
              />

              {details.map((d) => (
                <div>

                  <tr><td>Code</td><td>:</td><td>{d.code}</td></tr>
                  <tr><td>Transaction date</td><td>:</td><td>{d.date_transac}</td></tr>
                  <tr><td>Transaction type</td><td>:</td><td>{e}</td></tr>
                  <tr><td>Transaction branch</td><td>:</td><td>{d.branch}</td></tr>
                  {/* <tr><td>Supplier credit code</td><td>:</td><td>{d.credit == null ? "Purchase with cash" : d.credit}</td></tr> */}
                  {/* <tr><td>Receiving type</td><td>:</td><td>{rtype}</td></tr> */}
                  {/* <tr><td>Receiving type</td><td>:</td><td>{d.req_type == null ? "Purchase no request" : d.req_type}</td></tr> */}
                  {/* <tr><td>Request code</td><td>:</td><td>{d.req_code}</td></tr> */}
                  {/* <tr><td>Amount Due</td><td>:</td><td>{formatter.format(d.payable)}</td></tr> */}
                  {/* <tr><td>{d.imported == 'yes' ? <b>Imported</b> : <></>}</td><td></td><td></td></tr> */}
                </div>
              ))}

            </div>
          </table>
          <br />
          {this.ptab(showItems, showRet, showRepl, tranItems, hidSup, print)}
        </div>
      );
    }


    // RECEIVING
    if (e === "Receiving") {
      showReceiving = "temp"
      hidSup = false;

      return (
        <div>
          <table class="table-borderless table-sm " >
            <div class={showReceiving}>
              <ReactToPrint

                trigger={() => <i class="print icon regIcon"></i>} //last_here_to

                content={() => this.reff}
              />

              {details.map((d) => (
                <div>

                  <tr><td>Code</td><td>:</td><td>{d.code}</td></tr>
                  <tr><td>Transaction date</td><td>:</td><td>{d.date_transac}</td></tr>
                  <tr><td>Transaction type</td><td>:</td><td>{e}</td></tr>
                  <tr><td>Transaction branch</td><td>:</td><td>{d.branch}</td></tr>
                  <tr><td>Supplier credit code</td><td>:</td><td>{d.credit == null ? "Purchase with cash" : d.credit}</td></tr>
                  {/* <tr><td>Receiving type</td><td>:</td><td>{rtype}</td></tr> */}
                  <tr><td>Receiving type</td><td>:</td><td>{d.req_type == null ? "Purchase no request" : d.req_type}</td></tr>
                  <tr><td>Request code</td><td>:</td><td>{d.req_code}</td></tr>
                  <tr><td>Amount Due</td><td>:</td><td>{formatter.format(d.payable)}</td></tr>
                  <tr><td>{d.imported == 'yes' ? <b>Imported</b> : <></>}</td><td></td><td></td></tr>
                </div>
              ))}

            </div>
          </table>
          <br />
          {this.ptab(showItems, showRet, showRepl, tranItems, hidSup, print)}
        </div>
      );
    }

    // RELEASING
    if (e === "Releasing") {
      showReleasing = "temp"
      return (
        <div>
          <table class="table-borderless table-sm " >
            <div class={showReleasing}>
              <ReactToPrint

                trigger={() => <i class="print icon regIcon"></i>} //last_here_to

                content={() => this.reff}
              />
              {details.map((d) => (
                <div>

                  <tr><td>Code</td><td>:</td><td>{d.code}</td></tr>
                  <tr><td>Transaction date</td><td>:</td><td>{d.date_transac}</td></tr>
                  <tr><td>Transaction type</td><td>:</td><td>{e}</td></tr>
                  <tr><td>Transaction branch</td><td>:</td><td>{d.branch}</td></tr>
                  <tr><td>Branch requestor</td><td>:</td><td>{d.requestor}</td></tr>
                  <tr><td>Receiving type</td><td>:</td><td>{rtype}</td></tr>
                  <tr><td>Request code</td><td>:</td><td>{d.req_code}</td></tr>
                  <tr><td>{d.imported == 'yes' ? <b>Imported</b> : <></>}</td><td></td><td></td></tr>
                </div>
              ))}
            </div>
          </table>
          <br />
          {this.ptab(showItems, showRet, showRepl, tranItems, hidSup, print)}
        </div>
      );

    }

    // DETAIL BUTTONS
    if (e === "Payment Charge" || e === "Credit" || e === "Debit" || e === "Account Payment" || e === "Excess Payment") {
      showItems = "disnone"
      showPcBtn = "temp"
      showNonPcBtn = "disnone"

    } else {
      showPcBtn = "disnone"
      showNonPcBtn = "temp"
    }

    // PAYMENT CHARGE
    if (e === "Payment Charge") {
      showPaycharge = "temp"
      showCredit = "disnone"

      return (
        <div>
          <table class="table-borderless table-sm " >
            <div class={showPaycharge}>
              <ReactToPrint

                trigger={() => <i class="print icon regIcon"></i>} //last_here_to

                content={() => this.payRef}
              />


              {details.map((d) => (
                <>
                  <div>
                    <tr>
                      <td>
                        <tr><td><b>Transaction Details</b></td><td></td><td></td></tr>
                        <tr><td>Code</td><td>:</td><td>{d.code}</td></tr>
                        <tr><td>Transaction date</td><td>:</td><td>{d.date_transac}</td></tr>
                        <tr><td>Transaction type</td><td>:</td><td>{e}</td></tr>
                        <tr><td>Customer name</td><td>:</td><td>{d.customer_name}</td></tr>
                        <tr><td>Accountability</td><td>:</td><td>{d.accountability}</td></tr>
                        <tr><td>Transaction branch</td><td>:</td><td>{d.branch}</td></tr>
                        <tr><td>Date Printed</td><td>:</td><td>{d.date_printed}</td></tr>
                        <tr><td><b>Payment Details</b></td><td></td><td></td></tr>
                        <tr><td>Amount due</td><td>:</td><td>{formatter.format(d.payable)}</td></tr>
                        <tr><td>Amount received</td><td>:</td><td>{formatter.format(d.amount_received)}</td></tr>
                        <tr><td><b>Charge Balance Details</b></td><td></td><td></td></tr>
                        <tr><td>Charge beginning balance</td><td>:</td><td>{formatter.format(d.beg_charge_bal)}</td></tr>
                        <tr><td>Charge ending balance</td><td>:</td><td>{formatter.format(d.end_charge_bal)}</td></tr>
                        <tr><td>{d.imported == 'yes' ? <b>Imported</b> : <></>}</td><td></td><td></td></tr>
                      </td>

                    </tr>
                  </div>

                  <div style={{ display: "none" }}>


                    <PrintPayCharge
                      printdate={d.date_transac}
                      custname={d.customer_name}
                      amountres={d.amount_received}
                      paid={d.payable}
                      code={d.code}
                      cashier={d.prepare}
                      branch={d.branch}
                      ref={el => (this.payRef = el)}
                    // ref={componentRef}

                    />

                  </div>
                </>
              ))}
            </div>
          </table>


        </div>
      );

    }

    // CREDIT
    if (e === "Credit") {
      showPaycharge = "disnone"
      showCredit = "temp"
      return (
        <div>
          <table class="table-borderless table-sm " >
            <div class={showCredit}>
              <ReactToPrint

                trigger={() => <i class="print icon regIcon"></i>} //last_here_to

                content={() => this.reff}
              />
              {details.map((d) => (
                <div>
                  <tr>
                    <td>
                      <tr><td><b>Transaction Details</b></td><td></td><td></td></tr>
                      <tr><td>Code</td><td>:</td><td>{d.code}</td></tr>
                      <tr><td>Transaction date</td><td>:</td><td>{d.date_transac}</td></tr>
                      <tr><td>Transaction type</td><td>:</td><td>{e}</td></tr>
                      <tr><td>Transaction branch</td><td>:</td><td>{d.branch}</td></tr>
                      <tr><td><b>Payment Details</b></td><td></td><td></td></tr>
                      <tr><td>Amount due</td><td>:</td><td>{formatter.format(d.payable)}</td></tr>
                      <tr><td><b>Charge Balance Details</b></td><td></td><td></td></tr>
                      <tr><td>Charge beginning balance</td><td>:</td><td>{formatter.format(d.beg_charge_bal)}</td></tr>
                      <tr><td>Charge ending balance</td><td>:</td><td>{formatter.format(d.end_charge_bal)}</td></tr>
                      <tr><td>{d.imported == 'yes' ? <b>Imported</b> : <></>}</td><td></td><td></td></tr>
                    </td>

                  </tr>
                </div>
              ))}
            </div>
          </table>


        </div>
      );
    }
    // UPDATE
    if (e === "Update") {
      showPaycharge = "disnone"
      showCredit = "temp"
      return (
        <div>
          <table class="table-borderless table-sm " >
            <div class={showCredit}>
              <ReactToPrint

                trigger={() => <i class="print icon regIcon"></i>} //last_here_to

                content={() => this.reff}
              />
              {details.map((d) => (
                <div>
                  <tr>
                    <td>
                      <tr><td><b>Transaction Details</b></td><td></td><td></td></tr>
                      <tr><td>Code</td><td>:</td><td>{d.code}</td></tr>
                      <tr><td>Item name</td><td>:</td><td>{d.customer_name}</td></tr>
                      <tr><td>Date Updated</td><td>:</td><td>{d.date_transac}</td></tr>
                      <tr><td>Transaction type</td><td>:</td><td>{e}</td></tr>
                      {d.accountability == "Admin" ?
                        <>
                          <tr><td><b>Stock Details</b></td><td></td><td></td></tr>
                          <tr><td>Old SRP</td><td>:</td><td>{d.code.substring(3, 0) === "UPS" ? formatter.format(d.beg_collectible / d.beg_balance) : formatter.format(d.unit_price)}</td></tr>
                          <tr><td>Updated SRP</td><td>:</td><td>{formatter.format(d.unit_price)}</td></tr>
                          <tr><td>Beginning balance</td><td>:</td><td>{d.beg_balance}</td></tr>
                          <tr><td>Ending balance</td><td>:</td><td>{d.end_balance}</td></tr>
                          <tr><td>Beginning collectible</td><td>:</td><td>{formatter.format(d.beg_collectible)}</td></tr>
                          <tr><td>Ending collectible</td><td>:</td><td>{formatter.format(d.end_collectible)}</td></tr>
                        </>
                        :
                        <>
                          <tr><td><b>Charge Details</b></td><td></td><td></td></tr>


                          <tr><td>Beginning balance</td><td>:</td><td>{formatter.format(d.beg_charge_bal)}</td></tr>
                          <tr><td>Ending balance</td><td>:</td><td>{formatter.format(d.end_charge_bal)}</td></tr>
                        </>
                      }
                      <tr><td>{d.imported == 'yes' ? <b>Imported</b> : <></>}</td><td></td><td></td></tr>
                      <tr><td>Reason for modification</td><td>:</td><td>{d.description}</td></tr>
                    </td>

                  </tr>
                </div>
              ))}
            </div>
          </table>


        </div>
      );
    }

    // RETURNED AND REPLACEMENT
    if (e === "Return" || e === "Replacement") {
      var total = 0;
      tranItems.map((d) => {
        total += parseFloat(d.quantity) * parseFloat(d.unit_price)
      })

      showRetRepl = "temp"
      if (e === "Return") {
        showRet = "temp"
      } else {
        showRepl = "temp"
      }
     
      var returnDet = [];
      returnDet.push(details[0])
      console.log("returnDet", returnDet)
      return (
        <div>
          <table class="table-borderless table-sm " >
            <div class={showRetRepl}>
              <ReactToPrint

                trigger={() => <i class="print icon regIcon"></i>} //last_here_to

                content={() => this.reff}
              />
                {
                 details[0] ? 
                  <>
                          {returnDet.map((d) => (
                        <div>
                          <td>
                            <tr><td><b>Transaction Details</b></td><td></td><td></td></tr>
                            <tr><td>Code</td><td>:</td><td>{d?.code}</td></tr>
                            <tr><td>Transaction date</td><td>:</td><td>{d?.date_transac}</td></tr>
                            <tr><td>Oroginal Transaction type</td><td>:</td><td>{d?.org_type}</td></tr>
                            <tr><td>Transaction type</td><td>:</td><td>{e}</td></tr>
                            <tr><td>Customer name</td><td>:</td><td>{d?.customer_name}</td></tr>
                            <tr><td>Accountability</td><td>:</td><td>{d?.accountability}</td></tr>
                            <tr><td>Transaction branch</td><td>:</td><td>{d?.branch}</td></tr>
                            <tr><td>Date Printed</td><td>:</td><td>{d?.date_printed}</td></tr>
                            <tr><td>Original sales code</td><td>:</td><td>{d?.org_code}</td></tr>
                            <tr><td>{d.imported == 'yes' ? <b>Imported</b> : <></>}</td><td></td><td></td></tr>
                          </td>
                          <td>

                            {/* <tr><td>Total item value</td><td>:</td><td>{formatter.format(d.payable)}</td></tr> */}
                            {/* {e === "Replacement"? <tr><td>Delivery fee</td><td>:</td><td>{formatter.format(d.delivery_fee)}</td></tr> : <></>} */}
                            {e === "Replacement" ? <tr><td>Total item replaced value</td><td>:</td><td>{formatter.format(total)}</td></tr> : <></>}
                            {e === "Return" ? <tr><td>Total item returned value</td><td>:</td><td>{formatter.format(total)}</td></tr> : <></>}
                            {/* <tr><td><b>References</b></td><td></td><td></td></tr>
                                  <tr><td>Released items code</td><td>:</td><td>{this.state.relCode}</td></tr>
                                  <tr><td>Returned items code</td><td>:</td><td>{this.state.retCode}</td></tr>
                                  <tr><td>Replaced items code</td><td>:</td><td>{this.state.repCode}</td></tr> */}
                          </td>
                        </div>
                      ))}
                  </> : 
                  <>
                  </>
                }




              
            </div>
          </table>
          <br />
          {this.ptab(showItems, showRet, showRepl, tranItems, hidSup, print)}
        </div>
      );
    }

    // Debit
    if (e === "Debit") {
      showDebit = "temp"
      return (
        <div>
          <table class="table-borderless table-sm " >
            <div class={showDebit}>
              <ReactToPrint

                trigger={() => <i class="print icon regIcon"></i>} //last_here_to

                content={() => this.reff}
              />
              {details.map((d) => (
                <div>
                  <tr>
                    <td>
                      <tr><td><b>Transaction Details</b></td><td></td><td></td></tr>
                      <tr><td>Code</td><td>:</td><td>{d.code}</td></tr>
                      <tr><td>Transaction date</td><td>:</td><td>{d.date_transac}</td></tr>
                      <tr><td>Transaction type</td><td>:</td><td>{e}</td></tr>
                      <tr><td>Customer name</td><td>:</td><td>{d.customer_name}</td></tr>
                      <tr><td>Accountability</td><td>:</td><td>{d.accountability}</td></tr>
                      <tr><td>Transaction branch</td><td>:</td><td>{d.branch}</td></tr>
                      <tr><td>Date Printed</td><td>:</td><td>{d.date_printed}</td></tr>
                      <tr><td>Amount debited</td><td>:</td><td>{formatter.format(d.payable)}</td></tr>
                      <tr><td><b>Charge Balance Details</b></td><td></td><td></td></tr>
                      <tr><td>Charge beginning balance</td><td>:</td><td>{formatter.format(d.beg_charge_bal)}</td></tr>
                      <tr><td>Charge ending balance</td><td>:</td><td>{formatter.format(d.end_charge_bal)}</td></tr>
                      {/* <tr><td><b>References</b></td><td></td><td></td></tr> */}

                    </td>

                  </tr>
                </div>
              ))}
            </div>
          </table>


        </div>
      );
    }

    // Account Payment
    if (e === "Account Payment") {
      showAccPay = "temp"
      return (
        <div>
          <table class="table-borderless table-sm " >
            <div class={showAccPay}>
              <ReactToPrint

                trigger={() => <i class="print icon regIcon"></i>} //last_here_to

                content={() => this.reff}
              />
              {details.map((d) => (
                <div>
                  <tr>
                    <td>
                      <tr><td><b>Transaction Details</b></td><td></td><td></td></tr>
                      <tr><td>Code</td><td>:</td><td>{d.code}</td></tr>
                      <tr><td>Transaction date</td><td>:</td><td>{d.date_transac}</td></tr>
                      <tr><td>Transaction type</td><td>:</td><td>{e}</td></tr>
                      <tr><td>Transaction branch</td><td>:</td><td>{d.branch}</td></tr>
                      <tr><td><b>Payment Details</b></td><td></td><td></td></tr>
                      <tr><td>Amount paid</td><td>:</td><td>{formatter.format(d.payable)}</td></tr>
                      <tr><td><b>Charge Balance Details</b></td><td></td><td></td></tr>
                      <tr><td>Charge beginning balance</td><td>:</td><td>{formatter.format(d.beg_charge_bal)}</td></tr>
                      <tr><td>Charge ending balance</td><td>:</td><td>{formatter.format(d.end_charge_bal)}</td></tr>
                      <tr><td><b>Cheque Details</b></td><td></td><td></td></tr>
                      <tr><td>Code</td><td>:</td><td>{d.cq_code}</td></tr>
                      <tr><td>Account name</td><td>:</td><td>{d.payee}</td></tr>
                      <tr><td>Bank</td><td>:</td><td>{d.bank}</td></tr>
                      <tr><td>Post date</td><td>:</td><td>{d.cq_date}</td></tr>
                      <tr><td>{d.imported == 'yes' ? <b>Imported</b> : <></>}</td><td></td><td></td></tr>
                    </td>

                  </tr>
                </div>
              ))}
            </div>
          </table>


        </div>
      );
    }

    // Excess Payment
    if (e === "Excess Payment") {
      showExPay = "temp"
      return (
        <div>
          <table class="table-borderless table-sm " >
            <div class={showExPay}>
              <ReactToPrint

                trigger={() => <i class="print icon regIcon"></i>} //last_here_to

                content={() => this.reff}
              />
              {details.map((d) => (
                <div>
                  <tr>
                    <td>
                      <tr><td><b>Transaction Details</b></td><td></td><td></td></tr>
                      <tr><td>Code</td><td>:</td><td>{d.code}</td></tr>
                      <tr><td>Transaction date</td><td>:</td><td>{d.date_transac}</td></tr>
                      <tr><td>Transaction type</td><td>:</td><td>{e}</td></tr>
                      <tr><td>Customer name</td><td>:</td><td>{d.customer_name}</td></tr>
                      <tr><td>Accountability</td><td>:</td><td>{d.accountability}</td></tr>
                      <tr><td>Transaction branch</td><td>:</td><td>{d.branch}</td></tr>
                      <tr><td>Date Printed</td><td>:</td><td>{d.date_printed}</td></tr>
                      <tr><td>Delivery fee</td><td>:</td><td>{formatter.format(d.delivery_fee)}</td></tr>
                      <tr><td>Excess paid</td><td>:</td><td>{formatter.format(d.payable)}</td></tr>
                      <tr><td><b>References</b></td><td></td><td></td></tr>
                      <tr><td>Original sales code</td><td>:</td><td>{d.org_code}</td></tr>
                      <tr><td>Return code</td><td>:</td><td>{d.return_code}</td></tr>
                      <tr><td>Replacement code</td><td>:</td><td>{d.replacement_code}</td></tr>
                      {/* <tr><td><b>References</b></td><td></td><td></td></tr> */}
                      <tr><td>{d.imported == 'yes' ? <b>Imported</b> : <></>}</td><td></td><td></td></tr>

                    </td>

                  </tr>
                </div>
              ))}
            </div>
          </table>


        </div>
      );
    }


    var rtype = "Purchase no request";
    var rt;
    details.map((d) => (
      rt = d.req_type
    ))

    if (!!rt) {
      rtype = rt;
    }
    // console.log("rt")
    // console.log(rt)


  }
  creditFormatter = (cell, row) => {
    var text;
    if (row.req_type == "Transfer") {
      text = "N/A";
    } else if (row.credit == null) {
      if (row.supplier == null) {
        text = "N/A";
      } else {
        text = "Cash";
      }
    } else {
      text = "Credit";
    }


    return (

      <div>
        {/* {row.req_type == "Transfer" ? "N/A" : row.credit == null ? "Cash" : "Credit"} */}
        {/* {row.req_type == "Transfer" ? "N/A" : row.credit == null ? "Cash" : "Credit"} */}
        {text}

        {/* {row.credit == null ? "Cash" : "Credit"} */}
      </div>
    );

  }

  supFormatter = (cell, row) => {
    var text;
    if (row.supplier == null) {

      if (row.type == "Update" || row.type == "Inventory Update") {
        text = "N/A";
      } else {
        if (row.description == "Conversion") {
          text = row.description;
        } else {
          var desc = JSON.parse(row.description);

          if (Array.isArray(desc)) {

            if (row.type == "Receiving") {
              text = desc[0].sender;
            } else {
              text = "N/A";
            }

          } else {
            text = "N/A";
          }
        }

      }


    } else {
      text = row.supplier;
    }



    return (

      <div>
        {text}
        {/* {row.supplier == null ? "N/A" : row.supplier} */}
        {/* {row.credit == null ? "Cash" : "Credit"} */}
      </div>
    );

  }
  amtFormatter = (cell, row) => {
    return (

      <div>
        {row.payable == null ? "N/A" : row.payable}
        {/* {row.credit == null ? "Cash" : "Credit"} */}
      </div>
    );

  }
  typeFormatter = (cell, row) => {
    return (

      <div>
        {row.isPOSRelease == 1 ?
          <>{row.type} (POS - {row.rec_branch})</>
          : row.type}
        {/* {row.payable == null ? "N/A" : row.payable} */}
        {/* {row.credit == null ? "Cash" : "Credit"} */}
      </div>
    );

  }
  recFormatter = (cell, row) => {

    var text;

    if (row.req_type == null) {
      if (row.supplier == null && row.payable == null) {
        if (row.description == "Conversion") {
          text = row.description;
        } else {
          text = "Transfer"
        }

      } else {
        text = "Purchase";
      }
    } else if (row.req_type == "Purchase") {
      text = "Purchase";
    } else {
      text = "Transfer";
    }

    // if(row.supplier == null){
    //   text = "Transfer";
    // }




    return (

      <div>
        {/* {row.req_type == null ? "Purchase" : row.req_type == "Purchase" ? "Purchase" : "Transfer"} */}
        {/* {row.req_type } */}
        {text}
      </div>
    );

  }
  totalitmFormatter = (cell, row) => {
    return (

      <div>
        {row.total_items == 0 ? "N/A" : row.total_items}
        {/* {row.req_type } */}
      </div>
    );

  }
  notForEdit = (e) => {
    toast("Update not available")
  }

  buttonFormatter = (cell, row) => {
    const { role } = this.state;
    var showPcBtn = { display: "none" }
    var showNonPcBtn = { display: "none" }
    var reff = "print" + row.t_id;
    // DETAIL BUTTONS
    if (row.type === "Payment Charge" || row.type === "Credit" || row.type === "Debit" || row.type === "Account Payment" || row.type === "Excess Payment" || row.type === "Update" || row.type === "Inventory Update") {

      if (row.type !== "Inventory update") {
        showPcBtn = { display: "block" }
        showNonPcBtn = { display: "none" }
      }

    } else {
      showPcBtn = { display: "none" }
      showNonPcBtn = { display: "block" }
    }

    var disUp;
    if (row.req_type == null) {
      if (row.supplier == null && row.payable == null) {
        disUp = 1
      } else {
        disUp = 0;
      }
    } else if (row.req_type == "Purchase") {
      disUp = 0;
    } else {
      disUp = 0;
    }

    return (


      <div>
        <div class="inline_block">
          <button style={showNonPcBtn} type="button" class={row.imported == "yes" ? "btn btn-success btn-circle btn-circle-sm m-1" : "btn btn-secondary btn-circle btn-circle-sm m-1"} data-toggle="modal" data-target={"#mods"} data-type={row.type} data-key={row.t_id} onClick={this.setUpId}>
            <Icon name='th list' data-toggle="modal" data-target={"#mods"} data-type={row.type} data-key={row.t_id} onClick={this.setUpId} />
            {/* <i class="fa fa-th-list"></i> */}
          </button>

          <button style={showPcBtn} type="button" class={row.imported == "yes" ? "btn btn-success btn-circle btn-circle-sm m-1" : "btn btn-secondary btn-circle btn-circle-sm m-1"} data-toggle="modal" data-target={"#modsPC"} data-type={row.type} data-key={row.t_id} onClick={this.setUpId}>
            <Icon name='th list' data-toggle="modal" data-target={"#modsPC"} data-type={row.type} data-key={row.t_id} onClick={this.setUpId} />
            {/* <i class="fa fa-th-list"></i> */}
          </button>
        </div>

        {
          role != "Cashier" ?
            <div class="inline_block">

              {
                // row.type == "Receiving" && row.imported == "yes" ?
                row.type == "Receiving" && row.req_type == null || row.req_type == "Purchase" ?
                  <>
                    {
                      disUp == 0 ?
                        <Link to={{
                          pathname: `/report/update/transaction`, state: {
                            type: this.props.type, path: this.props.path, id: row.t_id, code: row.code, imported: row.imported
                          }
                        }}> <button class={row.imported == "yes" ? "btn btn-success btn-circle btn-circle-sm m-1" : "btn btn-secondary btn-circle btn-circle-sm m-1"}>   <Icon name='edit' /></button>
                        </Link>
                        : <></>

                    }
                  </>

                  :

                  row.type == "Direct Sale" || row.type == "Charge" || row.type == "Excess Payment" ?

                    <Link to={{
                      pathname: `/update/sales`, state: {
                        type: this.props.type, trans_type: row.type, path: this.props.path, id: row.t_id, code: row.code, imported: row.imported
                      }
                    }}> <button class={row.imported == "yes" ? "btn btn-success btn-circle btn-circle-sm m-1" : "btn btn-secondary btn-circle btn-circle-sm m-1"}>   <Icon name='edit' /></button>
                    </Link>


                    :

                    row.type == "Payment Charge" ?
                      <Link to={{
                        pathname: `/update/paymentcharge`, state: {
                          type: this.props.type, trans_type: row.type, path: this.props.path, id: row.t_id, code: row.code, imported: row.imported
                        }
                      }}> <button class={row.imported == "yes" ? "btn btn-success btn-circle btn-circle-sm m-1" : "btn btn-secondary btn-circle btn-circle-sm m-1"}>   <Icon name='edit' /></button>
                      </Link>
                      :

                      row.type == "Return" ?
                        <Link to={{
                          pathname: `/update/return`, state: {
                            type: this.props.type, trans_type: row.type, path: this.props.path, id: row.t_id, code: row.code, imported: row.imported
                          }
                        }}> <button class={row.imported == "yes" ? "btn btn-success btn-circle btn-circle-sm m-1" : "btn btn-secondary btn-circle btn-circle-sm m-1"}>   <Icon name='edit' /></button>
                        </Link>

                        :

                        <button onClick={this.notForEdit} class={row.imported == "yes" ? "btn btn-success btn-circle btn-circle-sm m-1" : "btn btn-secondary btn-circle btn-circle-sm m-1"}>   <Icon name='edit' /></button>
              }

            </div>
            : <></>

        }



        {/* <button style={showPcBtn} type="button" class={row.imported == "yes" ? "btn btn-success" : "btn btn-primary"} data-toggle="modal" data-target={"#modsPC"} data-type={row.type} data-key={row.t_id} onClick={this.setUpId}>
            Details
        </button> */}


      </div>
    )
  }
  handleSelect = (item) => {
    // console.log(date); // native Date object
    this._isMounted = true
    if (this._isMounted) {
      this.setState({
        datesel: [item.selection]
      })
    }
    var sd = item.selection.startDate;
    var day = String(sd.getDate());
    if (day.length == 1) {
      day = "0" + day;
    }
    var month = String(sd.getMonth() + 1);
    var year = String(sd.getFullYear());
    var sdate = year + "-" + month + "-" + day;

    var ed = item.selection.endDate;
    var day = String(ed.getDate());
    if (day.length == 1) {
      day = "0" + day;
    }
    var month = String(ed.getMonth() + 1);
    var year = String(ed.getFullYear());
    var edate = year + "-" + month + "-" + day;

    if (this._isMounted) {
      this.setState({
        sdate: sdate,
        edate: edate,
      })
    }


    // console.log(sdate)
    // console.log(edate)

  }
  handleExportCSVButtonClick = (onClick) => {
    onClick();
  }
  createCustomExportCSVButton = (onClick) => {
    return (
      <ExportCSVButton
        btnText='Down CSV'
        onClick={() => this.handleExportCSVButtonClick(onClick)} />
    );
  }

  details = (e, b) => {
    // const {branches} = this.state;
    var br = b;
    var key = e;
    var name = "All branch";
    // console.log("bbbbbbb")
    // console.log(br)
    // console.log(e)

    // if (e === 0) {
    //   name = "All branch";
    // } else {
    //   if (b) {


    //     var result = b.filter(function (v) {
    //       return v.key == key;
    //     })
    //     name = result[0].text
    //   }
    // }


    return (
      <div>
        <table class="table-borderless table-sm">
          <tr><td>Start date</td><td>:</td><td>{this.state.sdate}</td> </tr>
          <tr><td>End date</td><td>:</td><td>{this.state.edate}</td></tr>
          <tr><td>Branch</td><td>:</td><td>{e}</td></tr>
        </table>
      </div>
    );
  }
  // import


  buttonFormatterDel = (cell, row) => {

    return (<i class="trash icon" onClick={this.impdel} data-key={row.id}></i>)
  }
  impdel = (e) => {
    this._isMounted = true
    const { key } = e.target.dataset;
    const { imported: pos } = this.state;


    if (confirm(`Are you sure you want to delete ${key}?`)) {
      const index = pos.findIndex(
        (item) => parseInt(item.id, 10) === parseInt(key, 10),
      );
      const update = [...pos.slice(0, index), ...pos.slice(index + 1)];
      if (this._isMounted) {
        this.setState({ imported: update });

      }

      toast("Transaction deleted successfully!")
    }
  };
  onBeforeSaveCell(row, cellName, cellValue) {
    // You can do any validation on here for editing value,
    // return false for reject the editing
    if (confirm(`Are you sure you want to update ${row.name}?`)) {
      if (cellName == "balance") {
        if (Number(cellValue)) {
          return true;
        } else {
          toast("Invalid amount!")
          return false;
        }
      } else {
        return true;
      }

    } else {
      return false;
    }
  }
  onAfterSaveCell = (row, cellName, cellValue) => {
    // alert(`Save cell ${cellName} with value ${cellValue} ${row.id} `);
    const { imported } = this.state;
    // let rowStr = '';
    // for (const prop in row) {
    //   rowStr += prop + ': ' + row[prop] + '\n';
    // }

    var commentIndex = imported.findIndex(function (c) {
      return c.id == row.id;
    });
    var updatedComment = update(imported[commentIndex], { [cellName]: { $set: cellValue } });
    var newData = update(imported, {
      $splice: [[commentIndex, 1, updatedComment]]
    });
    if (this._isMounted) {
      this.setState({ imported: newData });
    }

    toast("Transaction successfully updated", {
      position: toast.POSITION.BOTTOM_RIGHT,
      className: 'foo-bar'
    });

    // alert('Thw whole row :\n' + rowStr);
  }
  submitImport = (e) => {
    this._isMounted = true
    if (confirm(`Are you sure you want to insert data?`)) {
      Http.post(`/api/v1/transaction/receiving/import`, { items: JSON.stringify(this.state.imported) })//last stop here no API YET
        .then(({ data }) => {

          if (this._isMounted) {
            this.setState({
              imported: [],
              // data: data.updated,
              // error: false,
            });

          }
          toast("Items imported successfully!")

        })
        .catch(() => {

          toast("Error importing items")
        });

    }
  }

  requestAccess = (e) => {
    this._isMounted = true
    e.preventDefault();
    Http.post(`/api/v1/grant/acsupad`, { nip: this.state.nip })//last stop here no API YET
      .then((response) => {

        if (this._isMounted) {

          if (response.data.grant === "yes") {
            toast("Access Granted")
            this.setState({
              granted: "yes"
            });
            this.nipForm.reset();
          } else {
            toast("Denied Access")
            this.setState({
              granted: "no"
            });
          }
        }

      })
      .catch(() => {

        toast("Denied Access")
      });


  }
  modify_date = (e) => {
    const { tid, trcode, chargecode, type } = e.target.dataset;
    this._isMounted = true
    e.preventDefault();
    const subs = {
      date: this.state.mod_date,
      reason: this.state.reason,
      id: tid,
      trcode: trcode,
      chargecode: chargecode == undefined ? null : chargecode,
      type: type,
    }
    // console.log("mod date")
    // console.log(subs)
    Http.post(`/api/v1/mod/transaction`, subs)
      .then((response) => {

        toast("success")

        // var commentIndex = returnedItems.findIndex(function (c) {
        //   return c.item_id == key;
        // });

        // var updatedComment = update(returnedItems[commentIndex], { status: { $set: value } });

        // var newData = update(returnedItems, {
        //   $splice: [[commentIndex, 1, updatedComment]]
        // });
        // if (this._isMounted) {
        //   this.setState({ returnedItems: newData });
        // }


      })

      .catch(() => {

        toast("Error")
      });


  }
  // HeaderView=(e) =>{
  //   const location = useLocation();
  //   return location.pathname
  // }

  upDateForm = (id, date) => {
    return (<>

      <form
        data-tid={id}
        onSubmit={this.modify_date}
        ref={(el) => {
          this.modDateForm = el;
        }}

      >

        <center>
          <input class="form-control mb-2 mr-sm-2 " type="date" defaultValue={date} name="mod_date" style={{ width: "80%" }} onChange={this.handleChange} />

          <textarea class="form-control mb-2 mr-sm-2 " placeholder="Reason for changing the date" name="reason" style={{ width: "80%" }} onChange={this.handleChange} > </textarea>
          <button type="submit" class="btn btn-primary" >Submit</button>
        </center>
      </form>
    </>);
  }
  displayUpdaDate = (e) => {
    const { id, date, trcode, charge_code, type } = e.target.dataset;
    this._isMounted = true
    if (this._isMounted) {
      this.setState({
        upD_date: null,
        upD_id: null,
        upD_trcode: null,
        upD_charge_code: null,
        upD_type: null,
        upD_date: date,
        upD_id: id,
        upD_trcode: trcode,
        upD_charge_code: charge_code,
        upD_type: type,
      });
    }
  }

  transadate = (cell, row) => {

    return (<>
      {/* {row.date}{this.state.granted === "yes" ? <>&nbsp;&nbsp;&nbsp; <i class="calendar outline icon" onClick={this.displayUpdaDate} data-date={row.date}  data-id={row.t_id} data-toggle="modal" data-target={"#modDate"}></i></> : " "} */}
      {row.date}
      <>&nbsp;&nbsp;&nbsp;
        {
          row.type == "Direct Sale" || row.type == "Receiving" ?
            <i class="calendar outline icon" onClick={this.displayUpdaDate}
              data-date={row.date} data-id={row.t_id} data-trcode={row.code} data-charge_code={row.charge_transaction_code}
              data-type={row.type}
              data-toggle="modal" data-target={"#modDate"}></i>
            :

            <></>
        }
      </>


      {/* <div class="modal fade" id={"modDate" + row.t_id}>
        <div class="modal-dialog modal-xs">
          <div class="modal-content">


            <div class="modal-header">
              <h4 class="modal-title">Modify transaction date</h4>
              <button type="button" class="close" data-dismiss="modal">&times;</button>
            </div>


            <div class="modal-body" >
              <form
                data-tid={row.t_id}
                onSubmit={this.modify_date}
                ref={(el) => {
                  this.modDateForm = el;
                }}

              >

                <center>
                  <input class="form-control mb-2 mr-sm-2 " type="date" defaultValue={row.date} name="mod_date" style={{ width: "80%" }} onChange={this.handleChange} />

                  <textarea class="form-control mb-2 mr-sm-2 " placeholder="Reason for changing the date" name="reason" style={{ width: "80%" }} onChange={this.handleChange} > </textarea>
                  <button type="submit" class="btn btn-primary" >Submit</button>
                </center>
              </form>
            </div>




          </div>
        </div>
      </div> */}
    </>)
  }
  // import

  handleClickExcel = (e) => {
    toast("print")
    if (this._isMounted) {
      this.setState({
        exData: "nbvjhgfjhy",

      });
    }
    // this.getex.trigger("click");
    // this.clickBack.current.click()
    this.clickBack.current.click()
    // console.log(this.clickBack.current)
  }

  handleNewbut = (e) => {
    toast("This is it")
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

  remitUpdate = (cell, row) => {

    return (
      <>
        <Link to={{
          pathname: `/remittance`, state: {
            type: "update", path: "/report/remittance",
            id: row.id, rem_id: row.remitter_id, date: row.date, amt: row.amount_remitted, remark: row.remark, branch_name: row.branch
          }
        }}>
          <Button> Update</Button>
        </Link>
      </>
    )
  }

  rowClassNameFormat(row, rowIdx) {
    // row is whole row object
    // rowIdx is index of row
    return row.transaction_status === 'Deactivated' ? 'tr-style-deleted' : ' ';
  }
  uplogicon = (cell, row) => {

    return (
      <>

        <Link to={{
          pathname: '/updatLogRemit', state: {
            id: row.id,
            date: row.date,
            path: '/report/remittance',
            type: "remittance"
          }
        }} ><i class="file alternate icon"></i></Link>

      </>
    )
  }

  cahsflowFormat = (cell, row) => {

    if (row.type == "Direct Sale" || row.type == "Excess Payment" || row.type == "Payment Charge") {
      return <UpToggle po_cashflow={row.partof_cashflow} id={row.t_id} dis_label="yes" type="table" />
    } else {
      return <></>
    }

  }

  itms = (e, print) => {

    const { role } = this.state;

    const options = {
      // exportCSVBtn: this.createCustomExportCSVButton,
      defaultSearch: this.props.location.state ? (this.props.location.state.defCode ? this.props.location.state.defCode : '') : this.props.defCode
      // defaultSearch: this.props.location.state.defCode ? this.props.location.state.defCode : ''
    };
    var hidFilt = { display: "none" }
    if (this.props.role == "Superadmin") {
      hidFilt = { display: "block" }
    }
    var hidtitems = false

    const rectype = {
      0: 'Purchase',
      1: 'Transfer',
    };

    const nonPrintDate = (cell, row) => {
      return row.date;
    }

    if (role == "Cashier") {
      e = e.filter(function (v) {
        if (v.type != "Update" && v.type != "Import") {
          return v;
        }
      })

      // console.log("e")
      // console.log(e)

    }


    return (<div>
      {/* {this.HeaderView() } */}



      {/* <h1>Stock Report</h1> */}
      {/* {this.state.branch_id} */}
      {
        this.props.title != "Remittances" ?
          <>

            <BootstrapTable
              trClassName={this.rowClassNameFormat}
              ref='table'
              // data={this.props.data}
              data={e}
              pagination={print ? false : true}
              search={print ? false : true}
              options={print ? false : options}
            //  exportCSV={print ? false : true}
            // options={ options }
            >
              {/* <TableHeaderColumn dataField='branch' width="190" hidden={this.props.hidbranch} >Branch</TableHeaderColumn> */}
              {/* <TableHeaderColumn dataField='partof_cashflow' hidden={this.props.type == "General" || this.props.type == "Sale" ? false : true} dataFormat={this.cahsflowFormat} width="80"  >Cashflow</TableHeaderColumn> */}
              <TableHeaderColumn dataField='branch' width="100"  >Branch</TableHeaderColumn>
              <TableHeaderColumn dataField='series_no_pr' hidden={this.props.title == "Sales" || this.props.title == "Returns" || this.props.title == "Charges" ? false : true} width="100"  >SN</TableHeaderColumn>
              <TableHeaderColumn dataField='receipt_code' hidden={this.props.title == "Sales" || this.props.title == "Charges" ? false : true} width={print ? "200" : "170"}>OR No.</TableHeaderColumn>
              <TableHeaderColumn dataField='code' width={print ? "200" : "190"} isKey={true}>Code</TableHeaderColumn>
              <TableHeaderColumn dataField='charge_transaction_code' hidden={true} width={print ? "200" : "170"}>Code</TableHeaderColumn>
              <TableHeaderColumn dataField='date' width="130" dataFormat={print ? nonPrintDate : this.transadate}>Date</TableHeaderColumn>
              <TableHeaderColumn tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} dataField='cust_name' >{this.props.title == "Receiving" ? "Rececived by" : "Particular"}</TableHeaderColumn>
              <TableHeaderColumn dataField='supplier' dataFormat={this.supFormatter} tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} hidden={this.props.title == "Receiving" ? false : true} width="200" >Supplier</TableHeaderColumn>
              <TableHeaderColumn dataField='type' width="200" dataFormat={this.typeFormatter} hidden={this.props.title == "Receiving" ? true : false} >Type</TableHeaderColumn>
              {/* <TableHeaderColumn dataField='type' width="150"  dataFormat={this.typeFormatter} hidden={this.props.title == "Receiving" ? true : false} >Type</TableHeaderColumn> */}
              <TableHeaderColumn dataField='rec_branch' hidden={true} >Type</TableHeaderColumn>
              <TableHeaderColumn dataField='accountability' hidden={this.props.title == "Receiving" ? true : false} width="130" >Accountability</TableHeaderColumn>
              <TableHeaderColumn dataField='payable' dataFormat={this.amtFormatter} width="120" >Amount Due</TableHeaderColumn>
              <TableHeaderColumn dataField='total_items' dataFormat={this.totalitmFormatter} hidden={hidtitems} width={print ? "150" : "100"}>Total Items</TableHeaderColumn>
              <TableHeaderColumn dataField='imported' tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} hidden={true} width="100"> </TableHeaderColumn>
              <TableHeaderColumn dataField='credit' dataFormat={this.creditFormatter} tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} hidden={this.props.title == "Receiving" ? false : true} width="90" >Purchase Status</TableHeaderColumn>
              <TableHeaderColumn dataField='req_type' dataFormat={this.recFormatter} tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} hidden={this.props.title == "Receiving" ? false : true} width="100" >Receiving Type</TableHeaderColumn>
              <TableHeaderColumn dataField='transaction_status' hidden tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} width="100" >Transaction Stats</TableHeaderColumn>
              <TableHeaderColumn dataField='description' hidden tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} width="100" >Descs</TableHeaderColumn>
              <TableHeaderColumn dataField='t_id' hidden={print ? true : hidtitems} dataFormat={this.buttonFormatter} width="120"></TableHeaderColumn>
            </BootstrapTable>


          </>
          :
          <>
            <BootstrapTable
              ref='table'
              data={e}
              pagination={true}
              search={true}
            // options={options} exportCSV
            // deleteRow={true} selectRow={selectRowProp} options={options}
            >
              <TableHeaderColumn dataField='id' hidden={true} width="30" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} isKey={true}>id</TableHeaderColumn>
              <TableHeaderColumn dataField='date' width="150" dataFormat={print ? nonPrintDate : this.transadate} tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Date</TableHeaderColumn>
              <TableHeaderColumn dataField='branch' width="200" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Branch</TableHeaderColumn>
              <TableHeaderColumn dataField='remitter' width="150" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Remitter</TableHeaderColumn>
              <TableHeaderColumn dataField='amount_remitted' width="120" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Amount Received</TableHeaderColumn>
              <TableHeaderColumn dataField='sys_amount' width="120" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >System Amount</TableHeaderColumn>
              <TableHeaderColumn dataField='remark' tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Remarks</TableHeaderColumn>
              <TableHeaderColumn dataField='remitter_id' hidden width="120" dataFormat={this.remitUpdate} ></TableHeaderColumn>
              <TableHeaderColumn width="50" hidden={print ? true : false} dataField='updated_at' dataFormat={this.uplogicon} ></TableHeaderColumn>



            </BootstrapTable>
          </>
      }



    </div>);
  }


  noDateRange = () => {
    toast("Please choose date range")
  }


  render() {
    const { data, imported, location } = this.state;


    this.state.sdate = this.props.sdate;
    this.state.edate = this.props.edate;

    const options = {
      exportCSVBtn: this.createCustomExportCSVButton
    };
    var hidFilt = { display: "none" }
    if (this.props.role == "Superadmin") {
      hidFilt = { display: "block" }
    }
    //filt_branch
    const cellEditProp = {
      mode: 'dbclick',
      blurToSave: true,
      beforeSaveCell: this.onBeforeSaveCell, // a hook for before saving cell
      afterSaveCell: this.onAfterSaveCell  // a hook for after saving cell
    };

    var hidtitems = false
    // if (this.props.type == "Payment Charge") {
    //   hidtitems = true
    // }
    // const [state, setState] = useState([
    //   {
    //     startDate: new Date(),
    //     endDate: addDays(new Date(), 7),
    //     key: 'selection'
    //   }
    // ]);

    // console.log(state)

    const dats = this.props.data;
    var result = dats;
    if (this.state.sdate || this.state.edate) {
      var minRaw = this.state.sdate;
      var maxRaw = this.state.sdate;
      var min = new Date(this.state.sdate);
      var max = new Date(this.state.edate);
      // console.log(min)
      // console.log(max)
      // console.log(minRaw)
      // console.log(maxRaw)
      var rdate;
      result = dats.filter(function (v) {
        // return v.code == "RP6610112003885";

        rdate = new Date(v.date);
        // console.log(v.date)
        // console.log(rdate)
        if (rdate.getTime() >= min.getTime() && rdate.getTime() <= max.getTime()) {
          return v;
        }

        if (minRaw == maxRaw) {
          return v.date == minRaw;
        }


        // return (Date.parse(v.date_transac) * 1000) >= Date.parse(this.state.sdate) && (Date.parse(v.date_transac) * 1000) <= Date.parse(this.state.edate);
      })

    }

    this.years = function (startYear) {
      var currentYear = new Date().getFullYear(), years = [];
      startYear = startYear || 2000;
      while (startYear <= currentYear) {
        years.push(startYear++);
      }
      return years;
    }

    // 


    var permission = this.state.permission;

    // console.log(result)
    return (
      <div className="contentTransactSales">


        {/* here1 */}




        <div class="modal fade " id="mods" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div class="modal-dialog modal-xl" role="document">
            <div class="modal-content">

              <div class="modal-body">

                {/* <ReactToPrint

                  trigger={() => <i class="print icon regIcon"></i>} //last_here_to

                  content={() => this.reff}
                /> */}
                <div style={{ display: "none" }}>
                  <PrintReport
                    // details={this.printDetailsEach(row.type, "print")}
                    details={this.printDetailsEach(this.state.type, "print")}

                    ref={el => (this.reff = el)}



                  />




                </div>

                {/* {this.printDetailsEach(row.type, "notprint")} */}
                {this.printDetailsEach(this.state.type, "notprint")}




              </div>

            </div>
          </div>
        </div>


        <div class="modal fade " id="modsPC" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div class="modal-dialog modal-md" role="document">
            <div class="modal-content">

              <div class="modal-body">
                {/* <ReactToPrint

                  trigger={() => <i class="print icon regIcon"></i>}

                  content={() => this.reff}
                /> */}
                {this.printDetailsEach(this.state.type, "notprint")}

              </div>

            </div>
          </div>
        </div>

        <div class="modal fade" id={"modDate"}>
          <div class="modal-dialog modal-xs">
            <div class="modal-content">


              <div class="modal-header">
                <h4 class="modal-title">Modify transaction date</h4>
                <button type="button" class="close" data-dismiss="modal">&times;</button>
              </div>


              <div class="modal-body" >
                <form
                  data-tid={this.state.upD_id}
                  data-trcode={this.state.upD_trcode}
                  data-chargecode={this.state.upD_charge_code}
                  data-type={this.state.upD_type}
                  onSubmit={this.modify_date}
                  ref={(el) => {
                    this.modDateForm = el;
                  }}

                >

                  <center>

                    <input class="form-control mb-2 mr-sm-2 " type="date" defaultValue={this.state.upD_date} name="mod_date" style={{ width: "80%" }} onChange={this.handleChange} />

                    <textarea required class="form-control mb-2 mr-sm-2 " placeholder="Reason for changing the date" name="reason" style={{ width: "80%" }} onChange={this.handleChange} > Reason for changing the date</textarea>
                    <button type="submit" class="btn btn-primary" >Submit</button>
                  </center>
                </form>
              </div>




            </div>
          </div>
        </div>


        <ToastContainer />
        {/* <Button href="#show" data-toggle="collapse" style={{ position: "relative", float: "right", top: "-15px", zIndex: '1' }} circular icon='eye' /> */}
        <div id="show" class="collapse " >
          {/* <div id="show" class="collapse show" > */}
          {/* {this.state.datesel} */}
          <div class="inline_block">
            <div style={{ position: "relative" }}>
              {/* <DateRangePicker
                onChange={this.handleSelect}
                showSelectionPreview={true}
                moveRangeOnFirstSelection={false}
                months={1}
                ranges={this.state.datesel}
                direction="horizontal"
                data-key="Hello"
                className="cal"
              /> */}
            </div>
          </div>

          &nbsp; &nbsp; &nbsp; &nbsp;
          {/* <div class="inline_block" style={{ right: "13%", top: "35%", position: "absolute" }} >
         
          <ReactToPrint

            trigger={() => <button class="btn btn-primary" >Print Report</button>}

            content={() => this.componentRef}
          />

          <div style={{ display: "none" }}>
            <PrintReport
              details={this.details(this.props.branchName, this.props.branches)}
              itms={this.itms(result)}
              ref={el => (this.componentRef = el)}



            />
          </div>
         
        </div> */}
          {this.props.gen != "General" ?
            // <div style={{ position: "absolute", width: "50%", top: "-2%", right: "0" }} >
            <div style={{ position: "relative", width: "50%", top: "-2%", right: "0" }} >
              <div style={{ position: "absolute", left: "60%", top: "5%", width: "100%" }}>
                {this.props.type === "Receiving" ?
                  <div class="inline_block">
                    <select name="pur_type" class="form-control mb-2 mr-sm-2" data-type={this.props.type} data-branch={this.props.branch} onChange={this.handleChangePur}>
                      <option value="All">All</option>
                      <option value="Cash">Cash</option>
                      <option value="Credit">Credit</option>
                    </select>
                  </div>
                  : <></>
                }
                <div class="inline_block">
                  <select class="form-control mb-2 mr-sm-2" name="year" data-type={this.props.type} data-branch={this.props.branch} onChange={this.handleChangeYear}>
                    {this.years(2018).map(year => (

                      <option value={year}>{year}</option>

                    ))}
                    {/* <option value="2018">2018</option>
                <option value="2019">2019</option>
                <option value="2020">2020</option> */}
                  </select>
                </div>
              </div>
              {
                this.props.title != "Remittances" ?
                  <SaleChart
                    data={this.state.datasets ? this.state.datasets : this.props.datasets}
                    type={this.props.type === "Receiving" ? "Purchase" : this.props.type}
                  // data= []

                  />
                  :
                  <DlineChart
                    data={this.state.datasets ? this.state.datasets : this.props.datasets}
                    type="Remittance"
                  />
              }
            </div>
            : <> </>
          }





          <hr />



        </ div>
        {/* {this.props.branch} */}

        <div>


          {

            // this.props.type != "Receiving" ?

            <div class="inline_block">
              {/* <div style={{ width: "100%", position: "absolute" }}> */}
              {
                
                  permission.find(e => e == 'PRNT_SALES_ITM_ONLY') && this.props.gen == "General"? <></> :
                    <ReactToPrint
                      trigger={() => <Button icon labelPosition='left'><Icon name='print' /> Print </Button>}
                      content={() => this.componentRef}
                    />
                
              }



              {/* </div> */}
            </div>

            // : <>

            //   <Dropdown text='Print' floating labeled button className='icon'>
            //     <Dropdown.Menu className='left'>
            //       <Dropdown.Item>
            //         <ReactToPrint
            //           trigger={() => <span className='text'>Transaction Summary</span>}
            //           content={() => this.componentRef}
            //         />
            //       </Dropdown.Item>

            //       <ReactToPrint
            //         trigger={() => <Dropdown.Item> <span className='text'>All Items</span> </Dropdown.Item>}
            //         content={() => this.indvpur}
            //       />


            //     </Dropdown.Menu>
            //   </Dropdown>


            // </>

          }


          <div class="inline_block">






            {/* <ReactHTMLTableToExcel
              //  onClick={this.handleClickExcel}
              id="test-table-xls-button"
              className=" ui button"
              table="gen"
              filename="General"
              sheet="tablexls"
              buttonText="Download as Excel"
              // innerRef={this.clickBack}
              ref={ref => { this.clickBack = ref; }}
            />
 */}


          </div>

          <div style={{ display: "none" }}>
            {

              <PrintReport
                details={this.details(this.props.branchName, this.props.branches)}
                itms={this.itms(result, "print")}
                ref={el => (this.componentRef = el)}
              />


            }
            {/* <IndvItems

              ref={el => (this.indvpur = el)}
            /> */}

          </div>

          &nbsp;&nbsp;&nbsp;
          {/* style={this.props.gen != "General" ? { right: "0", top: "35%", position: "absolute" } : { right: "0", top: "35%", position: "absolute" }} */}
          <div class="inline_block">
            {/* 10-12-2021 */}
            {/* <Button icon labelPosition='left' data-toggle="modal" data-target="#imp">
              <Icon name='arrow alternate circle left' />
              Import Purchases
            </Button> */}
            {/* <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#imp">
              Import Purchases
          </button> */}
            &nbsp;&nbsp;&nbsp;
          </div>
          {/* {
            this.props.role == "Superadmin" ?
              <div class="inline_block">

                {
                  this.state.granted == "yes" ?
                    <>
                      <Button color='red' icon labelPosition='left' onClick={this.exitSupAcc}>
                        <Icon name='x' />
                        Exit modification
                      </Button>

                    </>
                    :
                    <>

                      <Button icon labelPosition='left' data-toggle="modal" data-target="#modAcc">
                        <Icon name=' edit outline' />
                        Modify transaction date
                      </Button>
                    </>

                }
              </div>
              :
              <></>
          } */}
          {
            // this.state.sdate && this.props.type == "Receiving" ||  this.state.sdate && this.props.gen == "General" ?
            this.state.sdate && this.props.type == "Receiving" || this.state.sdate && this.props.gen == "General" ?
              <div class="inline_block">
                <Link to={{
                  // pathname: `/report/receiving/items`, 
                  pathname: `/report/itemize`,
                  state: {
                    type: this.props.type,
                    view: "Items",
                    role: this.props.role,
                    path: this.props.path,
                    begDate: this.state.sdate,
                    endDate: this.state.edate,
                    branch: this.props.branch_idS,
                    branch_id: this.props.branch,
                    branch_name: this.props.branch_name,
                    branchName: this.props.branchName
                  }
                }}>
                  <Button icon labelPosition='left'>
                    <Icon name='file alternate' />
                    {this.props.type == "Receiving" ? " Item View " : this.props.type == "General" ? "Item view for Sale Releases" : <></>}
                  </Button>
                </Link>
              </div>
              : <>
                {this.props.type == "General" || this.props.type == "Receiving" ?
                  <Button icon labelPosition='left' onClick={this.noDateRange}>
                    <Icon name='file alternate' />
                    {this.props.type == "Receiving" ? " Item View " : this.props.type == "General" ? "Item view for Sale Releases" : <></>}
                  </Button>
                  : <> </>
                }
              </>
          }

          {permission.find(e => e == 'PRNT_SALES_ITM_ONLY') && this.props.gen == "General" ? <></> :
            <div style={{ float: "right" }}>

              <Link to={{
                pathname: `/report/excel/preview`, state: {
                  type: this.props.type, view: "Items", path: this.props.path,
                  begDate: this.state.sdate, endDate: this.state.edate,
                  branch: this.props.branch_idS, filter: this.props.filter,
                  data: result, branches: this.state.branches
                }
              }}>
                <Button > Excel Preview</Button>
              </Link>
              <Button href="#show" data-toggle="collapse" >View Chart</Button>
            </div>
          }

          <div class="modal fade" id="modAcc">
            <div class="modal-dialog modal-xs">
              <div class="modal-content">

                <form
                  onSubmit={this.requestAccess}
                  ref={(el) => {
                    this.nipForm = el;
                  }}
                  autoComplete="off"
                >
                  <div class="modal-header">
                    <h4 class="modal-title">Enter pin</h4>
                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                  </div>


                  <div class="modal-body" >

                    <center> <input class="form-control mb-2 mr-sm-2 " type="password" name="npip" style={{ width: "50%" }} onChange={this.handleChange} />
                      <button type="submit" class="btn btn-primary" >Submit</button></center>
                  </div>



                </form>
              </div>
            </div>
          </div>
          <div class="modal fade" id="imp">
            <div class="modal-dialog modal-xxl">
              <div class="modal-content">


                <div class="modal-header">
                  <h4 class="modal-title">Import historical purchases</h4>
                  {/* <br /> */}

                  <button type="button" class="close" data-dismiss="modal">&times;</button>
                </div>


                <div class="modal-body">
                  {/* <i style={{ color: "red" }}>Important Reminders</i><br />
                <i>*import supplier are for those suppliers that do not exist yet in the system. If you want to update a supplier please use the update
              " <i class='fas icons'>&#xf304;</i>" icon of an item inside utilities/supplier
                </i> */}

                  <div class="inline_block" style={{ float: "right" }}>
                    <a href='/templates/historical_purchases_template.csv' download>Download template here</a><br />
                    <small>*Don't change the headings of the template</small>
                  </div>

                  <form>
                    <div class="custom-file">
                      <CSVReader
                        parserOptions={{ header: true }}
                        onFileLoaded={(dataf, fileInfof) => {
                          this._isMounted = true
                          if (this._isMounted) {
                            this.setState({
                              imported: dataf
                            });
                          }
                          // console.dir(JSON.stringify(dataf))
                          // console.dir(dataf)
                        }


                        }
                        cssClass="custom-file-input"
                      />
                      <label class="custom-file-label" for="customFile">Choose file</label>
                    </div>
                  </form>

                  <br />
                  <BootstrapTable
                    ref='table'
                    data={imported}
                    pagination={true}
                    search={true}
                    cellEdit={cellEditProp}
                  // deleteRow={true} selectRow={selectRowProp} options={options}
                  >
                    <TableHeaderColumn dataField='id' width="30" dataFormat={this.buttonFormatterDel}  ></TableHeaderColumn>
                    <TableHeaderColumn dataField='id' hidden={true} width="30" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} isKey={true}>id</TableHeaderColumn>
                    <TableHeaderColumn dataField='date_received' width="100" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Date</TableHeaderColumn>
                    <TableHeaderColumn dataField='for_payment' width="80" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >For payment</TableHeaderColumn>
                    <TableHeaderColumn dataField='item_code' width="150" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Item Code</TableHeaderColumn>
                    <TableHeaderColumn dataField='item_name' tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Item Name</TableHeaderColumn>
                    <TableHeaderColumn dataField='brand' width="90" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }}  >Brand</TableHeaderColumn>
                    <TableHeaderColumn dataField='size' width="90" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }}  >Size</TableHeaderColumn>
                    <TableHeaderColumn dataField='unit' width="80" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Unit</TableHeaderColumn>
                    <TableHeaderColumn dataField='original_price' width="80" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Org Price</TableHeaderColumn>
                    <TableHeaderColumn dataField='srp' width="80" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >SRP</TableHeaderColumn>
                    <TableHeaderColumn dataField='quantity' width="80" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Quantity</TableHeaderColumn>
                    <TableHeaderColumn dataField='supplier' width="120" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Supplier</TableHeaderColumn>



                  </BootstrapTable>
                  <br />
                  <button type="button" class="btn btn-primary" onClick={this.submitImport}>Import</button>
                </div>


                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                </div>

              </div>
            </div>
          </div>

        </div>
        <h1>{this.props.title == "Sales" ? "Direct Sales" : this.props.title}</h1>
        {/* {this.state.upIdItem} */}
        {/* {location.pathname} */}

        {/* <div style={{ display: "none" }}>
          <ExRep data={result} type={this.props.title} />
        </div> */}



        {permission.find(e => e == 'PRNT_SALES_ITM_ONLY') && this.props.gen == "General" ? <></> : this.itms(result)}

      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: state.Auth.isAuthenticated,
  user: state.Auth.user,
});

export default connect(mapStateToProps)(withRouter(TemplateReport));
