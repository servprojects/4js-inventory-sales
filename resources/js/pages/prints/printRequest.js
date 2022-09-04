import React, { Component, useRef } from 'react';
import PrintHeader from './printHeader';

class PrintRequest extends React.Component {
  render() {
    const allitems = this.props.items;
    var sub = 0;
    const formatter = new Intl.NumberFormat('fil', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 3
    })
    var str = this.props.type;
    const title = str.toUpperCase() + " " + "REQUEST";
   
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
              
              </div>
            </td>
          </tr>
          <tr>
              <td>
                <br/>
                <table class="table table-bordered p_table" >
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
                        <td class="iconTable">{item.item}</td>
                        <td class="iconTable">{item.quantity}</td>
                        <td class="iconTable">{item.new_price}</td>
                        <td class="iconTable">{item.sub_total}
                          <div class="hide">  {sub += item.sub_total} </div>
                        </td>
                      </tr>
  
                    ))}
  
                  </tbody>
                </table>
              </td>
            </tr>
           
            <tr>
              <td>
                <table class="p_payableTab" >
                  <tr><td>  <b>Total :</b>     </td>   <td>  &nbsp;{formatter.format(sub)} </td></tr>
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
export default PrintRequest;