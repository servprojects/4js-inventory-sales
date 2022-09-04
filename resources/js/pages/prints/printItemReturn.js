import React, { Component, useRef } from 'react';
import PrintHeader from './printHeader';
import PrintSalesHeader from './printSalesHeader';
import PrintSalesFooter from './printSalesFooter';

class PrintReturn extends React.Component {
  render() {
    const returned = this.props.returned;
    const allitems = this.props.items;
    const transdet = this.props.transdet;
    const devfee = this.props.delivery_fee;
    var sub = 0;
    var subret = 0;
    const formatter = new Intl.NumberFormat('fil', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 3
    })
    const tabstyle = {  whiteSpace: "nowrap", width: "1%"};
    const title = "Item Return";
    return (
      // 432
      <div style={{width: "400px"}}>
        <table class="p_table">
          <PrintSalesHeader
            title={title}
          code={this.props.code}
          printdate={this.props.printdate}
          />

          <tr>
            <td>
              <div class="p_compDet">
                
                <h3><b>DETAILS</b></h3>
                {transdet.map((tr) => (

                  <div>
                    <b>Receipt Code : {this.props.orgcode}</b><br />
                    <b>Customer Name : {tr.customer_name}</b><br />
                  </div>

                ))}
              </div>
            </td>
          </tr>
          <tr>
            <td>
            <b>  Returned Item </b>
                <table class="table p_table table-fit" style={tabstyle} >
                <thead>
                  <tr>
                    <th class="iconTable">Item Description</th>
                    <th class="iconTable">Quantity</th>
                    <th class="iconTable">Est. Price</th>
                    <th class="iconTable">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {returned.map((item) => (
                    <tr>
                      <td class="iconTable">{item.name}</td>
                      <td class="iconTable">{item.quantity}</td>
                      <td class="iconTable">{item.unit_price}</td>
                      <td class="iconTable">{item.total}
                        <div class="hide">  {subret += item.total} </div>
                      </td>
                    </tr>

                  ))}

                </tbody>
              </table>
             
              <tr> <td> <b>Replacement Item</b></td> </tr>
                <table class="table p_table table-fit" style={tabstyle} >
                <thead>
                  <tr>
                    <th class="iconTable">Item Description</th>
                    <th class="iconTable">Quantity</th>
                    <th class="iconTable">Est. Price</th>
                    <th class="iconTable">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {allitems.map((item) => (
                    <tr>
                      <td class="iconTable">{item.name}</td>
                      <td class="iconTable">{item.Quantity}</td>
                      <td class="iconTable">{item.unit_price}</td>
                      <td class="iconTable">{item.total}
                        <div class="hide">  {sub += item.total} </div>
                      </td>
                    </tr>

                  ))}

                </tbody>
              </table>
            </td>
          </tr>

          <tr>
            <td>
              <table style={{margin: "2%"}}  >
              
                <tr><td>  <b>Replacement item subtotal :</b>     </td>   <td>  &nbsp;{formatter.format(sub)} </td></tr>
                <tr><td>  <b>Returned item subtotal :</b>     </td>   <td>  &nbsp;{formatter.format(subret)} </td></tr>
                <tr><td>  <b>Delivery Fee:</b>     </td>   <td>  &nbsp;{formatter.format(devfee)} </td></tr>
                <tr><td>  <b>Total Excess Payable :</b>     </td>   <td>  &nbsp;{formatter.format((parseFloat(sub)  - parseFloat(subret)) + parseFloat(devfee))} </td></tr>
                {/* <tr><td>  <b>Delivery Fee :</b> </td>   <td>  &nbsp;{formatter.format(this.props.delivery_fee)} </td></tr>
                  <tr><td>  <b>Discount :</b>     </td>   <td>  &nbsp;{formatter.format(this.props.discount)} </td></tr>
                  <tr><td colspan="2">__________________________</td></tr>
                  <tr><td><b>Total:</b></td><td><b>{formatter.format(this.props.payable)}</b></td></tr> */}
              </table>
            </td>
          </tr>
        </table>
        <PrintSalesFooter
            cashier={this.props.cashier}
            branch={this.props.branch}
          />
      </div>
    );
  }
}
export default PrintReturn;