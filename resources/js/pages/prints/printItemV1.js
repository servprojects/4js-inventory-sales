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

console.log(data)
        return (
            // <div style={{ height: "1000px" }}>
            <div style={{ height: "2000px" }}>
                {/* <div style={{ columns: "4 auto" }}> */}
                <div style={{ columns: "4 " }}>
                    {data.map((itm) => (
                        <div style={{ margin: "1%" }} class="pricePrint">
                            <div style={{ borderStyle: "solid", padding: "1%" }}>

                                


                                    <table  style={{ width: "100%" }}>
                                        <tr>

                                            <td colSpan={3} >
                                                <center>
                                                    <small> <img src="/images/logo.png" style={{ width: "30px" }} alt="AJ's Builders" /> <span style={{ fontSize: "8px" }}>  4J's Builders & Construction Supply </span> </small>
                                                </center>
                                            </td>

                                        </tr>

                                        <tr>
                                            {/* <td></td>
                                        <td>

                                            <div class="inline_block" >
                                              
                                                <QRCode size="35" value={itm.code} />
                                            </div>

                                        </td> */}

                                            <td style={{ textAlign: "left", paddingLeft: "2px" }}>
                                                <tr>
                                                    <td> <QRCode size="45" value={itm.code} /></td>
                                                    <td style={{ paddingLeft: "5px", textAlign: "left" }}>
                                                        <span style={{ fontSize: "15px" }}>
                                                            {itm.name}&nbsp;{itm.size}-{itm.unit}-{itm.brand}
                                                            <br />
                                                            {formatter.format(itm.unit_price)}<br />
                                                        </span>
                                                    </td>
                                                </tr>






                                                {/* <div class="inline_block" >
                                                <QRCode size="34" value={itm.code} />
                                            </div>
                                            &nbsp; &nbsp;
                                            <div class="inline_block" >

                                                <span style={{ fontSize: "13px" }}>
                                                    {itm.name}
                                                    <br />
                                                    {formatter.format(itm.unit_price)}<br />
                                                </span>

                                                 {itm.code} 
                                            </div> */}

                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan={3}>
                                                <center>
                                                    <span style={{ fontSize: "8px", width: "50px !important" }}>
                                                        <Barcode width="1.8" fontSize="10" height="40" value={itm.code} />
                                                    </span>
                                                </center>
                                            </td>
                                        </tr>



                                    </table>
                              
                                {/* <br /> */}
                                {/* {itm.code} */}
                                {/* <Barcode width="1.5" height="30" value={itm.code} /> */}

                            </div>

                        </div>
                    ))}
                    {/* <QRCode size="60" value={itm.code} /> */}
                </div>
            </div>

        );
    }
}
export default PrintItems;