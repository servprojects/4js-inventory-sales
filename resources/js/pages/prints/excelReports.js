import React, { Component, useRef } from 'react';
import { Link } from 'react-router-dom';
import ExHead from '../prints/excelHeader';
import { Dropdown, Icon, Button } from 'semantic-ui-react';
import ReactHTMLTableToExcel from 'react-html-table-to-excel';
class ExRep extends React.Component {

    genTrans = () => {
        const { data, filter, type } = this.props.location.state;
        return (
            <>
                <tr>
                    <th>Branch</th>
                    <th>Code</th>
                    <th>Date</th>
                    <th> {filter == "Receiving" || type == "Receiving" ? " Recieved by" : "Particular"} </th>
                    <th>Type</th>
                    <th>Accountability</th>
                    <th>Amount Due</th>
                    <th>Total Items</th>

                </tr>


                <tbody>
                    {data.map((itm, index, arr) => (
                        <tr>
                            <td>{itm.branch}</td>
                            <td>{itm.code}</td>
                            <td>{itm.date}</td>
                            <td>{itm.cust_name}</td>
                            <td>{itm.type}</td>
                            <td>{itm.accountability}</td>
                            <td>{itm.payable}</td>
                            <td>{itm.total_items}</td>

                        </tr>
                    ))}

                </tbody>


            </>
        )
    }
    remittance = () => {
        const { data } = this.props.location.state;
        return (
            <>
                <tr>
                    <th>Date</th>
                    <th>Branch</th>
                    <th>Remitter</th>
                    <th>Amount Recieved</th>
                    <th>System Amount</th>
                    <th>Difference</th>
                    <th>Remarks</th>

                </tr>


                <tbody>
                    {data.map((itm, index, arr) => (
                        <tr>
                            <td>{itm.date}</td>
                            <td>{itm.branch}</td>
                            <td>{itm.remitter}</td>
                            <td>{itm.amount_remitted}</td>
                            <td>{itm.sys_amount}</td>
                            <td>{itm.amount_remitted - itm.sys_amount}</td>
                            <td>{itm.remark}</td>

                        </tr>
                    ))}

                </tbody>


            </>
        )
    }

    content = (dat, show, r) => {
        const { data, branch, type, begDate, endDate, filter, branches } = this.props.location.state;
        // const { itOn } = this.state;
        var result = branches.filter(function (v) {
            return v.id == branch;
        })
       
        var branchname = " "
         branch ? branchname = result[0].name : branchname = " ";
        // console.log(result)
        const range = r.smoS + " " + r.sda + ", " + r.sye
        return (
            <>
                <thead>
                    {
                        show ?
                            <>
                                <ExHead
                                    colspan="8"
                                    title={
                                        <>
                                            {

                                                <>   {branchname} <br /> {filter ? filter : type} Transaction <br /> {begDate}---{endDate}</>
                                            }

                                        </>
                                    }

                                />
                            </>
                            :
                            <></>
                    }

                </thead>

                {type == "Remittances" ? this.remittance() : this.genTrans()}

            </>
        )

    }


    render() {
        const { branch, filter, type, begDate, endDate, branches } = this.props.location.state;
        var sd = 0, sye = 0, smo = 0, sda = 0, ed = 0, eye = 0, emo = 0, eda = 0, smoS, emoS;
        sd = new Date();
        sye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(sd);
        smo = new Intl.DateTimeFormat('en', { month: 'numeric' }).format(sd);
        smoS = new Intl.DateTimeFormat('en', { month: 'short' }).format(sd);
        sda = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(sd);
        var blabel = branch ? " " + branch : " ALL";
        var finitial = filter ? filter : type

        var result = branches.filter(function (v) {
            return v.id == branch;
        })
        var branchname = " "
        branch ? branchname = result[0].name : branchname = " ";
        // var branchname = result[0].name
        // var filename = finitial + "_" + sye + smo + sda + blabel;
        var filename = finitial + "_" + begDate + "---" + endDate + "--" + branchname;

        const ranges = {
            sye: sye,
            smoS: smoS,
            sda: sda
        }
        return (
            <>
                <div className="contentTransactSales">
                    <Link to={{ pathname: this.props.location.state.path, state: { type: this.props.location.state.type, path: this.props.location.state.path } }}>
                        <Button icon labelPosition='left'><Icon name='angle left' /> Back to Tansaction view </Button>
                    </Link>
                    <ReactHTMLTableToExcel
                        id="allItems"
                        className=" ui button"
                        table="gen"
                        filename={filename}
                        sheet="all items"
                        buttonText="Download as Excel" />
                    <br />
                    <br />
                    <table id="gen" class="table table-bordered">
                        {this.content([], "show", ranges)}
                    </table>
                </div>
            </>
        );
    }
}
export default ExRep;