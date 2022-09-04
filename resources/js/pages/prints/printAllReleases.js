import React, { Component, useRef } from 'react';
import PrintHeader from './printHeader';
import ExHead from './excelHeader';
import { it } from 'date-fns/locale';

class PrintReportItem extends React.Component {


    dateRange = () => {
        var sd = 0, sye = 0, smo = 0, sda = 0, ed = 0, eye = 0, emo = 0, eda = 0;
        if (this.props.sdate) {

            sd = new Date(this.props.sdate);
            sye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(sd);
            smo = new Intl.DateTimeFormat('en', { month: 'short' }).format(sd);
            sda = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(sd);

            ed = new Date(this.props.edate);
            eye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(ed);
            emo = new Intl.DateTimeFormat('en', { month: 'short' }).format(ed);
            eda = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(ed);
        }

        return (<> {this.props.sdate ? <>{smo + '. ' + sda + ', ' + sye}-{emo + '. ' + eda + ', ' + eye}</> : <></>} </>);
    }


    excessCalc = (code, rcode, repcode) => {
        // const { data } = this.props;
        // var allTr = data.filter(function (v) {
        //     return v.code == code;
        // })

        // var rets = allTr.filter(function (v) {
        //     return v.ret_code == rcode;
        // })

        // var totalRets = 0;
        // var totalReps = 0;
        // var exCalc = 0;
        // if (rcode != ' ') {

        //     var retsCon = rets.filter(function (v) {
        //         // return v.item_status === "Returned GC" || v.item_status === "Defective";
        //         return v.item_status !== "Replacement";
        //     })
        //     retsCon.map((i) => (totalRets += parseInt(i.subtotal)))

        //     var reps = rets.filter(function (v) {
        //         return v.item_status === "Replacement";
        //     })
        //     reps.map((i) => (totalReps += parseInt(i.subtotal)))

        //     // exCalc = totalRets + totalReps;

        //     if (totalRets >= totalReps) {
        //         exCalc = 0;
        //     } else {
        //         exCalc = totalReps - totalRets;
        //     }
        //     // rets.map((i) => (exCalc += parseInt(i.subtotal)))
        // }


        // return exCalc;
        const { data } = this.props;
        var allTr = data.filter(function (v) {
            return v.code == code;
        })

        var reps = allTr.filter(function (v) {
            return v.item_status === "Replacement";
        })

        var rets = allTr.filter(function (v) {
            return v.item_status !== "Replacement" && v.item_status !== "Released";
        })

        var totalReplace = 0; //3-20-2021
        reps.map((i) => (totalReplace += parseFloat(i.subtotal)))//3-20-2021

        var totalReturned = 0; //3-20-2021
        rets.map((i) => (totalReturned += parseFloat(i.subtotal)))//3-20-2021

        var excess = totalReplace - totalReturned;

        excess = excess >= 1 ? excess : " ";

        // if (totalReturned >= totalReplace) {
        //     excess = " ";
        // } else {
        //     excess = excess;
        // }

        return (
            <>
             
                { rcode != " " || repcode != " " ? excess : <></>}
            </>
        );
    }

    calculated = (code, rcode) => {
        const { data } = this.props;
        var allTr = data.filter(function (v) {
            return v.code == code;
        })

        var released = allTr.filter(function (v) {
            return v.item_status === "Released";
        })

        // var rets = allTr.filter(function (v) {
        //     return v.item_status === "Returned GC" || v.item_status === "Defective";
        // })

        var reps = allTr.filter(function (v) {
            return v.item_status === "Replacement";
        })

        var reps = allTr.filter(function (v) {
            return v.item_status === "Replacement";
        })

        var rets = allTr.filter(function (v) {
            return v.item_status !== "Replacement" && v.item_status !== "Released";
        })

        var totalReleased = 0;
        released.map((i) => (totalReleased += parseFloat(i.subtotal)))

        var totalReplace = 0; //3-19-2021
        reps.map((i) => (totalReplace += parseFloat(i.subtotal)))//3-19-2021

        var totalReturned = 0; //3-19-2021
        rets.map((i) => (totalReturned += parseFloat(i.subtotal)))//3-19-2021

        // var totalRets = 0;
        // rets.map((i) => (totalRets += parseInt(i.subtotal)))

        // var totalReps = 0;
        // reps.map((i) => (totalReps += parseInt(i.subtotal)))

        // var execess = 0;

        // if(totalRets > totalReps ){
        //     execess = 0;
        // }else{
        //     execess = totalReps - totalRets;
        // }

        // var allExcess = 0;
        // allTr.map((itm) => (
        //     this.excessCalc(itm.code, itm.ret_code) == 0 ? allExcess += 0 :
        //         itm.item_status !== "Replacement" ? allExcess += 0 :
        //             allExcess += this.excessCalc(itm.code, itm.ret_code)

        // ))

        var calculated = (totalReleased + totalReplace) - totalReturned;//3-19-2021
        // var calculated = totalReleased + allExcess;
        // var calculated = totalReleased + this.excessCalc(code,rcode);
        // var calculated = totalReleased + execess;



        // return allExcess
        return calculated
        // return totalReleased

    }


