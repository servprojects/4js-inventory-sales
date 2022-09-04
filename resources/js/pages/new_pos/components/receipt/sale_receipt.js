import React from 'react';
import { ClientHeader } from './ClientInfo';
import { ServeProHeader } from './ServeproDetails';
import Barcode from '../barcode';
import { ReceiptNote } from './receiptNote';

// export class ComponentToPrint extends React.PureComponent {
export default  class ComponentToPrint extends React.PureComponent {
   capName(name) {
    return name.replace(/\b(\w)/g, s => s.toUpperCase());
  }
  divider() {
    return (
      <>
        <center>
          ________________________________________
        </center>
      </>
    )
  }
  transInfo() {
    return (
      <table style={{ width: '100%' }}>
        <tbody>
          <tr><td> Ctrl No.</td><td align="right">{this.props.data.curCtrlno}</td> </tr>
          <tr><td>Type</td><td align="right">Cash</td> </tr>
          <tr><td>Staff</td><td align="right">{this.props.data.cashier}</td> </tr>
          <tr><td>Date</td><td align="right">
          {this.props.rctype == 'report' ?  <>{this.props.data.date_printed}</> : <>{this.props.data.date_transac} {this.props.time}</> }
            </td> </tr>
        </tbody>
      </table>
    )

  }

  amountDetails(formatter) {
    return (
      <table style={{ width: '100%' }}>
        <tbody>
          <tr><td>Item Total</td><td align="right">{formatter.format(this.props.data.itemPayable)}</td> </tr>
          <tr><td>Discount</td><td align="right">{formatter.format(this.props.data.discount)}</td> </tr>
          {/* <tr><td>Total PHP</td><td align="right">{formatter.format(this.props.data.payable)}</td> </tr> */}
          
        </tbody>
      </table>
    )
  }

  itemDetails(items,formatter) {
    return (
      <table style={{ width: '100%' }}>
        <thead>
          <tr>
            <td><b>Item Description</b> </td>
            <td align="right"><b>Amount</b> </td>
          </tr>
        </thead>
        <tbody>
          {items.map((row) => (
            <tr>
              <td>{row.name} {row.brand} x{row.Quantity}</td>
              <td align="right">{formatter.format(row.unit_price)}</td>
            </tr>
          ))}

        </tbody>
      </table>
    )
  }

  soldTo() {
    return (
      <table style={{ width: '100%' }}>
        <tbody>
          <tr><td><b>SOLD TO</b></td><td align="right"></td> </tr>
          <tr><td>TIN NUMBER</td><td align="right">{this.props.data.st_tin_num}</td> </tr>
          <tr><td>NAME</td><td align="right">{this.capName((this.props.data.customer_name ? this.props.data.customer_name : ' ').toLowerCase())}</td> </tr>
          <tr><td>ADDRESS</td><td align="right">{this.capName((this.props.data.address?this.props.data.address: '').toLowerCase())}</td> </tr>
          <tr><td>BUS. TYPE</td><td align="right">{this.capName((this.props.data.st_bus_type?this.props.data.st_bus_type:'').toLowerCase())}</td> </tr>
        </tbody>
      </table>
    )
  }

  taxDetails(formatter) {
    const itmpayable = this.props.data.itemPayable ? this.props.data.itemPayable : 0;
    const vatsale = itmpayable/1.12
    return (
      <table style={{ width: '100%' }}>
        <tbody>
          <tr><td>VATable Sales</td><td align="right">{formatter.format(vatsale)}</td> </tr>
          <tr><td>VAT Amount</td><td align="right">{formatter.format(vatsale*.12)}</td> </tr>
          <tr><td>VAT Exempt Sales</td><td align="right">{formatter.format(0)}</td> </tr>
          <tr><td>Amount Due</td><td align="right">{formatter.format(this.props.data.payable)}</td> </tr>
          <tr><td>Cash</td><td align="right">{formatter.format(this.props.data.amount_received)}</td> </tr>
          <tr><td>Change</td><td align="right">{formatter.format(this.props.data.amount_received - this.props.data.payable)}</td> </tr>
        </tbody>
      </table>
    )
  }

  render() {
    const itm = this.props.items;
    const formatter = new Intl.NumberFormat('fil', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    })
    

    return (
      <table class="pos_container_new">
        <thead>

        </thead>
        <tbody>
          <tr>
            <td>
              <ClientHeader />
              <br />
              <center> <b>Sales Invoice</b> </center>
              <br />
              {this.divider()}
              {this.transInfo()}
              {this.divider()}
              {this.itemDetails(itm, formatter)}
              {this.divider()}
              {this.amountDetails(formatter)}
              {this.divider()}
              {this.taxDetails(formatter)}
              {this.divider()}
              {this.soldTo()}
              {this.divider()}
              <ReceiptNote/>
              {this.divider()}
              <ServeProHeader />
              <Barcode code={this.props.data.trasaction_code} />
              <center>
                {this.props.data.trasaction_code}
              </center>
            </td>
          </tr>
        </tbody>
      </table>
    );
  }
}