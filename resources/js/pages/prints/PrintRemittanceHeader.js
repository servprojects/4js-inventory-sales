import React, { Component, useRef } from 'react';

class PrintSalesHeader extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props);

        // Initial state.
        this.state = {
            hours: null,
            minutes: null,
            seconds: null,
            live_date: null,
        };

    }
  
    render() {

        return (
            <div>

                <div style={{ width: "small" }}>
                    <center>
                        4J's Builders & Construction Supply<br />
                    Villalimpia, Loay, Bohol<br />
                    09462793889<br />
                        <b>Remittance Summary</b>
                    </center>
                </div>

               
                <center>  -------------------------------------------- </center>
            </div>
        );
    }
}
export default PrintSalesHeader;