import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import * as actions from '../store/actions';
import classNames from 'classnames';
import Http from '../Http';
import update from 'immutability-helper';


class Superadmin extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);

        // Initial state.
        this.state = {
            loading: false,
            name: null,
            location: null,
            upId: null,
            error: false,

            reqs: localStorage.getItem('reqs'),
            cheque: localStorage.getItem('cheque'),
            ownreqs: localStorage.getItem('ownreqs'),

            display_mes: { display: "none" },
            unread: { display: "block" },
            read: { display: "none" },
            data: [],
            notif: [],

            sysmode: 'regular',


        };

        // API endpoint.
        this.api = '/api/v1/header/user';
    }
    componentDidMount() {
        this._isMounted = true



        Http.get(`${this.api}`)
            .then((response) => {
                // const { data } = response.header;

                var reqs = response.data.reqs;
                var ownreqs = response.data.ownreqs;
                var cheque = response.data.cheque;

                var loc_reqs = localStorage.getItem('reqs');
                var loc_ownreqs = localStorage.getItem('ownreqs');
                var loc_cheque = localStorage.getItem('cheque');

                if (this._isMounted) {
                    this.setState({
                        data: response.data.header,
                        notif: response.data.notif,
                        hello: response.hello,
                        error: false,
                    });

                    if (response.data.notif === undefined || response.data.notif.length == 0) {
                        this.setState({
                            display_mes: { display: "block" },
                        });
                    }

                    if (loc_reqs != reqs || loc_ownreqs != ownreqs || loc_cheque != cheque) {

                        localStorage.setItem('reqs', reqs)
                        localStorage.setItem('ownreqs', ownreqs)
                        localStorage.setItem('cheque', cheque)

                        this.setState({
                            reqs: localStorage.getItem('reqs'),
                            cheque: localStorage.getItem('cheque'),
                            ownreqs: localStorage.getItem('ownreqs'),
                        })
                    }



                }

            })
            .catch(() => {
                this.setState({
                    error: 'Unable to fetch data.',
                });
            });

        this.getSystemMode();

    }

    handleLogout = (e) => {
        e.preventDefault();
        this.props.dispatch(actions.authLogout());
    };

    getAcc = (e) => {
        this._isMounted = true
        Http.get(`${this.api}`)
            .then((response) => {
                const { data } = response.header;
                if (this._isMounted) {
                    this.setState({
                        data: response.data.header,
                        hello: "hello",
                        error: false,
                    });
                }
            })
            .catch(() => {
                this.setState({
                    error: 'Unable to fetch data.',
                });
            });

    };

    readnotif = (e) => {
        this._isMounted = true
        const { key } = e.target.dataset;

        Http.patch(`/api/v1/upnotif/${key}`)
            .then((response) => {
                var notif = this.state.notif;
                var commentIndex = notif.findIndex(function (c) {
                    return c.id == key;
                });

                var updatedComment = update(notif[commentIndex], { icon: { $set: "envelope open outline icon" } });

                var newData = update(notif, {
                    $splice: [[commentIndex, 1, updatedComment]]
                });
                if (this._isMounted) {
                    this.setState({ notif: newData });
                }

            })
            .catch((error) => {
                console.log(error);
                // toast("Error deleting brand!")
            });
    };
    handlePOS = () => {
        // console.log("doing something");
        const win = window.open("/pos", "_blank");
        win.focus();
    }

    getSystemMode() {
        Http.post(`/api/v1/sysmode`)
            .then(({ data }) => {
                console.log("data.spec")
                console.log(data.spec)
                if (this._isMounted) { this.setState({ sysmode: data.spec }); };
            })
            .catch(() => {
                this.setState({
                    error: 'Unable to fetch data.',
                    load: false,
                });
            });
    }


    render() {
        const { data, notif,
        } = this.state;
        const reqs = {
            fontSize: "15px",
        };
        const nav = {
            height: 50
        };
        const message = this.state.display_mes;
        const read = this.state.read;
        const unread = this.state.unread;
        var route;

        var branch = " ";
        var email = " ";
        var role = " ";
        var bid;
        data.map((head) => {

            branch = head.branch
            email = head.email
            role = head.role
            bid = head.branch_id

        })



        var requets = parseInt(this.state.reqs) + parseInt(this.state.ownreqs);


        return (

            <div>

                {this.props.isAuthenticated && (



                    <div>

                        <nav class="navbar navbar-expand-lg navbar-light bg-light nav_style customNav" >

                            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                                <span class="navbar-toggler-icon"></span>
                            </button>

                            <div class="collapse navbar-collapse" id="navbarSupportedContent" style={reqs}>
                                <ul class="navbar-nav mr-auto">
                                    <li class="nav-item active">
                                        <Link to="/"> <a class="nav-link" href="#">Dashboard <span class="sr-only">(current)</span></a></Link>
                                    </li>

                                    <li className={classNames('nav-item dropdown', {
                                        'mdl-badge mdl-badge--overlap': this.state.cheque > 0 ? true : false,
                                    })} data-badge={this.state.cheque}>
                                        <a class="nav-link dropdown-toggle " href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                            Transaction
                                        </a>
                                        <div class="dropdown-menu" aria-labelledby="navbarDropdown">

                                            <h6 class="dropdown-header">Receiving</h6>
                                            <Link to="/receive/norequest/purchase"> <a class="dropdown-item" href="#">NR Purchase</a></Link>
                                            {this.state.sysmode != 'pos' ?
                                                <>
                                                    <Link to="/receive/withequest/purchase"> <a class="dropdown-item" href="#">WR Purchase</a></Link>
                                                    <Link to="/receive/transfer"> <a class="dropdown-item" href="#">Requested Transfer</a></Link>
                                                    <Link to={{ pathname: `/direct/transfer`, state: { type: "regular_release" } }}> <a class="dropdown-item" href="#">Direct Transfer</a></Link>
                                                    <Link  to={{ pathname: `/direct/transfer/pos`, state: { type: "pos_release" } }} > <a class="dropdown-item" href="#">POS Release</a></Link>
                                                    <Link to="/conversion"> <a class="dropdown-item" href="#">Conversion</a></Link>
                                                    <div class="dropdown-divider" ></div>


                                                    {role === "Superadmin" ? <Link to="/paysupplier"><a className={classNames('dropdown-item', {
                                                        'mdl-badge  mdl-badge--overlap': this.state.cheque > 0 ? true : false,
                                                    })} data-badge={this.state.cheque} href="#">Pay to supplier</a></Link> : <></>}
                                                    <Link to={{ pathname: `/pettycash`, state: { type: "regular", path: "/pettycash" } }} ><a class="dropdown-item" href="#">Petty Cash</a></Link>
                                                    <Link to={{ pathname: `/remittance`, state: { type: "regular", path: "/remittance" } }} ><a class="dropdown-item" href="#">Remittance</a></Link>
                                                </>
                                                : <></>}

                                        </div>
                                    </li>
                                    <li class="nav-item">

                                        <Link > <a class="nav-link" onClick={this.handlePOS} href="#" target="_blank">POS</a></Link>
                                    </li>
                                    {this.state.sysmode != 'pos' ?
                                        <>
                                            <li className={classNames('nav-item dropdown', {
                                                'mdl-badge mdl-badge--overlap': requets > 0 ? true : false,
                                            })} data-badge={requets}>
                                                <a class="nav-link dropdown-toggle " href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                    Requisition
                                                </a>
                                                <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                                                    <Link to="/branchrequest"><a href="#" className={classNames('dropdown-item', {
                                                        'mdl-badge  mdl-badge--overlap': this.state.reqs > 0 ? true : false,
                                                    })} data-badge={this.state.reqs}>Branch Requests</a></Link>
                                                    <Link to="/requisition"><a className={classNames('dropdown-item', {
                                                        'mdl-badge  mdl-badge--overlap': this.state.ownreqs > 0 ? true : false,
                                                    })} data-badge={this.state.ownreqs} href="#">Your Requests</a></Link>

                                                </div>
                                            </li>
                                        </>
                                        : <></>}

                                    {/* allrep */}

                                    <li class="nav-item dropdown">
                                        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                            Reports
                                        </a>
                                        <div class="dropdown-menu" aria-labelledby="navbarDropdown">


                                            <Link to={{ pathname: `/report/stocks`, state: { role: role, bid: bid } }}><a class="dropdown-item" href="#">Stock Report</a></Link>
                                            <Link to={{ pathname: `/Generalreports`, state: { path: "/Generalreports" } }}><a class="dropdown-item" href="#">General</a></Link>

                                            {this.state.sysmode != 'pos' ?
                                                <>

                                                    <Link to={{ pathname: `/report/remittance`, state: { type: "Remittance", path: "/report/remittance" } }}><a class="dropdown-item" href="#">Remittances</a></Link>

                                                    <div class="dropdown-divider" ></div>
                                                    <h6 class="dropdown-header">Transactions</h6>


                                                    <Link to={{ pathname: `/report/receiving`, state: { type: "Receiving", path: "/report/receiving" } }}><a class="dropdown-item" href="#">Receiving</a></Link>
                                                    <Link to={{ pathname: `/report/sales`, state: { type: "Sale", path: "/report/sales" } }}><a s class="dropdown-item" href="#">Direct Sales</a></Link>
                                                    <Link to={{ pathname: `/report/charges`, state: { type: "Charge", path: "/report/charges" } }}><a class="dropdown-item" href="#">Charges</a></Link>
                                                    <Link to={{ pathname: `/report/returns`, state: { type: "Return", path: "/report/returns" } }}><a class="dropdown-item" href="#">Returns</a></Link>
                                                    <Link to={{ pathname: `/report/replacements`, state: { type: "Replacement", path: "/report/replacements" } }}><a class="dropdown-item" href="#">Replacements</a></Link>
                                                    <Link to={{ pathname: `/report/paymentcharges`, state: { type: "Payment Charge", path: "/report/paymentcharges" } }}><a class="dropdown-item" href="#">Payment Charges</a></Link>


                                                    <div class="dropdown-divider" ></div>
                                                </>
                                                : <></>}

                                            <h6 class="dropdown-header" >Ledgers</h6>


                                            <Link to="/itemLedger"><a class="dropdown-item" href="#">Item</a></Link>
                                            {this.state.sysmode != 'pos' ?
                                                <>

                                                    <Link to="/customerLedger"><a class="dropdown-item" href="#">Customer</a></Link>
                                                    <Link to="/projectLedger"><a class="dropdown-item" href="#">Project</a></Link>
                                                    <Link to="/supplierLedger"><a class="dropdown-item" href="#">Supplier</a></Link>
                                                    <Link to="/officeLedger"><a class="dropdown-item" href="#">Office</a></Link>
                                                </>
                                                : <></>}

                                        </div>
                                    </li>

                                    <li class="nav-item" >
                                        <Link to="/stocks"> <a class="nav-link" href="#">Stocks</a></Link>
                                    </li>
                                    <li class="nav-item" style={{ display: "none" }}>
                                     <Link to="/Settings"> <a class="nav-link" href="#">Utilities</a></Link> 
                                    </li>
                                    <li class="nav-item dropdown">
                                         {this.state.sysmode != 'pos' ?  <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                            Utilities
                                        </a> : <></>}
                                        <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                                            <Link to="/utilities/users"><a class="dropdown-item" href="#">Users</a></Link>
                                            <Link to="/utilities/branches"><a class="dropdown-item" href="#">Branch</a></Link>
                                            <Link to="/utilities/suppliers"><a class="dropdown-item" href="#">Supplier</a></Link>
                                            <Link to="/utilities/projects"><a class="dropdown-item" href="#">Projects</a></Link>
                                            <Link to="/utilities/customers"><a class="dropdown-item" href="#">Customers</a></Link>
                                            <div class="dropdown-divider" ></div>
                                            <Link to="/utilities/items"><a class="dropdown-item" href="#">Items</a></Link>
                                            <Link to="/utilities/priceprint"><a class="dropdown-item" href="#">Print Pricing</a></Link>
                                        </div>
                                    </li>
                                    <li class="nav-item">
                                        <Link to="/physicalCount"> <a class="nav-link" href="#">Physical Count</a></Link>
                                    </li>
                                    {/* <li class="nav-item">
                                        <Link to="/payroll"> <a class="nav-link" href="#">Employee Management</a></Link>
                                    </li> */}
                                    {/* <li class="nav-item">
                                        <Link to="/pos/sales"> <a class="nav-link" href="#">New POS</a></Link>
                                    </li> */}
                                    <li class="nav-item">

                                    </li>


                                </ul>
                                <div clas="ul_right">
                                    <ul class="navbar-nav mr-auto ">

                                        <li class="nav-item dropdown  ">
                                            <div >


                                                <div class="inline_block">
                                                    <a class="nav-link " onClick={this.getAcc} href="#" id="notifDrop" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                        <i class="bell icon icon_style"></i>
                                                    </a>
                                                    <form class="dropdown-menu notif_dropdown accdropDown_notif" aria-labelledby="notifDrop">

                                                        <table class="tabNotif">


                                                            {notif.map((notif) => (


                                                                <tr>

                                                                    <td class="tdNotif">

                                                                        <div class="notifContainer">

                                                                            <div class="inline_block"><i onClick={this.readnotif} data-key={notif.id} style={this.state.unread} class={notif.icon}></i></div>
                                                                            <Link to={{ pathname: `${notif.route}`, state: { reqId: notif.requisition_code } }}>
                                                                                <div class="inline_block">
                                                                                    <div class="notifHead">  <p class="inline_block">{notif.type}</p> <p class="inline_block notifdate">{notif.date}</p> </div>
                                                                                    <div class="notifBody">{notif.description}</div>
                                                                                </div>
                                                                            </Link>

                                                                        </div>

                                                                    </td>

                                                                </tr>

                                                            ))}


                                                            <tr>
                                                                <td>
                                                                    <div class="notifContainer" style={message} >

                                                                        <center>   <div class="notifBody">No Notification</div> </center>
                                                                    </div>
                                                                </td>
                                                            </tr>

                                                        </table>


                                                    </form>
                                                </div>

                                                <div class="inline_block">
                                                    <a class="nav-link " onClick={this.getAcc} href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                        <i class="user circle icon icon_style"></i>
                                                    </a>

                                                    <div class="dropdown-menu userdet_dropdown accdropDown" aria-labelledby="navbarDropdown">
                                                        <div class="userDet">

                                                            {branch}
                                                        </div>
                                                        <hr />
                                                        <div class="userDet">

                                                            {email}
                                                            <br />
                                                            {role}
                                                        </div>

                                                        <hr />
                                                        <Link to=" " onClick={this.handleLogout}><a class="dropdown-item" href="#">Logout</a></Link>

                                                    </div>
                                                </div>


                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </nav>
                    </div>
                )}
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    isAuthenticated: state.Auth.isAuthenticated,
});

export default connect(mapStateToProps)(Superadmin);
