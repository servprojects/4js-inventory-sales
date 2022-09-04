import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import NewWindow from 'react-new-window';
import { Radio } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

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
        //    this.getIndex()
    }



    closeWindow = () => {
        window.open('', '_self', '')
        window.close();
    }


    render() {
        const sesStyle = {
            position: "absolute",
            zIndex: 5000,
            height: "100%",
            width: "100%",
            background: "white",
            padding: "10%",
            top: "0px"

        }

        const contStyle = {
            padding: "3%",

            width: "30%",

        }
        return (

            <div>
                {/* <button class="ui orange button" data-backdrop="static" data-show="true" data-keyboard="false" type="button" data-toggle="modal" onClick={this.getIndex} data-target="#endses" >Cash on Hand</button> */}







                <div style={sesStyle}  >
                    <center>
                        <div style={contStyle} class="shadow-2xl">
                            <center><h1>END OF SESSION</h1></center>
                            <center>Your account has been logged out. Please close and go back to home page.</center>
                            {this.props.type == "pos" ?
                                <>
                                    <br />
                                    <br />
                                    <button onClick={this.closeWindow} type="button" class="btn btn-primary">Close</button>
                                </> : <></>
                            }
                        </div>
                    </center>
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
