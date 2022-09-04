import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../Http';
import classNames from 'classnames';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import NewWindow from 'react-new-window';
import { Radio, Button } from 'semantic-ui-react';

class AllItems extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);

        // Initial state.
        this.state = {
            loading: null,
            description: null,
        };

      
    }
    handleChange = (e) => {
        this._isMounted = true
        const { name, value } = e.target;
        if (this._isMounted) {
            this.setState({ [name]: value });
        }

      
    };
   
    saveChanges = (e) =>{
        e.preventDefault();
        this.props.description(this.state.description)
       
    }

 

   

    render() {
const{loading, description}=this.state;
        return (
            <>
           
           <div class="modal fade" id="modif">
                        <div class="modal-dialog modal-xs">
                            <div class="modal-content">

                            
                                <div class="modal-header">
                                    <h4 class="modal-title">Please state your reason for modifications</h4>
                                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                                </div>

                                {/* onClick={this.saveChanges} */}
                                <div class="modal-body">
                                    <small><i>*Supplier's balance will be updated by this action</i></small>
                                    <br />
                                    <br />
                                    <form
                                      
                                        method="post"
                                        onSubmit={this.saveChanges}
                                        ref={(el) => {
                                            this.addForm = el;
                                        }}
                                    >
                                        <textarea required class="form-control mb-5 mr-sm-5  " placeholder="Reason for changing" name="description" onChange={this.handleChange} > </textarea>
                                        <Button type="submit" className={classNames(' ', {
                                            'btn-loading': loading,
                                        })} primary>Save Changes</Button>
                                    </form>
                                </div>


                                <div class="modal-footer">
                                    <button type="button" class="btn btn-danger" data-dismiss="modal">Close</button>
                                </div>

                            </div>
                        </div>
                    </div>
            </>
        );
    }
}

const mapStateToProps = (state) => ({
    isAuthenticated: state.Auth.isAuthenticated,
    user: state.Auth.user,
});

export default connect(mapStateToProps)(AllItems);
