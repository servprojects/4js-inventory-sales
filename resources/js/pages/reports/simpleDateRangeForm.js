import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../Http';
import classNames from 'classnames';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import { Link } from 'react-router-dom';
import ReactToPrint from "react-to-print";
import PrintReport from '../prints/printReport';
import { Button } from 'semantic-ui-react';
class SpecCustomerLedger extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);

        // Initial state.
        this.state = {
            error: null,
            from_date: null,
            to_date: null,
            upIdItem: null,
            data: [],
            tranItems: [],
            customer: [],
        };
        // API endpoint.
        this.api = '/api/v1/reports/sales';
    }
  

    getData = (e) =>{
      e?  e.preventDefault() : e = null;

        this._isMounted = true
        const subs = {
            from_date :this.state.from_date,
            to_date :this.state.to_date,
            user_id: this.props.location.state.id
        }

        Http.post(`/api/v1/cashflowRep`, subs)
            .then((response) => {
                // const { data } = response.data.transaction.data;
                if (this._isMounted) {
                    console.log("flows")
                    console.log(response.data.flows)

                    this.setState({
                        data: response.data.flows,


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

    handleChange = (e) => {
        this._isMounted = true
        const { name, value } = e.target;
        if (this._isMounted) {
          this.setState({ [name]: value });
        }
      };

   
   
   
    
    render() {
       
        return (
            
      
                <form onSubmit={this.getData} style={{ width: "20%" }}>
                    <table>
                        <tr>
                            <td>
                                From
                            </td>
                            <td>
                                To
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <input type="date"
                                    name="from_date"
                                      onChange={this.handleChange}
                                    required
                                    class="form-control mb-2 mr-sm-2 inline_block" />
                                     
                            </td>
                            <td>
                                <input type="date"
                                    name="to_date"
                                      onChange={this.handleChange}
                                    required
                                    class="form-control mb-2 mr-sm-2 inline_block" />
                            </td>
                            <td>
                                <button class="btn btn-primary mb-2">Search</button>
                            </td>
                        </tr>
                    </table>



                </form>
              
           
        );
    }
}

const mapStateToProps = (state) => ({
    isAuthenticated: state.Auth.isAuthenticated,
    user: state.Auth.user,
});

export default connect(mapStateToProps)(SpecCustomerLedger);
