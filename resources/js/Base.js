import React from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';
import Header from './components/Header';


function HeaderView() {
  const location = useLocation();
  return location.pathname
}
const Base = ({ children }) => (
 
  
    <div>
     {HeaderView() === '/pos' || HeaderView() === '/pos/sales' || HeaderView() === '/pos/menu' ? <> </> : <Header />}
      <main>{children}</main>
    </div>
  );

const mapStateToProps = (state) => ({
  isAuthenticated: state.Auth.isAuthenticated,
});

export default connect(mapStateToProps)(Base);
