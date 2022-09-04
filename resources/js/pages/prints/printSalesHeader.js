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
    // setTime() {

    //     var currentdate = new Date();
    //     // var hours = currentdate.getUTCHours() + parseInt(this.props.UTCOffset);    
    //     var hours = currentdate.getHours();
    //     var seconds;
    //     // correct for number over 24, and negatives
    //     if (hours >= 24) { hours -= 24; }
    //     if (hours < 0) { hours += 12; }

    //     // add leading zero, first convert hours to string
    //     hours = hours + "";
    //     if (hours.length == 1) { hours = "0" + hours; }

    //     // minutes are the same on every time zone
    //     var minutes = currentdate.getUTCMinutes();

    //     // add leading zero, first convert hours to string
    //     minutes = minutes + "";
    //     if (minutes.length == 1) { minutes = "0" + minutes; }

    //     var dd = String(currentdate.getDate()).padStart(2, '0');
    //     var mm = String(currentdate.getMonth() + 1).padStart(2, '0'); //January is 0!
    //     var yyyyf = String(currentdate.getFullYear());

    //     seconds = currentdate.getUTCSeconds();
    //     //   console.log(hours, minutes, seconds)
    //     this.setState({
    //         live_date: mm + "/" + dd + "/" + yyyyf + " " + hours + ":" + minutes + ":" + seconds,
    //         hours: hours,
    //         // minutes: minutes,
    //         // seconds: seconds
    //     });
    // }
    // componentWillMount() {
    //     this.setTime();
    // }
    render() {

        return (
            <div>

                {/* <tr>
                    <td>
                        <div >
                            <center>
                                <h2><b>4J's Builders Construction & Supply</b></h2>
                                <b>Villalimpia, Loay, Bohol</b><br />
                                <b>Contact No. : 09462793889</b>
                            </center>
                        </div>
                        <div >
                            <h2><b>{this.props.title}</b></h2>
                          
                            <b>Date Printed: {this.props.printdate}</b><br />
                            <b>Ref: {this.props.code}</b>
                        </div>
                    </td>
                </tr> */}
                <div style={{ width: "small" }}>
                    <center>
                        4J's Builders & Construction Supply<br />
                    Villalimpia, Loay, Bohol<br />
                    09462793889<br />
                        <b>ORDER SLIP</b>
                    </center>
                </div>

                <br />
                <table class="pos_body">
                    <tr>
                        <td>Series No.:</td>
                        <td>{this.props.series_no}</td>
                    </tr> 
                    <tr>
                        <td>Ref#:</td>
                        <td>{this.props.code}</td>
                    </tr>
                   {this.props.replace_code?
                    <tr>
                        <td>Replace #:</td>
                        <td>{this.props.replace_code}</td>
                    </tr>
                    : <></>
                    }
                    {
                        this.props.excess_code ?
                            <tr>
                                {
                                    this.props.org_type == "Charge" ?
                                        <>
                                            {/* <td>Replace #:</td>
                                            <td>{this.props.replace_code}</td> */}
                                        </>
                                        :
                                        <>
                                           { this.props.payable > 0 ?
                                           <>
                                                <td>Excess #:</td>
                                                <td>{this.props.excess_code}</td>
                                            </>
                                            : <></>
                                            }
                                        </>
                                }
                            </tr>
                            : <></>
                    }
                    <tr>
                        <td>Print Date:</td>
                        <td>{this.props.printdate}</td>
                    </tr>
                   {
                       this.props.late_date ?
                    <tr>
                        <td>Late Date:</td>
                        <td>{this.props.late_date}</td>
                    </tr>
                    :<></>
                    }
                    <tr>
                        <td>Name:</td>
                        <td>{this.props.name}</td>
                    </tr>
                    <tr>
                        <td>Type:</td>
                        <td>{this.props.ptype}{this.props.ptype == "Charge" ? <> - {this.props.accountability}</> : <></>}</td>
                    </tr>
                </table>

                {/* <center>   ------------------------------------------------------ </center> */}
                <center>  -------------------------------------------- </center>
            </div>
        );
    }
}
export default PrintSalesHeader;