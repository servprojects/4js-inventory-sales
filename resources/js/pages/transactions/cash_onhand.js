import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../Http';
import classNames from 'classnames';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import NewWindow from 'react-new-window';
import { Radio } from 'semantic-ui-react';

class AllItems extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);

        // Initial state.
        this.state = {
            cashonhand: null,
            amount: null,
            enablecf: null,
            data: [],
        };

      
    }
    
    componentDidMount() {
       this.getIndex()
      }

    getIndex = () =>{
        this._isMounted = true
        Http.post('/api/v1/getcash')
          .then((response) => {
            if (this._isMounted) {
                this.setState({
                    cashonhand: response.data.newamt,
                    enablecf: response.data.enablecf
                });

               this.props.updateToggle(response.data.enablecf);
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

cashinadmin = (e) =>{
    e.preventDefault();
    this._isMounted = true
    if (this._isMounted) { this.setState({ load: true }); };

    if(confirm("Are you sure you want to add cash?")){
        Http.post(`/api/v1/cashinadmin`, {amount: this.state.amount})
        .then((response) => {
            if (this._isMounted) {
                this.setState({
                    cashonhand: response.data.newamt
                });
                toast("Cash in successful")
            }

        })
        .catch(() => {
            toast("Cash in failed")
        });
    }
}

upcashflostat = (e) =>{
    e.preventDefault();
    this._isMounted = true
    if (this._isMounted) { this.setState({ load: true }); };

    if(confirm("Are you sure you want to proceed?")){
        Http.post(`/api/v1/upcashflowstat`)
        .then((response) => {
            if (this._isMounted) {
                this.setState({
                    enablecf: response.data.enablecf
                });
                
                toast("Success")
            }

        })
        .catch(() => {
            toast("Failed")
        });
    }
   
}


cashoutadmin= (e) =>{
    e.preventDefault();
    this._isMounted = true
    if (this._isMounted) { this.setState({ load: true }); };

    if(confirm("Are you sure you want to withdraw cash?")){
        Http.post(`/api/v1/cashoutadmin`, {amount: this.state.amount})
        .then((response) => {
            if (this._isMounted) {
                this.setState({
                    cashonhand: response.data.newamt
                });
                toast("Cash out successful")
            }

        })
        .catch(() => {
            toast("Cash out failed")
        });
    }
   
}


    render() {
const{cashonhand, enablecf}=this.state;
const formatter = new Intl.NumberFormat('fil', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2
  })

 var newcof  = cashonhand ;
        return (

            <div>
                <ToastContainer />
                <button class="ui orange button" data-backdrop="static" data-keyboard="false" type="button" data-toggle="modal" onClick={this.getIndex} data-target="#cashonhand" >Cash on Hand</button>

                <div class="modal fade" id="cashonhand" role="dialog">
                    <div class="modal-dialog">


                        <div class="modal-content">
                            <div class="modal-header">
                                <button type="button" class="close" data-dismiss="modal" onClick={this.getIndex}>&times;</button>

                            </div>
                            <div class="modal-body">
                            <small >Cash Flow is {enablecf == "no"? 'Disabled' : 'Enabled'}</small><br/>
                            <Radio  onClick={this.upcashflostat} checked={enablecf == "no" ? false : true} toggle />
                            {/* <center>  <b>{formatter.format(cashonhand)}</b> </center> */}
                            <center>  <b>{formatter.format(newcof)}</b> </center>
                            <center><small>Cash On Hand</small> </center>
            <hr/>
                                <form onSubmit={this.cashinadmin}> 
                                    <label for="out">Receive Cash</label><br />
                                    
                                    <input type="number" required name="amount" onChange={this.handleChange} class="form-control" /><br />
                                    <button type="submit"  class="btn btn-primary">Cash In</button>
                                </form>
                                <br />
                                <form onSubmit={this.cashoutadmin} >
                                    <label for="out">Withdraw cash</label><br />
                                    <small>Please count the cash first before typing the amount of money you will withdraw</small>
                                    <input type="number" name="amount" onChange={this.handleChange} required class="form-control" /><br />
                                    <button type="submit" class="btn btn-primary">Cash Out</button>
                                </form>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-default" data-dismiss="modal" onClick={this.getIndex}>Close</button>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    isAuthenticated: state.Auth.isAuthenticated,
    user: state.Auth.user,
});

export default connect(mapStateToProps)(AllItems);
