import React, { Component } from 'react';
import { connect } from 'react-redux';
import receipt from 'receipt';
import PrintSalesHeader from '../../prints/printSalesHeader';
import PrintSalesFooter from '../../prints/printSalesFooter';
import { parse } from 'date-fns';



class PrintReturn extends React.Component {

   



    render() {
        const returned = this.props.returned;
        const transdet = this.props.transdet;
        const allitems = this.props.items;
        const formatter = new Intl.NumberFormat('fil', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2
        })

        var sub = 0;
        var subret = 0;

         var cust_name;
         var org_type;
         var accountability;
        transdet.map((tr) => {
            cust_name = tr.customer_name;
            org_type = tr.transaction_type;
            accountability = tr.accountability;
        })



        return (
            <>

                {/* <div style={{ width: "219.212598425px" }}> */}
                <div class="pos_container">

                    <PrintSalesHeader
                        title="SALES INVOICE"
                        code={this.props.code}
                        printdate={this.props.printdate}
                        name={cust_name}
                        excess_code={this.props.excess_code}
                        replace_code={this.props.replace_code}
                        org_type={org_type}
                        ptype="Item Return"
                        payable={this.props.payable}
                        late_date={this.props.late_date}
                        series_no= {"RT"+this.props.curBranch+"-"+this.props.series_no}
                    />
                    <center>**<i>Original Transaction Details</i>**</center>
                    <table style={{fontSize: "small"}}>
                        <tr><td>Org Ref#: </td><td>{this.props.orgcode}</td></tr>
                        <tr><td>Org Type#: </td><td>{org_type} - {accountability}</td></tr>
                    </table>

                    <center>**<i>Returned Items</i>**</center>
                    <table class="pos_table"  >
                        <thead>
                            <tr>
                                <th>St</th>
                                <th>Qty</th>
                                <th>Product</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {returned.map((item) => (
                                <tr>
                                    <td>{item.status.substring(1,0)}</td>
                                    <td>{item.quantity}</td>
                                    <td>{item.name} - {item.brand}</td>
                                    <td>{formatter.format(item.unit_price)}</td>
                                    <td>{formatter.format(item.total)}
                                        <div class="hide">  {subret += item.total} </div>
                                    </td>
                                </tr>

                            ))}

                        </tbody>
                    </table>
                    <center> <small><i>***** Nothing Follows *****</i></small> </center>
                    <br/>
                    <center>**<i>Replacement Items</i>**</center>
                    <table class="pos_table"  >
                        <thead>
                            <tr>
                               
                                <th>Qty</th>
                                <th>Product</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allitems.map((item) => (
                                <tr>
                                  
                                    <td>{item.Quantity}</td>
                                    <td>{item.name} - {item.brand}</td>
                                    <td>{formatter.format(item.unit_price)}</td>
                                    <td>{formatter.format(item.total)}
                                        <div class="hide">  {sub += item.total} </div>
                                    </td>
                                </tr>

                            ))}

                        </tbody>
                    </table>
                    <br />
                    <center> <small><i>***** Nothing Follows *****</i></small> </center>
                    {/* <center>   ------------------------------------------------------ </center> */}
                    <center>  -------------------------------------------- </center>
                    <table style={{ width: "250px", fontSize: "small" }}>
                        <tr><td>Replacement total:</td><td>{formatter.format(sub)}</td> </tr>
                        <tr><td>Returned total:</td><td>{formatter.format(subret)}</td> </tr>
                        {this.props.delivery_fee ? <tr><td>Delivery Fee:</td><td>{formatter.format(this.props.delivery_fee)}</td></tr> : <></>}
                        {this.props.discount ? <tr><td>Discount:</td><td>{formatter.format(this.props.discount)}</td></tr> : <></>}
                        <tr><td></td></tr>
                        <tr><td><b>Amount Due:</b></td><td>{formatter.format(this.props.payable)}</td></tr>
                        <tr><td></td></tr>
                    
                                <tr><td>Cash:</td><td>{formatter.format(this.props.amountres)}</td></tr>
                                <tr><td>Change:</td><td>{formatter.format(this.props.amountres - this.props.payable)}</td></tr>
                                       
                            
                         </table>

                    {this.props.dev_add || this.props.dev_cont ?
                        <>
                            {/* <center>   ------------------------------------------------------ </center> */}
                            <center>  -------------------------------------------- </center>
                            <i>Delivery Details</i>
                            <table>
                                <tr>
                                    <td>Address:</td>
                                    <td>{this.props.dev_add}</td>
                                </tr>
                                <tr>
                                    <td>Contact #:</td>
                                    <td>{this.props.dev_cont}</td>
                                </tr>
                            </table>
                        </>
                        : <></>
                    }

                    <PrintSalesFooter
                        code={this.props.code}
                        cashier={this.props.cashier}
                        branch={this.props.branch}
                        excess_code={this.props.excess_code}
                        orgcode={this.props.orgcode}
                    />
                </div>

            </>
        );
    }
}
export default PrintReturn;