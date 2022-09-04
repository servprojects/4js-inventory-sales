import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../Http';
import ReasonModif from './reasonForModif';
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
            exist: "no",
            description: null,
        };


    }

    // check/credit
    componentDidMount() {
        this.getStatus();
    }

    getStatus = () => {

        this._isMounted = true
        Http.post(`/api/v1/reports/check/credit`, { id: this.props.id })
            .then((response) => {

                if (this._isMounted) {
                    this.setState({
                        exist: response.data.exist_credit,

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


    cashFlowToggle = () => {
        return (
            <>
                <small>Transaction credited to supplier</small><br />
                <Radio
                    data-toggle="modal"
                    data-target="#modif"
                    // onClick={this.modTransCashflow} 
                    checked={this.state.exist == "yes" ? true : false}
                    toggle />
            </>
        )
    }

    saveChanges = (data) => {
        this._isMounted = true
        if (this._isMounted) {
            this.setState({
                description: data,
            });

            const subs = {
                id: this.props.id,
                description: data,
                exist: this.state.exist
            }
            //    transaction/purchasecredit
            // console.log(subs)
            Http.post(`/api/v1/mod/transaction/purchasecredit`, subs)
                .then((response) => {

                    this.setState({
                        exist: response.data.exist_credit
                    });

                    this.props.exist(" ");
                    toast("Transaction successfully updated")


                })
                .catch((error) => {
                    toast("Failed to update transaction")
                    // console.log(error)
                });

        }
    }


    render() {

        return (
            <>
                <ToastContainer />
                {this.cashFlowToggle()}
                <ReasonModif description={this.saveChanges} />
            </>
        );
    }
}

const mapStateToProps = (state) => ({
    isAuthenticated: state.Auth.isAuthenticated,
    user: state.Auth.user,
});

export default connect(mapStateToProps)(AllItems);
