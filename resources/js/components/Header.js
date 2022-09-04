import React, { Component } from 'react';
import { connect } from 'react-redux';
import Superadmin from '../components/superadmin'
import Cashier from '../components/cashier'
import Admin from '../components/admin'
import Inventory from '../components/inventory'
import Pos from './pos';
import Http from '../Http';
class Header extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);


    this.state = {
      role: false,
      rl: localStorage.getItem('role'),
      sysmode:  localStorage.getItem('sysmode'),
    };
  }
  componentDidMount() {
    this._isMounted = true
    this.getSystemMode() 


    Http.post(`/api/v1/header/role`)
      .then((response) => {
        if (this._isMounted) {
          this.setState({
            role: response.data.role,
          });


          // console.log(response.data.role)

          if (localStorage.getItem('role') != response.data.role) {
            localStorage.setItem('role', response.data.role)
            var rls = localStorage.getItem('role');
            this.setState({
              rl: rls,
            })
          }

        }
      })
      .catch(() => {
        this.setState({
          error: 'Unable to fetch data.',
        });
      });
  }


 
   
  getSystemMode() {
    Http.post(`/api/v1/sysmode`)
      .then(({ data }) => {
        console.log("data.spec")
        console.log(data.spec)


        localStorage.setItem('sysmode',  data.spec)
        if (this._isMounted) { this.setState({ sysmode: data.spec }); };
      })
      .catch(() => {
        this.setState({
          error: 'Unable to fetch data.',
          load: false,
        });
      });
  }

  render() {
    const { role, rl } = this.state;
    // var rl = role;
    // var rl = localStorage.getItem('role');

    // localStorage.getItem('role') === role ? rl = localStorage.getItem('role')  : localStorage.setItem('role', role) ;

    // if( localStorage.getItem('role') != role){
    //   localStorage.setItem('role', role)
    //   rl = localStorage.getItem('role');
    // }
    // rl = localStorage.getItem('role');
    // var lr = localStorage.setItem('role', "hello world");

    return (
      <>

        {
          this.state.sysmode == 'pos'? 
          <Pos/> :
          <>
            {

              rl === "Superadmin" ?
                <Superadmin /> :
                rl === "Cashier" ?
                  <Cashier /> :
                  rl === "Admin" ?
                    <Admin /> :
                    rl === "Inventory" ?
                      <Inventory /> :
                      <nav class="navbar navbar-expand-lg navbar-light bg-light nav_style customNav"></nav>
            }
          </>
        }
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: state.Auth.isAuthenticated,
});

export default connect(mapStateToProps)(Header);
