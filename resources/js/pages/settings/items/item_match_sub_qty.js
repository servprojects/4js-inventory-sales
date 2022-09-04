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
            name: null,
            unit: null,
            size: null,
            code: null,
            error: false,
            upId: null,
            data: [],
        };

        // API endpoint.
        this.api = '/api/v1/brand';
    }
    componentDidMount() {
        this._isMounted = true
        var match = this.props.convMatch;
        // console.log("match")
        // console.log(match)
        if (match) {
            if (match.length > 0) {
                if (this._isMounted) {
                    this.setState({
                        name: match[0].name,
                        size: match[0].size,
                        unit: match[0].unit,
                        code: match[0].code,
                        upId: match[0].id,
                    });


                }
            }
        }



        // if (this.state.timeout) clearTimeout(this.state.timeout);
        // this.state.timeout = setTimeout(() => {
        //     Http.post('/api/v1/GetConvDet', { id: this.props.id })
        //         .then((response) => {
        //             var match = response.data.match;
        //             if (this._isMounted) {
        //                 this.setState({
        //                     name: match[0].name,
        //                     size: match[0].size,
        //                     unit: match[0].unit,
        //                     code: match[0].code,
        //                     upId: match[0].id,
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
            code: this.state.code,
            item_id: this.props.id
        }


        if (confirm("Are you sure you want to match ?")) {
            if (this._isMounted) {
                this.setState({ loading: true });
            }
            // console.log(subs)
            this.createsub(subs);
        }



    };

    createsub = (subs) => {
        this._isMounted = true
        Http.post('/api/v1/creatematch', subs)
            .then((response) => {
                var match = response.data.item;
                if (this._isMounted) {
                    this.setState({ 
                        loading: false,
                        name: match[0].name,
                        size: match[0].size,
                        unit: match[0].unit,
                        upId: response.data.id 
                    });
                }
                toast("Process successful!")
            })
            .catch((error) => {
                console.log(error);
                toast("Error processing!")
                this.setState({ loading: false });
            });
    };

    unlink = () => {
        this._isMounted = true

        if (confirm("Are you sure you want to unlink this item?")) {
            Http.post('/api/v1/unlinkmatch', { id: this.props.id })
                .then((response) => {

                    if (this._isMounted) {
                        this.setState({ code: null, upId: null, name: null });
                    }
                    toast("Process successful!")
                })
                .catch(() => {
                    console.log(error);
                    toast("Error processing!")
                });
        }

    };


    render() {
        const { loading } = this.state;
        // console.log("upid")
        // console.log(this.state.upId)
        return (
            <div>
                <b>  Item matched : <br />{this.state.name} {this.state.size}-{this.state.unit}</b>
                {/* <b>  Item matched sub quantity : <br/>{this.state.name}</b> */}
                <br /><br />
                <form onSubmit={this.handleSubmit}>
                    Item Code

                    <input
                        defaultValue={this.state.code}
                        type="text"
                        name="code"
                        onBlur={this.handleChange}
                        class="form-control mb-2 mr-sm-2"
                    />


                    <br />

                    <button type="submit"
                        className={classNames('btn btn-primary mb-2', {
                            'btn-loading': loading,
                        })}>Match</button>

                    {this.state.upId ? <i class="trash icon" onClick={this.unlink}></i> : <></>}
                </form>

            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    isAuthenticated: state.Auth.isAuthenticated,
    user: state.Auth.user,
});

export default connect(mapStateToProps)(Subs);
