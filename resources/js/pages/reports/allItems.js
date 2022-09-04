import React, { Component, useRef } from 'react';
// import PrintHeader from './printHeader';
import Http from '../../Http';
import { connect } from 'react-redux';
import ReactToPrint from "react-to-print";
import { Dropdown, Icon, Button } from 'semantic-ui-react';
import PrintReportItem from '../prints/printReportItem';
import { Link } from 'react-router-dom';
import ReactHTMLTableToExcel from 'react-html-table-to-excel';
import ExHead from '../prints/excelHeader';
class AllItems extends Component {
    _isMounted = false
    constructor(props) {
        super(props);
        this.state = {
            itOn: false,
            data: [],
            normal: "normal",
        }
    }

    componentDidMount() {
        this._isMounted = true
        const { type } = this.props.location.state;
        // var api= type == "Receiving" ? `/api/v1/reports/indvPur` : type == "General" ? `/api/v1/reports/indvSalesRev` : " ";

        // const subs = {
        //     type: type,
        //     begdate: this.props.location.state.begDate,
        //     enddate: this.props.location.state.endDate,
        //     branch: this.props.location.state.branch
        // }
        // Http.post(api, subs)
        //     .then((response) => {

        //         if (this._isMounted) {

        //             this.setState({
        //                 data: response.data.items,

        //             });
        //         }
        //     })

        //     .catch((error) => {
        //         console.log(error)
        //     });
    }





    setNormalPrint = (e) => {
        this._isMounted = true
        if (this._isMounted) {

            this.setState({
                normal: "no",

            });
        }
    }
    onlyItems = (e) => {
        this._isMounted = true
        const { itOn } = this.state;
        if (this._isMounted) {

            this.setState({
                itOn: itOn == false ? true : false,

            });
        }
    }
    content = (dat, show, r) => {
        const { data, branch } = this.props.location.state;
        const { itOn } = this.state;
        const range = r.smoS + " " + r.sda+ ", "+ r.sye 
        return (
            <>
                <thead>
                    {
                        show ?
                            <>
                                <ExHead
                                    colspan={itOn === true ? "7" : "9"}
                                    title={itOn == true ? "All Items" :
                                    <>
                                    {
                                        branch ?<> {branch+ " " }</> : "General "
                                    }
                                     
                                     Balances
                                    </>
                                    
                                    }
                                    range= {range}
                                />
                            </>
                            :
                            <></>
                    }
                    <tr>
                        <th>Code</th>
                        <th>Category</th>
                        <th>Item Description</th>
                        <th>Brand</th>
                        <th>Size</th>
                        <th>Unit</th>
                        <th>SRP</th>
                        {
                            itOn === false ?
                                <>
                                    <th>Balance</th>
                                    <th>Collectible</th>
                                </>
                                : <></>
                        }
                    </tr>
                </thead>

                <tbody>
                    {data.map((itm, index, arr) => (
                        <tr>
                            <td>{itm.code}</td>
                            <td>{itm.category}</td>
                            <td>{itm.item}</td>
                            <td>{itm.brand}</td>
                            <td>{itm.size}</td>
                            <td>{itm.unit}</td>
                            <td>{itm.unit_price}</td>
                            {
                                itOn === false ?
                                    <>
                                        <td>{itm.balance}</td>
                                        <td>{itm.collectible_amount}</td>
                                    </>
                                    : <></>
                            }
                        </tr>
                    ))}

                </tbody>

            </>
        )

    }


    render() {
        const { itOn } = this.state;
        const { branch } = this.props.location.state;
        var sd = 0, sye = 0, smo = 0, sda = 0, ed = 0, eye = 0, emo = 0, eda = 0, smoS, emoS;
        sd = new Date();
        sye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(sd);
        smo = new Intl.DateTimeFormat('en', { month: 'numeric' }).format(sd);
        smoS = new Intl.DateTimeFormat('en', { month: 'short' }).format(sd);
        sda = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(sd);
var blabel = branch ? " "+branch : " ALL";
        var filename = "Items" + "_" + sye + smo + sda + blabel;

        const ranges = {
            sye:sye,
            smoS:smoS,
            sda:sda
        }
        return (
            <>
                <div className="contentTransactSales">
                {/* /stocks */}
                <Link to="/stocks">
                        <Button icon labelPosition='left'><Icon name='angle left' /> Back to Tansaction view </Button>
                    </Link>
                    <div style={{float : "right"}}>
                        <ReactHTMLTableToExcel
                            id="allItems"
                            className=" ui button"
                            table="allItemsB"
                            filename={filename}
                            sheet="all items"
                            buttonText="Download as Excel" />
                            &nbsp; &nbsp; &nbsp;
                            <Button onClick={this.onlyItems} >{itOn === false ? "Items only" : "Balances"} </Button>
                    </div>

                    <br />
                    <br />
                    <table id="allItemsB" class="table table-bordered">
                        {this.content([], "show", ranges)}
                    </table>

                </div>

            </>

        );
    }
}
// export default PrintReport;
const mapStateToProps = (state) => ({
    isAuthenticated: state.Auth.isAuthenticated,
    user: state.Auth.user,
});

export default connect(mapStateToProps)(AllItems);
