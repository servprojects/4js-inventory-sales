import React, { Component, useRef } from 'react';

import Barcode from 'react-barcode';
import QRCode from 'qrcode.react';

class PrintItems extends React.Component {
    render() {

        const formatter = new Intl.NumberFormat('fil', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2
        })
        const data = this.props.data;

        console.log("data printing", data)
        return (
            // <div style={{ height: "2000px" }}>
            // <div style={{ height: "1700px" }}>
            <div style={{ height: "600px" }}>
                <div style={{ columns: "4 " }}>
                    {data.map((itm) => (
                        <div style={{ margin: "1%" }} class="pricePrint">
                            <div style={{ borderStyle: "solid", padding: ".5%" }}>

                                <table style={{ width: "100%" }}>
                                    <tr>
                                        <td colSpan={3} >
                                            <center>
                                                {/* <small> <img src="/images/logo.png" style={{ width: "30px" }} alt="AJ's Builders" /> <span style={{ fontSize: "8px" }}>  4J's Builders & Construction Supply </span> </small> */}
                                                <small> <img src="/images/logo.png" style={{ width: "25px" }} alt="AJ's Builders" /> <span style={{ fontSize: "6px" }}>  4J's Builders & Construction Supply </span> </small>
                                            </center>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ textAlign: "left", paddingLeft: "2px" }}>
                                            <tr>
                                                {/* <td> <QRCode size="45" value={itm.code} /></td> */}
                                                <td style={{ paddingLeft: "5px", textAlign: "left" }}>
                                                    {/* <span style={{ fontSize: "15px" }}> */}
                                                    <center>
                                                        <span style={{ fontSize: "8px" }}>
                                                            {itm.name}&nbsp;{itm.size ? '- '+itm.size: ''} {itm.unit ? '- '+itm.unit : ''} {itm.brand == 'No Brand'? '' :'- '+itm.brand }
                                                            <br />
                                                            {formatter.format(itm.unit_price)}
                                                            {/* <br /> */}
                                                        </span>
                                                    </center>
                                                </td>
                                            </tr>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan={3}>
                                            <center>
                                                <span style={{ fontSize: "8px", width: "50px !important" }}>
                                                {/* <span style={{ fontSize: "8px", width: "50px !important" }}> */}
                                                    <Barcode width="1.8" fontSize="10" height="25" value={itm.id_no} />
                                                    {/* <Barcode width="1.8" fontSize="10" height="40" value={itm.code} /> */}
                                                </span>
                                            </center>
                                        </td>
                                    </tr>
                                </table>
                            </div>

                        </div>
                    ))}
                </div>
            </div>

        );
    }
}
export default PrintItems;