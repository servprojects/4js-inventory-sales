import React, { Component } from 'react';
import { connect } from 'react-redux';
import receipt from 'receipt';
import PrintSalesHeader from '../../prints/printSalesHeader';
import PrintSalesFooter from '../../prints/printSalesFooter';
import { parse } from 'date-fns';
import { ItemMeta } from 'semantic-ui-react';



class PrintReturn extends React.Component {





    render() {
        const allitems = this.props.items;
        const formatter = new Intl.NumberFormat('fil', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2
        })

        var sub = 0;
        return (
            <>

                {/* <div style={{ width: "219.212598425px" }}> */}
                <div class="pos_container">

                    <PrintSalesHeader
                        title="SALES INVOICE"
                        code={this.props.code}
                        printdate={this.props.printdate}
                        name={this.props.name}
                        ptype={this.props.type}
                        accountability={this.props.accountability}
                        late_date={this.props.late_date}
                        series_no={this.props.type != "Charge" ? "DS"+this.props.curBranch+"-" + this.props.series_no : "CH"+this.props.curBranch+"-" + this.props.series_no}
                    />

                    {/* {
                        this.props.type != "Charge" ?
                            <>
                                DS-{this.props.series_no}
                            </>
                            :
                            <>
                                CH-{this.props.series_no}
                            </>
                    } */}

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
                                    <td>{item.Quantity ? item.Quantity : item.quantity}<small>x</small></td>
                                    <td>{item.name ? item.name : item.item_name} - {item.brand}</td>
                                    <td>{formatter.format(item.unit_price)}</td>
                                    <td>{item.total ? formatter.format(item.total) :
                                        formatter.format(parseFloat(item.Quantity ? item.Quantity : item.quantity) * parseFloat(item.unit_price))}
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
                        {this.props.delivery_fee || this.props.discount ? <tr><td>Item total:</td><td>{formatter.format(sub)}</td> </tr> : <></>}
                        {this.props.delivery_fee ? <tr><td>Delivery Fee:</td><td>{formatter.format(this.props.delivery_fee)}</td></tr> : <></>}
                        {this.props.discount ? <tr><td>Discount:</td><td>{formatter.format(this.props.discount)}</td></tr> : <></>}
                        <tr><td><b>Amount Due:</b></td><td>{formatter.format(this.props.payable)}</td></tr>

                        {this.props.type != "Charge" ?
                            <>
                                <tr><td>Cash:</td><td>{formatter.format(this.props.amountres)}</td></tr>
                                <tr><td>Change:</td><td>{formatter.format(this.props.amountres - this.props.payable)}</td></tr>
                            </>
                            : <></>}                    </table>

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
                    />

                    
                </div>

            </>
        );
    }
}
export default PrintReturn;