import React, { Component, useRef } from 'react';
// import PrintHeader from './printHeader';
import Http from '../../Http';
import { connect } from 'react-redux';
import ReactToPrint from "react-to-print";
import { Dropdown, Icon, Button } from 'semantic-ui-react';
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
        // const { type } = this.props.location.state;
       
    }





   
    
    content = (dat, show, r) => {
        const { data } = this.props;
      
        const range = r.smoS + " " + r.sda+ ", "+ r.sye 
        return (
            <>
                <thead>
                   
                                <ExHead
                                    colspan={5}
                                    title="Payments"
                                    range= {range}
                                />
                           
                    <tr>
                        <th>Code</th>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Payable</th>
                        {/* <th>Beg. Balance</th> */}
                        <th>End. Balance</th>
                       
                    </tr>
                </thead>

                <tbody>
                    {data.map((itm, index, arr) => (
                        <tr>
                            <td>{itm.code}</td>
                            <td>{itm.date_transac}</td>
                            <td>{itm.transaction_type}</td>
                            <td>{itm.payable}</td>
                            {/* <td>{itm.beg_charge_bal}</td> */}
                            <td>{itm.end_charge_bal}</td>
                           
                        </tr>
                    ))}

                </tbody>

            </>
        )

    }


    render() {
       
        // const { branch } = this.props.location.state;
        var sd = 0, sye = 0, smo = 0, sda = 0, ed = 0, eye = 0, emo = 0, eda = 0, smoS, emoS;
        sd = new Date();
        sye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(sd);
        smo = new Intl.DateTimeFormat('en', { month: 'numeric' }).format(sd);
        smoS = new Intl.DateTimeFormat('en', { month: 'short' }).format(sd);
        sda = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(sd);
        // var blabel = branch ? " "+branch : " ALL";
        // var filename = "Items" + "_" + sye + smo + sda + blabel;

        const ranges = {
            sye:sye,
            smoS:smoS,
            sda:sda
        }
        return (
            <>
                <div className="contentTransactSales">
               
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
