import React, { Component } from 'react';
import { connect } from 'react-redux';
import Users from './people/users';
import Items from './items/items';
import Branches from './branches';
import Suppliers from './suppliers';
import Projects from './projects';
import Customers from './people/customer';



class Settings extends Component {
  
  render() {
    const menu_pos = {
        position: "fixed",
      };

    return (
<div className="contentSettings">

    <div class="row" >
        <div class="col-2">
            <div  style={menu_pos} class="nav flex-column nav-pills" id="v-pills-tab" role="tablist" aria-orientation="vertical">
                <a class="nav-link active" id="v-pills-users-tab" data-toggle="pill" href="#v-pills-users" role="tab" aria-controls="v-pills-users" aria-selected="true">Personnel</a>
                <a class="nav-link" id="v-pills-items-tab" data-toggle="pill" href="#v-pills-items" role="tab" aria-controls="v-pills-items" aria-selected="false">Item</a>
                <a class="nav-link" id="v-pills-branches-tab" data-toggle="pill" href="#v-pills-branches" role="tab" aria-controls="v-pills-branches" aria-selected="false">Branch</a>
                <a class="nav-link" id="v-pills-suppliers-tab" data-toggle="pill" href="#v-pills-suppliers" role="tab" aria-controls="v-pills-suppliers" aria-selected="false">Supplier</a>
                <a class="nav-link" id="v-pills-projects-tab" data-toggle="pill" href="#v-pills-projects" role="tab" aria-controls="v-pills-projects" aria-selected="false">Projects</a>
                <a class="nav-link" id="v-pills-customers-tab" data-toggle="pill" href="#v-pills-customers" role="tab" aria-controls="v-pills-customers" aria-selected="false">Customers</a>
            </div>
        </div>
        <div class="col-10">
            <div class="tab-content" id="v-pills-tabContent">
                <div class="tab-pane fade show active" id="v-pills-users" role="tabpanel" aria-labelledby="v-pills-users-tab"><Users /></div>
                <div class="tab-pane fade" id="v-pills-items" role="tabpanel" aria-labelledby="v-pills-items-tab"><Items /></div>
                <div class="tab-pane fade" id="v-pills-branches" role="tabpanel" aria-labelledby="v-pills-branches-tab"><Branches /></div>
                <div class="tab-pane fade" id="v-pills-suppliers" role="tabpanel" aria-labelledby="v-pills-suppliers-tab"><Suppliers /></div>
                <div class="tab-pane fade" id="v-pills-projects" role="tabpanel" aria-labelledby="v-pills-projects-tab"><Projects /></div>
                <div class="tab-pane fade" id="v-pills-customers" role="tabpanel" aria-labelledby="v-pills-customers-tab"><Customers /></div>
            </div>
        </div>
    </div>
</div>
    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: state.Auth.isAuthenticated,
  user: state.Auth.user,
});

export default connect(mapStateToProps)(Settings);
