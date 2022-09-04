import React, { Component, useRef, useEffect } from 'react';
import Barcode from 'react-barcode';
import { useBarcode } from 'react-barcodes';


function App(props) {
    // const location = useBarcode();
    var code = String(props.code);
    var excode = String(props.excess_code);
    var orcode = String(props.orgcode);

    const { inputRef } = useBarcode(
        {
        value: code.substring(2),
        // value: code,
        options: {
            displayValue: false,
            // background: '#ccffff',
            width: 1.7,
            height: 40,
            // fontSize: 12

        }
        ,
        format: 'EAN-13'
    }
    );

 

    return (
        <div>

<center>  -------------------------------------------- </center>
            {/* <center>   ------------------------------------------------------ </center> */}

            <i>
                <table style={{ fontSize: "x-small" }}>
                    <tr>
                        <td>Prepared by: </td>
                        <td>{props.cashier}</td>
                    </tr>
                    <tr>
                        <td>Branch:</td>
                        <td>{props.branch}</td>
                    </tr>
                </table>
            </i>
            <div style={{ width: "200px !important" }}>
                <center>
                    {/* <svg style={{ width: "200px !important" }} ref={inputRef} /> */}
                    <small style={{fontSize : "8px"}}>Ref Code</small><br/>
                   {/* <Barcode width="2" fontSize="10" height="40" value={code.substring(2)} /> <br/> */}
                   <svg style={{ width: "200px !important" }} ref={inputRef} />

                   {/* <Barcode width="1.8" fontSize="10" height="40" value={code.substring(2)} /> <br/> */}

                   {/* {props.excess_code ? 
                    <>
                    <small style={{fontSize : "8px"}}>Excess Code</small>
                  <Barcode width="2" fontSize="10" height="40" value={excode.substring(2)} /> <br/>
                    </>
                    : <></>}
                     {props.orgcode ? 
                     <>
                     <small style={{fontSize : "8px"}}>Original Transaction Code</small><br/>
                   <Barcode width="2" fontSize="10" height="40" value={orcode.substring(2)} /> 
                     </>
                     : <></>} */}

                </center>
            </div>
        </div>
    )

};


export default App;





// class PrintSalesFooter extends React.Component {

//     render() {
//         const { inputRef } = useBarcode({
//             value: 'react-barcodes',
//             options: {
//                 background: '#ccffff',
//             }
//         });

//         return (
//             <div style={{ margin: "2%" }}>

//                 {/* <div>
//                             <center>

//                                 <b>---------------------------------------------------------</b>

//                             </center>
//                             <p><b>Prepared by: </b>{this.props.cashier}</p>
//                             <p><b>Branch:</b> {this.props.branch}</p>
//                         </div>
//                          */}
//                 <center>  -----------------------*----------------------- </center>
//                 <br />
//                 <br />
//                 <table style={{ fontSize: "small" }}>
//                     <tr>
//                         <td>Prepared by: </td>
//                         <td>{this.props.cashier}</td>
//                     </tr>
//                     <tr>
//                         <td>Branch:</td>
//                         <td>{this.props.branch}</td>
//                     </tr>
//                 </table>
//                 <center>


//                     <svg ref={inputRef} />
//                     {/* <Barcode width="1.9" height="50"  value={this.props.code} /> */}
//                     {/* <Barcode width="1.9" height="50" format="CODE11"  value={this.props.code} /> */}

//                 </center>

//             </div>
//         );
//     }
// }
// export default PrintSalesFooter;

