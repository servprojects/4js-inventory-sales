import React, { Component } from 'react';
import { connect } from 'react-redux';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import MasterList from './masterlist';
import { Link} from 'react-router-dom';
class Payroll extends Component {

  render() {


    return (
      <div style={{ marginTop: "2%", marginLeft: "3%", marginRight: "3%" }}>
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb-item active" aria-current="page">Employee Management</li>
          </ol>
        </nav>
        <div style={{position: "absolute", right: "3%"}}>
         <Link to="/payroll/department"> <button class="ui button" tabindex="0" data-name="defs" onClick={this.disItems}>
            Departments
          </button></Link>
          <Link to="/payroll/position"> <button class="ui button" tabindex="0" data-name="defs" onClick={this.disItems}>
            Positions
           </button></Link>
        </div>
        <MasterList />

      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: state.Auth.isAuthenticated,
  user: state.Auth.user,
});

export default connect(mapStateToProps)(Payroll);
