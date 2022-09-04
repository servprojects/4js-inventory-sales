import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../Http';
import classNames from 'classnames';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';

import { Radio } from 'semantic-ui-react';

class AllItems extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);

        // Initial state.
        this.state = {
            po_cashflow: this.props.po_cashflow,
        };


    }

    modTransCashflow = (subs) => {
        this._isMounted = true;

        if (confirm("Are you sure you want to update? This will affect the cash on hand of the user.")) {
            const { id } = this.props;
            Http.post(`/api/v1/modTransCashflow`, { id: id })
                .then((response) => {

                    toast("Transaction successfully updated")

                    if (this.props.type != "table") {
                        this.props.newToggle(response.data.incCashflow)
                    }

                    if (this._isMounted) {
                        this.setState({
                            po_cashflow: response.data.incCashflow
                        });
                    }
                })
                .catch((error) => {
                    toast("Failed to update transaction")
                    console.log(error)
                });
        }
    }

    cashFlowToggle = () => {
        return (
            <>
            {/* Disabled on April 18, 2021 */}
                {/* { this.props.dis_label == "yes" ? <></> : <><small>Part of cashflow</small><br /></>} */}
                
                {/* <Radio

                    onClick={this.modTransCashflow}
                    checked={this.state.po_cashflow == "yes" ? true : false}
                    // checked={this.props.po_cashflow == "yes" ? true : false}
                    toggle /> */}
            </>
        )
    }


    render() {

        return (
            <>
                {this.cashFlowToggle()}
            </>
        );
    }
}

const mapStateToProps = (state) => ({
    isAuthenticated: state.Auth.isAuthenticated,
    user: state.Auth.user,
});

export default connect(mapStateToProps)(AllItems);
