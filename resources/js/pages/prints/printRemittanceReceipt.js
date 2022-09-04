import React, { Component, useRef } from 'react';
import PrintHeader from '../prints/PrintRemittanceHeader';

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

        // console.log("salestoday")
        // console.log(salestoday)

        return (
            <div class="pos_container">
                <table >
                    <PrintHeader

                    />
                    <center><b>{this.props.branch}</b></center>
                    <tr>
                        <td>
                            <div>
                                <br />

                               Date : {this.props.transac_date}<br />
                               Remitted by : {this.props.remitter}<br /><br />

                               Total Sales : {this.props.cash_received}<br />
                               Petty Cash : {this.props.initialCash}<br />
                               Total : {this.props.totalRecIn}<br />
                               Amount remitted : {this.props.remitted}<br />
                               Difference: {this.props.diff}<br />

                                {this.props.branch_name ? <>Branch: {this.props.branch_name}</> : <></>
                                }<br /><br />

                                {/* Cash Withdrawals : {this.props.withdrawals}<br /><br /> */}

                                {/* Amount remitted : {this.props.remitted}<br />
                               Cash received : {this.props.cash_received}<br />
                               Difference: {this.props.diff}<br /><br />


                               Initial Cash : {this.props.initialCash}<br />
                               Cash Withdrawals : {this.props.withdrawals}<br /><br /> */}

                               Remarks: <br />

                                {this.props.remarks}




                            </div>
                        </td>
                    </tr>


                </table>
                <center>  -------------------------------------------- </center>
                <center><b>{this.props.transac_date} TRANSACTIONS</b></center>
                <table class="pos_table"  >
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Ref#</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            // salestoday.map((item) => (
                            salestoday.map((item) => (
                                <tr>
                                    <td>{item.time}</td>
                                    <td>{item.code}</td>
                                    <td>{item.payable}</td>
                                </tr>

                            ))}

                    </tbody>
                </table>
                {
                    cutoffsales.length > 0 ?
                        <>
                            <br />
                            <br />
                            <center>  -------------------------------------------- </center>
                            <center><b>LATE INPUT TRANSACTIONS</b></center>   
                            {/* <center><b>CUT OFF TRANSACTIONS <br />(Previous Date)</b></center> 5-4-2021*/}
                            <table class="pos_table"  >
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Ref#</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        // salestoday.map((item) => (
                                        cutoffsales.map((item) => (
                                            <tr>
                                                <td>{item.date}</td>
                                                <td>{item.time}</td>
                                                <td>{item.code}</td>
                                                <td>{item.payable}</td>
                                            </tr>

                                        ))}

                                </tbody>
                            </table>
                        </>
                        : <></>
                }
            </div>
        );
    }
}
export default PrintRemittance;