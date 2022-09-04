import React, { Component } from 'react';
import { connect } from 'react-redux';
// import Positions from './positions';
import Sysusers from './sysuser';
// import Employee from './employee';


class Users extends Component {
  
  render() {
    

    return (
<div class="utilityContainer" >
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb-item active" aria-current="page">Users</li>
          </ol>
        </nav>
    <br/>
    <ul class="nav nav-tabs" role="tablist">
      <li class="nav-item">
        <a class="nav-link active" data-toggle="tab" href="#sys">System User</a>
      </li>
      {/* <li class="nav-item">
        <a class="nav-link" data-toggle="tab" href="#emps">Employee</a>
      </li> 
       <li class="nav-item">
        <a class="nav-link" data-toggle="tab" href="#pos">Position</a>
      </li>  */}
      
   </ul>
   <div class="tab-content">

    <div id="sys" class="container tab-pane active"><br/>
      <Sysusers />
    </div>

    {/* <div id="emps" class="container tab-pane fade"><br/>
      <Employee />
    </div>

    <div id="pos" class="container tab-pane fade"><br/>
      <Positions />
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

export default connect(mapStateToProps)(Users);
