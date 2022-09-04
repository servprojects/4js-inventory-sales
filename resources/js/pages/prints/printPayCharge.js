import React, { Component, useRef } from 'react';
import PrintHeader from './printHeader';
import PrintSalesHeader from './printSalesHeader';
import PrintSalesFooter from './printSalesFooter';

class PrintPayCharge extends React.Component {
  render() {
   
    const transdet = this.props.transdet;
    
    const formatter = new Intl.NumberFormat('fil', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 3
    })
    const tabstyle = {  whiteSpace: "nowrap", width: "1%"};
  
    return (
      // 432
      <div style={{width: "400px"}}>
        <table class="p_table">
          <PrintSalesHeader
            title="Payment Charge"
          code={this.props.code}
          printdate={this.props.printdate}
          />

          <tr>
            <td>
              <div class="p_compDet">
                
                <h3><b>DETAILS</b></h3>
              

                  <div>
                   

                    <b>Customer Name   : {this.props.custname}</b><br />
                    <b>Paid Amount     : {this.props.paid}</b><br />
                    <b>Amount Received : {this.props.amountres}</b><br />
                  </div>

              
              </div>
            </td>
          </tr>
          <tr>
           
             
             
           
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
export default PrintPayCharge;