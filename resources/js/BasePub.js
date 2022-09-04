import React from 'react';
import { connect } from 'react-redux';
import Login from './pages/Login';


const BasePub = ({ children }) => (
  
    <div>
      {/* <main>{children}</main> */}
      <Login />
    </div>
  );

const mapStateToProps = (state) => ({
  isAuthenticated: state.Auth.isAuthenticated,
});

export default connect(mapStateToProps)(BasePub);
