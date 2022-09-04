import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../Http';
import classNames from 'classnames';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Receiving from './receiving';




class Transactions extends Component {
  handleOnlick = () => {
   
    window.open("", "", "width=1300,height=1000");
   
  }

  render() {
    
return (
<div class="contentreq">
{/* <div className="contentTransact"> */}
    {/* <ul class="nav nav-pills">
     
      <li class="nav-item">
        <a class="nav-link" data-toggle="pill" href="#charge">Charge</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" data-toggle="pill" href="#paycharge">Payment Charge</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" data-toggle="pill" href="#receive">Receiving</a>
      </li>
      
    </ul>
    <div class="tab-content">
     
      <div class="tab-pane container fade" id="charge"></div>
      <div class="tab-pane container fade" id="paycharge"></div>
      <div class="tab-pane container fade" id="receive"><Receiving /></div>
    </div> */}
    <Receiving />
</div>

    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: state.Auth.isAuthenticated,
  user: state.Auth.user,
});

export default connect(mapStateToProps)(Transactions);
