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
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
class PrintReport extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);

        // Initial state.
        this.state = {
            error: null,
            upIdItem: null,
            data: [],
        };
        // API endpoint.

    }

    componentDidMount() {
        this._isMounted = true
        Http.post(`/api/v1/reports/deleted/receivings`, { id: this.props.id })

            .then((response) => {
                // const { data } = response.data.transaction.data;
                if (this._isMounted) {



                    this.setState({
                        data: response.data.trans,
                    });
                    console.log("dels")
                    console.log(response.data.trans)
                    console.log("dels")
                }
            })

            .catch(() => {
                if (this._isMounted) {
                    this.setState({
                        error: 'Unable to fetch data.',
                    });
                }
            });
    }


    // 
    render() {

        const { data } = this.state;

        const total = (cell, row) => {
            return (
                <>
                    {row.original_price * row.quantity}
                </>
            );
        }
        return (
            <>
                 <BootstrapTable
                            // ref='table'
                            data={data}
                            pagination={true}
                            search
                        // options={options} exportCSV
                        >
                            <TableHeaderColumn isKey={true} hidden width="100" dataField='id'>id</TableHeaderColumn>
                            <TableHeaderColumn width="200" dataField='delete_date'>Date Deleted</TableHeaderColumn>
                            <TableHeaderColumn tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} dataField='item_name'>Item Name</TableHeaderColumn>
                            <TableHeaderColumn width="100" dataField='quantity'>Quantity</TableHeaderColumn>
                            <TableHeaderColumn hidden={true} width="120" dataField='beg_balance'>Beg Item Bal</TableHeaderColumn>
                            <TableHeaderColumn hidden={true} width="120" dataField='end_bal'>End Item Bal</TableHeaderColumn>
                            <TableHeaderColumn width="250" dataField='supplier'>Supplier</TableHeaderColumn>
                            <TableHeaderColumn width="100" dataField='original_price'>Org.  Price</TableHeaderColumn>
                            <TableHeaderColumn width="100" dataField='original_price' dataFormat={total}>Total</TableHeaderColumn>
                            <TableHeaderColumn width="100" dataField='unit_price'>SRP</TableHeaderColumn>
                        </BootstrapTable>




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