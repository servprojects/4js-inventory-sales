import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../Http';
import classNames from 'classnames';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table'; 
import NewWindow from 'react-new-window';
class AllItems extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);

    // Initial state.
    this.state = {
      data: [],
    };

    // API endpoint.
    this.api = '/api/v1/transaction/sales';
  }
  componentDidMount() {
    this._isMounted = true
            
            Http.get(`${this.api}`)
            .then((response) => {
              
            if(this._isMounted){
                this.setState({

                data: response.data.items,
               
                });
               
                }
            })
  }



  render() {
    const { data} = this.state;
    const itemstyle = {height: "100%"};
    return (
     
<div>
    
                <NewWindow title="Items" copyStyles features={{   width:900, height: 900, }} >
                        
                   <div   class="AllItems" >     
                        <BootstrapTable
                            ref='table'
                            data={ data }
                            pagination={ true }
                            search={ true }
                            // options={options} exportCSV
                            >
                            <TableHeaderColumn dataField='code' isKey={ true }>Code</TableHeaderColumn>
                            <TableHeaderColumn tdStyle={ { whiteSpace: 'normal' } } thStyle={ { whiteSpace: 'normal' } } dataField='name'>Name</TableHeaderColumn>
                           
                            <TableHeaderColumn dataField='size'>Measurement</TableHeaderColumn>
                            <TableHeaderColumn dataField='unit'>Unit</TableHeaderColumn>
                            <TableHeaderColumn dataField='unit_price'>Price</TableHeaderColumn>
                            <TableHeaderColumn dataField='balance'>Balance</TableHeaderColumn>
                            </BootstrapTable>

                    </div>

                            </NewWindow>

                    
  
</div>
    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: state.Auth.isAuthenticated,
  user: state.Auth.user,
});

export default connect(mapStateToProps)(AllItems);
