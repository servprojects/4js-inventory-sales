import React, { Component, useRef } from 'react';
// import PrintHeader from './printHeader';
import Http from '../../Http';
import { connect } from 'react-redux';
import ReactToPrint from "react-to-print";
import { Dropdown, Icon, Button } from 'semantic-ui-react';
import PrintReportItem from '../prints/printReportItem';
import PrintAllReleasesItem from '../prints/printAllReleases';
import { Link } from 'react-router-dom';
import ReactHTMLTableToExcel from 'react-html-table-to-excel';
class PrintReport extends Component {

    render() {
        return (
            <>
                <div class=" shadow" style={{width: "150%", padding: "5%"}}  >
                   
                    <table style={{width: "100%"}}>
                        <caption>System updates</caption>
                        <tr><th>Date</th><th>Description</th></tr>
                        <tr><td>02-11-2021</td><td>Improve reports</td></tr>
                        <tr><td>02-11-2021</td><td>Added OR No. in POS</td></tr>
                        <tr><td>02-08-2021</td><td>Cash On Hand Feature</td></tr>
                        <tr><td>02-01-2021</td><td>Item Conversion</td></tr>
                        <tr><td>02-01-2021</td><td>All releases reports</td></tr>
                    </table>
                    
                </div>
           
            </>



        )
    }

}
// export default PrintReport;
const mapStateToProps = (state) => ({
    isAuthenticated: state.Auth.isAuthenticated,
    user: state.Auth.user,
});

export default connect(mapStateToProps)(PrintReport);