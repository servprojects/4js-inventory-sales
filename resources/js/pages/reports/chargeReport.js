import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../Http';
import TemplateReport from './templateReport';

class ChargeReport extends Component {
  _isMounted = false;
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
    this.api = '/api/v1/reports/transacs';
  }
  componentDidMount() {
    this._isMounted = true
    Http.post(`/api/v1/reports/transacs`, {type: "Charge"})
      .then((response) => {
        // const { data } = response.data.transaction.data;
        if (this._isMounted) {

          this.setState({
            data: response.data.transaction,

          });
        }
      })

      .catch(() => {
        if (this._isMounted) {
          this.setState({
            error: 'Unable to fetch data.',
          });
        }
      });
  }
 
  render() {
    const { data } = this.state;
    const options = {
      exportCSVBtn: this.createCustomExportCSVButton
    };
    return (
     <div>
       
        <TemplateReport   
         title="Charge"
         data={data}
        />
     </div>
    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: state.Auth.isAuthenticated,
  user: state.Auth.user,
});

export default connect(mapStateToProps)(ChargeReport);
