import React, { Component, useRef } from 'react';
import { Link } from 'react-router-dom';
import ExHead from '../prints/excelHeader';
import { Dropdown, Icon, Button } from 'semantic-ui-react';
import ReactHTMLTableToExcel from 'react-html-table-to-excel';
class ExRep extends React.Component {

    items = () => {
        const { data, filter, type } = this.props.location.state;
        console.log("ex")
        console.log(data)
        return (
            <>
                <tr>
                    <th>Code</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Accountability</th>
                    <th>SRP</th>
                    <th>Quantity</th>
                    <th>End Balance</th>
                    <th>End Collectible</th>
                    <th>Updated at</th>

                </tr>


                <tbody>
                    {data.map((itm, index, arr) => (
                        <tr>
                            <td>{itm.code}</td>
                            <td>{itm.date_transac}</td>
                            <td>{itm.transaction_type}</td>
                            <td>{itm.item_status}</td>
                            <td>{itm.accountability}</td>
                            <td>{itm.unit_price}</td>
                            <td>{itm.quantity}</td>
                            <td>{itm.end_balance}</td>
                            <td>{itm.end_collectible}</td>
                            <td>{itm.updated_at}</td>

                        </tr>
                    ))}

                </tbody>


            </>
        )
    }

    customer = () => {
        const { data, filter, type } = this.props.location.state;
        
        return (
            <>
                <tr>
                    <th>Code</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount Due</th>
                    <th>Beg Balance</th>
                    <th>End Balance</th>

                </tr>


                <tbody>
                    {data.map((itm, index, arr) => (
                        <tr>
                            <td>{itm.code}</td>
                            <td>{itm.date_transac}</td>
                            <td>{itm.transaction_type}</td>
                            <td>{itm.payable}</td>
                            <td>{itm.beg_charge_bal}</td>
                            <td>{itm.end_charge_bal}</td>

                        </tr>
                    ))}

                </tbody>


            </>
        )
    }
    supplier = () => {
        const { data, filter, type } = this.props.location.state;
       
        return (
            <>
                <tr>
                    <th>Code</th>
                    <th>Charge Code</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Payable</th>
                    <th>End Balance</th>
                    <th>Last Update</th>

                </tr>


                <tbody>
                    {data.map((itm, index, arr) => (
                        <tr>
                            <td>{itm.code}</td>
                            <td>{itm.charge_transaction_code}</td>
                            <td>{itm.date_transac}</td>
                            <td>{itm.transaction_type}</td>
                            <td>{itm.payable}</td>
                            <td>{itm.end_charge_bal}</td>
                            <td>{itm.last_update}</td>

                        </tr>
                    ))}

                </tbody>


            </>
        )
    }
    content = (dat, show, r) => {
        const { data, type, ledname, itcmcode, branches, branch } = this.props.location.state;
        // const { itOn } = this.state;
        if (branches) {
            var result = branches.filter(function (v) {
                return v.id == branch;
            })

        }

        var branchname = " "
        branch ? branchname = result[0].name : branchname = " ";
        console.log(type)
        // const range = r.smoS + " " + r.sda + ", " + r.sye
        return (
            <>
                <thead>
                    {
                        show ?
                            <>
                                <ExHead
                                    colspan= {
                                        type == "Item" ? "10" : 
                                        type == "Supplier" ? "7" : 
                                        type == "Customer" || type=="Project"|| type=="Office" ? "6" :
                                        "10"
                                    }
                                    title={
                                        <>
                                            {

                                                <>   {branchname} <br />{type} Ledger<br /> {ledname} <br/><small> {itcmcode} </small> </>
                                            }

                                        </>
                                    }

                                />
                            </>
                            :
                            <> </>
                    }

                </thead>
                <>{
                type == "Item" ? this.items() : 
                type == "Customer" || type=="Project" || type=="Office"? this.customer():  
                type == "Supplier" ? this.supplier() : 
                <></>}


                </>
                {/* {type == "Remittances" ? this.remittance() : this.genTrans()} */}

            </>
        )

    }


    render() {
        const { data, branch, type, ledname, itcmcode, branches } = this.props.location.state;
        var sd = 0, sye = 0, smo = 0, sda = 0, ed = 0, eye = 0, emo = 0, eda = 0, smoS, emoS;
        // sd = new Date();
        // sye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(sd);
        // smo = new Intl.DateTimeFormat('en', { month: 'numeric' }).format(sd);
        // smoS = new Intl.DateTimeFormat('en', { month: 'short' }).format(sd);
        // sda = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(sd);
        // var blabel = branch ? " " + branch : " ALL";
        // var finitial = filter ? filter : type

        if (branches) {
            var result = branches.filter(function (v) {
                return v.id == branch;
            })
        }



        var branchname = " "
        branch ? branchname = result[0].name : branchname = " ";

        var filename = type + "Ledger" + "_" + itcmcode + "_" + branchname;

        // console.log("exdat")
        // console.log(data)
        // const ranges = {
        //     sye: sye,
        //     smoS: smoS,
        //     sda: sda
        // }

        return (
            <>
                <div className="contentTransactSales">
                    <Link to={{ pathname: this.props.location.state.path, state: { type: this.props.location.state.type, path: this.props.location.state.path, id: this.props.location.state.id } }}>
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
                        {/* {this.content([], "show", ranges)} */}
                        {this.content([], "show", " ")}
                    </table>
                </div>
            </>
        );
    }
}
export default ExRep;