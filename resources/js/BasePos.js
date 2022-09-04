import React from 'react';
import { connect } from 'react-redux';



const BasePos = ({ children }) => (
  
    <div>
      <main>{children}</main>
    </div>
  );

const mapStateToProps = (state) => ({
  isAuthenticated: state.Auth.isAuthenticated,
});

export default connect(mapStateToProps)(BasePos);
