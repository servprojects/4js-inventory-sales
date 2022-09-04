import React, { Component, useRef } from 'react';

class PrintHeader extends React.Component {
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
    setTime() {
  
      var currentdate = new Date();
      // var hours = currentdate.getUTCHours() + parseInt(this.props.UTCOffset);    
      var hours = currentdate.getHours();
      var seconds;
      // correct for number over 24, and negatives
      if (hours >= 24) { hours -= 24; }
      if (hours < 0) { hours += 12; }
  
      // add leading zero, first convert hours to string
      hours = hours + "";
      if (hours.length == 1) { hours = "0" + hours; }
  
      // minutes are the same on every time zone
      var minutes = currentdate.getUTCMinutes();
  
      // add leading zero, first convert hours to string
      minutes = minutes + "";
      if (minutes.length == 1) { minutes = "0" + minutes; }
  
      var dd = String(currentdate.getDate()).padStart(2, '0');
      var mm = String(currentdate.getMonth() + 1).padStart(2, '0'); //January is 0!
      var yyyyf = String(currentdate.getFullYear());
  
      seconds = currentdate.getUTCSeconds();
      //   console.log(hours, minutes, seconds)
      this.setState({
        live_date: mm + "/" + dd + "/" + yyyyf + " " + hours + ":" + minutes + ":" + seconds,
        hours: hours,
        // minutes: minutes,
        // seconds: seconds
      });
    }
    componentWillMount() {
      this.setTime();
    }
    render() {
    
      return (
        <div>
          
            <tr>
              <td>
                <div class="p_compDet">
                  <br />
                  
                  <h1><b>4J's Builders Construction & Supply</b></h1>
                  <b>Villalimpia, Loay, Bohol</b><br />
                  <b>Contact No. : 09462793889</b>
                </div>
                <div class="p_invDet">
                  <br />
                  <h1><b>{this.props.title}</b></h1>
                  <b>Date Printed: {this.state.live_date}</b><br />
                  <b>Ref: {this.props.code}</b>
                </div>
              </td>
            </tr>
  
          
        </div>
      );
    }
  }
  export default PrintHeader;