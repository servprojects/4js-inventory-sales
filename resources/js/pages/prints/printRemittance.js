import React, { Component, useRef } from 'react';
import PrintHeader from './printHeader';

class PrintRemittance extends React.Component {
  render() {
    const allTrans = this.props.allTrans;
    var sub = 0;
    const formatter = new Intl.NumberFormat('fil', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 3
    })
    // var str = this.props.type;
    const title = "Remittance Report";
    // var emp_name = this.props.first_name + " " + this.props.last_name

    var salestoday = []
    var cutoffsales = []
    allTrans.map((v) => {

      var datesys = new Date(v.date);
      var sysdate = datesys.getUTCDate();

      var datestate = new Date(this.props.transac_date);
      var statedate = datestate.getUTCDate();


      if (sysdate == statedate) {
        salestoday.push(v)
      }

      if (sysdate != statedate) {
        cutoffsales.push(v)
      }


    })
    return (
      <div>
        <table class="p_table">
          <PrintHeader
            title={title}
            code={this.props.code}
          />

          <tr>
            <td>
              <div class="p_compDet">
                <br />
                <h3><b>DETAILS</b></h3>
                <b>Transaction date : {this.props.transac_date}</b><br />
                <b>Remitted by : {this.props.remitter}</b><br />

                Total Sales : {this.props.cash_received}<br />
                               Petty Cash : {this.props.initialCash}<br />
                               Total : {this.props.totalRecIn}<br />
                               Amount remitted : {this.props.remitted}<br />
                               Difference: {this.props.diff}<br />

                {this.props.branch_name ? <>Branch: {this.props.branch_name}</> : <></>
                }<br /><br />
                {/* <b>Amount remitted : {this.props.remitted}</b><br />
                <b>Cash received : {this.props.cash_received}</b><br />
                <b>Difference : {this.props.diff}</b><br />
                <b>Initial Cash : {this.props.initialCash}</b><br />
                <b>Cash Withdrawals : {this.props.withdrawals}</b><br /> */}
                <b>Branch: {this.props.branch}</b><br />
                <b>Remarks: <br />
                  <pre>
                    {this.props.remarks}
                  </pre>


                </b>
              </div>
            </td>
          </tr>
          <tr>
            <td>
              <br />
              <div style={{ marginRight: "5%" }}>
                <center>{this.props.transac_date} Transactions</center>
                <table class="table table-bordered p_table" >
                  <thead>
                    <tr>
                      <th class="iconTable">Time</th>
                      <th class="iconTable">Transaction</th>
                      <th class="iconTable">Code</th>
                      <th class="iconTable">Name</th>
                      <th class="iconTable">Type</th>
                      <th class="iconTable">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salestoday.map((item) => (
                      <tr>
                        <td class="iconTable">{item.time}</td>
                        <td class="iconTable">{item.trans_type}</td>
                        <td class="iconTable">{item.code}</td>
                        <td class="iconTable">{item.cust_name}</td>
                        <td class="iconTable">{item.type}</td>
                        <td class="iconTable">{item.payable}
                          {/* <div class="hide">  {sub += item.sub_total} </div> */}
                        </td>
                      </tr>

                    ))}

                  </tbody>
                </table>

                {
                  cutoffsales.length > 0 ?
                    <>
                      <br />
                      <br />
                      <center>Late Input Transactions</center>
                      {/* <center>Cut Off Transactions (Previous Date)</center> 5-4-2021 */}
                      <table class="table table-bordered p_table" >
                        <thead>
                          <tr>
                            <th class="iconTable">Date</th>
                            <th class="iconTable">Time</th>
                            <th class="iconTable">Transaction</th>
                            <th class="iconTable">Code</th>
                            <th class="iconTable">Name</th>
                            <th class="iconTable">Type</th>
                            <th class="iconTable">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cutoffsales.map((item) => (
                            <tr>
                              <td class="iconTable">{item.date}</td>
                              <td class="iconTable">{item.time}</td>
                              <td class="iconTable">{item.trans_type}</td>
                              <td class="iconTable">{item.code}</td>
                              <td class="iconTable">{item.cust_name}</td>
                              <td class="iconTable">{item.type}</td>
                              <td class="iconTable">{item.payable}
                                {/* <div class="hide">  {sub += item.sub_total} </div> */}
                              </td>
                            </tr>

                          ))}

                        </tbody>
                      </table>
                    </>
                    : <></>
                }
              </div>
            </td>
          </tr>

          <tr>
            <td>
              <table class="p_payableTab" >
                {/* <tr><td>  <b>Total :</b>     </td>   <td>  &nbsp;{formatter.format(sub)} </td></tr> */}
                {/* <tr><td>  <b>Delivery Fee :</b> </td>   <td>  &nbsp;{formatter.format(this.props.delivery_fee)} </td></tr>
                  <tr><td>  <b>Discount :</b>     </td>   <td>  &nbsp;{formatter.format(this.props.discount)} </td></tr>
                  <tr><td colspan="2">__________________________</td></tr>
                  <tr><td><b>Total:</b></td><td><b>{formatter.format(this.props.payable)}</b></td></tr> */}
              </table>
            </td>
          </tr>
        </table>
      </div>
    );
  }
}
export default PrintRemittance;