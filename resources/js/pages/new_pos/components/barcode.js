import React from 'react';
import { useBarcode } from 'react-barcodes';


function App(props) {
    var code = String(props.code);
    const { inputRef } = useBarcode(
        {
            value: code.substring(2),

            options: {
                displayValue: false,
                width: 1.7,
                height: 40,
            }
            ,
            format: 'EAN-13'
        }
    );
    return (
        <>
            
            <div style={{ width: "200px !important" }}>
                <center>
                    <svg style={{ width: "200px !important" }} ref={inputRef} />

                </center>
            </div>
        </>
    )

};


export default App;
