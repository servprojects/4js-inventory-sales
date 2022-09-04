import React, { Component, useRef } from 'react';

import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import { Dropdown, Icon, Button } from 'semantic-ui-react';
class PrintPayCharge extends React.Component {
    totalitmFormatter = (cell, row) => {
        return (

            <div>
                {row.quantity * row.unit_price}
                {/* {row.req_type } */}
            </div>
        );

    }
    render() {

        const transdet = this.props.transdet;

        const formatter = new Intl.NumberFormat('fil', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 3
        })
        const tabstyle = { whiteSpace: "nowrap", width: "1%" };

        return (
            // 432
            <div >
                <Button type="button" class="btn btn-primary" data-toggle="modal" data-target={"#modItems"+this.props.type}>
                    See modified items
                </Button>


                <div class="modal fade" id={"modItems"+this.props.type}>
                    <div class="modal-dialog modal-xl">
                        <div class="modal-content">


                            <div class="modal-header">
                                <h4 class="modal-title">Modified Items</h4>
                                <button type="button" class="close" data-dismiss="modal">&times;</button>
                            </div>


                            <div class="modal-body">
                                <BootstrapTable
                                    ref='table'
                                    data={this.props.data}

                                // options={options} exportCSV
                                >
                                    <TableHeaderColumn tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} dataField='item_status' >Status</TableHeaderColumn>
                                    <TableHeaderColumn tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} dataField='item_name' >Item Name</TableHeaderColumn>
                                    <TableHeaderColumn tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} dataField='brand' >Brand</TableHeaderColumn>
                                    <TableHeaderColumn width="100" dataField='quantity'>Quantity</TableHeaderColumn>
                                    <TableHeaderColumn width="100" dataField='unit_price'>SRP</TableHeaderColumn>
                                    <TableHeaderColumn width="100" dataFormat={this.totalitmFormatter} dataField=' '>Total</TableHeaderColumn>
                                   
                                    {/* <TableHeaderColumn width="100" hidden dataField='item_id'>item id</TableHeaderColumn> */}
                                    <TableHeaderColumn width="100" isKey={true} hidden dataField='trItem_id'>id</TableHeaderColumn>

                                </BootstrapTable>
                            </div>


                            <div class="modal-footer">
                                <button type="button" class="btn btn-danger" data-dismiss="modal">Close</button>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        );
    }
}
export default PrintPayCharge;