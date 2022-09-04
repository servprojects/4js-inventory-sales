import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../../Http';
import classNames from 'classnames';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import { Dropdown } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
class Subs extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);

        // Initial state.
        this.state = {
            timeout: 0,
            loading: false,
            quantity: null,
            unit: null,
            error: false,
            upId: null,
            sub_id: null,
            data: [],
        };

        // API endpoint.
        this.api = '/api/v1/brand';
    }
    componentDidMount() {
        this._isMounted = true

        var sub = this.props.convDet;
        if (sub) {
            if (sub.length > 0) {
                if (this._isMounted) {
                    this.setState({
                        quantity: sub[0].quantity,
                        unit: sub[0].unit,
                        sub_id: sub[0].id
                    });


                }
            }
        }
        // if (this.state.timeout) clearTimeout(this.state.timeout);
        // this.state.timeout = setTimeout(() => {

        //     Http.post('/api/v1/GetConvDet', { id: this.props.id })
        //         .then((response) => {
        //             var sub = response.data.subqty;

        //             if (this._isMounted) {
        //                 this.setState({
        //                     quantity: sub[0].quantity,
        //                     unit: sub[0].unit,
        //                     sub_id: sub[0].id

        //                 });
        //             }
        //         })

        //         .catch(() => {
        //             if (this._isMounted) {
        //                 this.setState({
        //                     error: 'Unable to fetch data.',
        //                 });
        //             }
        //         });
        // }, 1000);


    }

    handleChange = (e) => {
        this._isMounted = true
        const { name, value } = e.target;
        if (this._isMounted) {
            this.setState({ [name]: value });
        }
    };

    handleSubmit = (e) => {
        this._isMounted = true
        e.preventDefault();
        const subs = {
            unit: this.state.unit,
            quantity: this.state.quantity,
            item_id: this.props.id
        }


        if (confirm("Are you sure you want to create sub quantity?")) {
            if (this._isMounted) {
                this.setState({ loading: true });
            }
            console.log(subs)
            this.createsub(subs);
        }



    };

    createsub = (subs) => {
        this._isMounted = true
        Http.post('/api/v1/createsubqty', subs)
            .then((response) => {

                if (this._isMounted) {
                    this.setState({ loading: false, sub_id: response.data.id });
                }
                toast("Process successful!")
            })
            .catch(() => {
                console.log(error);
                toast("Error processing!")
            });
    };

    myChangeHandlerUnit = (e, { value }) => {
        if (this._isMounted) {
            this.setState({ unit: value })
        }
    };

    removesubq = () => {
        this._isMounted = true

        if (confirm("Are you sure you want to remove sub quantity to this item?")) {
            Http.post('/api/v1/removesubqty', { id: this.props.id })
                .then((response) => {

                    if (this._isMounted) {
                        this.setState({ unit: null, quantity: null, sub_id: null });
                    }
                    toast("Process successful!")
                })
                .catch(() => {
                    console.log(error);
                    toast("Error processing!")
                });
        }

    };


    // 

    render() {
        const { loading } = this.state;
        return (
            <div>
                <b>  Convert Measurement :</b>
                <br /><br />

                <form onSubmit={this.handleSubmit}>
                    Quantity
                             <input
                        defaultValue={this.state.quantity}
                        type="number"
                        name="quantity"
                        onBlur={this.handleChange}
                        class="form-control mb-2 mr-sm-2"
                        step="0.001"
                        required
                    />

                            Unit
                            <Dropdown
                        type="select"
                        placeholder={this.state.unit ? this.state.unit : 'Select unit'}
                        fluid
                        search
                        selection
                        onChange={this.myChangeHandlerUnit}
                        options={this.props.unit}
                        id="addItem"
                        name="unit_name"
                        required
                        clearable
                    />
                    <br />

                    <button type="submit"
                        className={classNames('btn btn-primary mb-2 inline_block', {
                            'btn-loading': loading,
                        })}>{this.state.sub_id ? "Update" : "Create"}   </button>

                    {this.state.sub_id ? <i class="trash icon" onClick={this.removesubq}></i> : <></>}
                </form>


            </div >
        );
    }
}

const mapStateToProps = (state) => ({
    isAuthenticated: state.Auth.isAuthenticated,
    user: state.Auth.user,
});

export default connect(mapStateToProps)(Subs);
