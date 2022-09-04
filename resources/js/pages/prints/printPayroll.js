import React, { Component, useRef } from 'react';
import PrintHeader from './printHeader';

class PrintPayroll extends React.Component {
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
            <div style={{ marginLeft: "1%", marginRight: "2%"}}>
                <table class="p_table">
                    {
                        this.props.specpayroll == null ?
                    <PrintHeader
                    // title={title}
                    // code={this.props.code}
                    />
                    : <></>
                    }
                    
                    <tr>
                        <td>
                           <div > {this.props.itms}</div>
                        </td>
                    </tr>
                </table>

            </div>
        );
    }
}
export default PrintPayroll;