import React, { Component } from 'react';
import { connect } from 'react-redux';
import RNRExisting from './RNR_existing';
import RNRNewItem from './RNR_newItem';


class NoReq extends Component {
  
  render() {
    

    return (
<div>
   <br/>
    <ul class="nav nav-tabs" role="tablist">
      <li class="nav-item">
        <a class="nav-link active" data-toggle="tab" href="#sys">No Request</a>
      </li>
      {/* <li class="nav-item">
        <a class="nav-link" data-toggle="tab" href="#emps">New Items</a>
      </li>  */}
       
      
   </ul>
   <div class="tab-content">

    <div id="sys" class="container tab-pane active"><br/>
      <RNRExisting />
    </div>

    {/* <div id="emps" class="container tab-pane fade"><br/>
    <RNRNewItem />
    </div> */}

    
    
    
  </div>
</div>
    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: state.Auth.isAuthenticated,
  user: state.Auth.user,
});

export default connect(mapStateToProps)(NoReq);
