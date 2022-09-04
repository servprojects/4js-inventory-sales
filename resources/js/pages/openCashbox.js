import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReactToPrint from "react-to-print";
import { Button} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';

class Header extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);


    this.state = {
      role: false,
      rl: localStorage.getItem('role'),

    };
  }
  componentDidMount() {
    this._isMounted = true

  }

  print = () =>{
   
   
  }

  render() {
    

    return (
      <>
      {/* onClick={this.print} */}
      {/* <Button  onClick={()= window.print()}>Open Cashbox</Button> */}
      <ReactToPrint

      trigger={() =><Button >Open Cashbox</Button>  }
      ref={ref => this.ref = ref}
      content={() => this.componentRef}
    />

    <div  ref={el => (this.componentRef = el)}>
         .
    </div>
            
        
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: state.Auth.isAuthenticated,
});

export default connect(mapStateToProps)(Header);
