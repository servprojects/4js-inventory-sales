import React, { Component, useRef } from 'react';
import PrintHeader from './printHeader';

class PrintReport extends React.Component {
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

        return (
            <div style={{ marginLeft: "2%", marginRight: "2%" }}>
                <table class="p_table">
                    <PrintHeader
                    // title={title}
                    // code={this.props.code}
                    />

                    <tr>
                        <td>
                            <div class="p_compDet">
                                <br />
                                {this.props.ledgerName ? <><small>{ this.props.ledItmCode}</small> <h3><b>{this.props.ledgerName + " Ledger"} </b></h3> </> :
                                    <h3><b>DETAILS</b></h3>}
                                <div style={{ marginRight: "3%" }}> {this.props.details}</div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <br />

                        </td>
                    </tr>

                    <tr>
                        <td>
                            <div style={{ marginRight: "3%" }}> {this.props.itms}</div>
                        </td>
                    </tr>
                </table>

            </div>
        );
    }
}
export default PrintReport;