    contentSales = (e, show) => {
        var overSale = 0;
        e.map((itm, index, arr) => (
            itm.last_trans === itm.id ? overSale += this.calculated(itm.code, itm.ret_code) : " "
        ))

        var addons = [];
        var overDeliveries = 0;
        var overDiscount = 0;
        this.props.addons ? addons = this.props.addons : addons = [];

        if (this.props.type == "General") {
            addons.map((dev) => {
                overDeliveries += dev.delivery_fee
                overDiscount += dev.discount
            })
            overDiscount = Number.isNaN(overDiscount) ? 0 : overDiscount
            overDeliveries = Number.isNaN(overDeliveries) ? 0 : overDeliveries
        }

        return (
            <>
                <thead>
                    {
                        show ?
                            <>
                                <ExHead
                                    colspan="18"
                                    title="All Releases"
                                />
                            </>
                            :
                            <></>
                    }
                    <tr>
                        <td colspan="18">
                            <center><b>{this.dateRange()}</b></center>
                            <center>   <b>   {this.props.branch_name} </b> </center>
                        </td>
                    </tr>
                    <tr>
                        <th>SN</th>
                        <th>Ref#</th>
                        <th>OR#</th>
                        <th>Type</th>
                        <th>DATE</th>
                        <th>Branch</th>
                        <th>STATUS</th>
                        <th>ACOUNTABILITY</th>
                        <th>ITEM DESCRIPTION</th>
                        <th>BRAND</th>
                        <th>UNIT</th>
                        <th>QTY</th>
                        <th>SRP</th>
                        <th>SUBTOTAL</th>
                        <th>Return Ref#</th>
                        <th>Replace Ref#</th>
                        <th>Excess Amt.</th>
                        {/* <th>TOTAL</th> */}
                        <th>CALCULATED</th>
                        <th>Description</th>



                    </tr>
                </thead>
                <tbody>
                    {e.map((itm, index, arr) => (
                        <>


                            <tr>

                                <td>
                                    {itm.first_trans === itm.id ?
                                        itm.series_no_pr : <></>}
                                        {/* {itm.code} */}
                                </td>
                                <td>
                                    {itm.first_trans === itm.id ?
                                        itm.code : <></>}
                                        {/* {itm.code} */}
                                </td>
                                <td>
                                    {itm.first_trans === itm.id ?
                                        itm.receipt_code : <></>}
                                </td>
                                <td>
                                    {itm.first_trans === itm.id ?
                                        itm.transaction_type : <></>}
                                </td>
                                <td>
                                    {/* {itm.first_trans === itm.id ?
                                        itm.date_transac : <></>}//3-19-2021 */}
                                    {itm.date_transac}
                                </td>
                                <td>
                                    {itm.first_trans === itm.id ?
                                        itm.branch_name : <></>}
                                </td>
                                <td>
                                    {/* {itm.first_trans === itm.id ?
                                        itm.item_status : <></>} //3-19-2021*/}
                                    {itm.item_status}
                                </td>
                                {/* <td>{itm.branch_name}</td> */}
                                {/* <td>{itm.item_status}</td> */}
                                <td> {itm.first_trans === itm.id ?
                                    itm.accountability : <></>}</td>
                                <td>{itm.item}</td>
                                <td>{itm.brand}</td>
                                <td>{itm.unit}</td>
                                <td>{itm.quantity}</td>
                                <td>{itm.srp}</td>
                                <td>{itm.subtotal}</td>
                                {/* <td>{itm.ret_code}</td> //3-19-2021 */}
                                <td>{itm.return_code}</td>
                                <td>{itm.rep_code}</td>
                                <td>{

                                    this.excessCalc(itm.code, itm.ret_code) == 0 ? ' ' :
                                        itm.item_status == "Returned GC" || itm.item_status == "Defective" ? ' ' :
                                            this.excessCalc(itm.code, itm.ret_code, itm.rep_code)

                                }</td>
                                {/* <td>{itm.total}</td> */}
                                <td>
                                    {itm.last_trans === itm.id ?
                                        this.calculated(itm.code, itm.ret_code)
                                        : <></>

                                    }</td>
                                <td>{itm.description}</td>

                            </tr>

                        </>
                    ))}
                    <tr>
                        {<>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </>}
                        <td><b>TOTAL</b></td>
                        <td><b>{overSale}</b></td>
                    </tr>


                </tbody>
            </>
        )
    }



    render() {
        const allitems = this.props.items;
        var sub = 0;
        const formatter = new Intl.NumberFormat('fil', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 3
        })
        // var str = this.props.type;
        // const title = str.toUpperCase() + " " + "REQUEST";
        var data = [];
        this.props.data ? data = this.props.data : data = [];


        return (
            <div style={{ marginLeft: "2%", marginRight: "2%" }}>
                <table class="p_table">
                    <PrintHeader
                    // title={title}
                    // code={this.props.code}
                    />


                    <tr>
                        <td>
                            <div style={{ marginRight: "3%", zoom: "80%" }}>
                                <br />

                                <div class="table-responsive">
                                    <table class="table table-bordered">
                                        {this.contentSales(data)}
                                    </table>

                                    <div style={{ display: "none" }}>
                                        <table id={this.props.type} class="table table-bordered">
                                            {this.contentSales(data, "show")}
                                        </table>
                                    </div>

                                </div>



                            </div>
                        </td>
                    </tr>
                </table>

            </div>
        );
    }
}
export default PrintReportItem;