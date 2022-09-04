import React, { Component } from 'react';
import { connect } from 'react-redux';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';
import SupplierLedger from '../reports/supplierLedger';

class ChqSups extends Component {
    constructor(props) {
        super(props);
    
        // Initial state.
        this.state = {
          error: null,
          upIdItem: null,
          data: [],
          tranItems: [],
        };
        // API endpoint.
        this.api = '/api/v1/reports/sales';
      }
  render() {

    
    return (
      <div className="contentCheque">
      <nav aria-label="breadcrumb">
          <ol class="breadcrumb">
              <li class="breadcrumb-item active" aria-current="page"><Link to="/paysupplier"><a href="#">Pay Supplier</a></Link></li>
              <li class="breadcrumb-item active" aria-current="page">All Suppliers</li>
          </ol>
      </nav>

        <SupplierLedger
        notLedger= "True"
        />

      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: state.Auth.isAuthenticated,
  user: state.Auth.user,
});

export default connect(mapStateToProps)(ChqSups);
