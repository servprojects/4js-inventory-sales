import React, { Component } from 'react';
import { connect } from 'react-redux';


class ComponentToPrint extends React.Component {
  

  render(props) {
   
    return (
     
<div>
<div>
          <center>{this.props.code}</center>
        </div>
</div>
    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: state.Auth.isAuthenticated,
  user: state.Auth.user,
});

export default connect(mapStateToProps)(ComponentToPrint);
