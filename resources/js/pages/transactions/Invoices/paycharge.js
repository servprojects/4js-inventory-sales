import React, { Component } from 'react';
import { connect } from 'react-redux';
import receipt from 'receipt';
import PrintSalesHeader from '../../prints/printSalesHeader';
import PrintSalesFooter from '../../prints/printSalesFooter';
import { parse } from 'date-fns';



class PrintReturn extends React.Component {





    render() {

        const formatter = new Intl.NumberFormat('fil', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2
        })




        return (
            <>

                {/* <div style={{ width: "219.212598425px" }}> */}
                <div class="pos_container">

                    <PrintSalesHeader
                        title="SALES INVOICE"
                        code={this.props.code}
                        printdate={this.props.printdate}
                        name={this.props.custname}
                        excess_code={this.props.excess_code}
                        ptype="Payment of Charge"
                        late_date={this.props.late_date}
                    />

                    <b>Paid Amount     : {this.props.paid}</b><br />
                    <b>Amount Received : {this.props.amountres}</b><br />



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