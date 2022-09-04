import React, { Component, useRef } from 'react';
// import PrintHeader from './printHeader';
import Http from '../../Http';
import ModifySalesItems from '../reports/modifySalesItem';
import { connect } from 'react-redux';
import ReactToPrint from "react-to-print";
import { Dropdown, Icon, Button } from 'semantic-ui-react';
import PrintReportItem from '../prints/printReportItem';
import { Link } from 'react-router-dom';
import ReactHTMLTableToExcel from 'react-html-table-to-excel';
import { ToastContainer, toast } from 'react-toastify';
import classNames from 'classnames';
import update from 'immutability-helper';
import EndSession from '../../pages/endSession';
class PrintReport extends Component {
    _isMounted = false
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            options: [],
            loadingItm: false,
            set_max: null,
            quantity: null,
            item_id: null,
            branch_id: null,
            curbranch: null,
            date_released: null,
            date_received: null,
            items: [],
            selected: [],
            branches: [],
            data: [],
            POSRelease: 0,

            endOfSession: "no",
            hashuserId: null
        }
    }

    componentDidMount() {

        this._isMounted = true

        // var api = `/api/v1/reports/deletedItms`;

        Http.post(`/api/v1/user/hash`)
        .then((response) => {
          if (this._isMounted) {
            this.setState({
              hashuserId: response.data.hashuserId,
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

        Http.post(`/api/v1/items/withbalances`)
            .then((response) => {
                // const { data } = response.data;
                if (this._isMounted) {
                    this.setState({
                        items: response.data.items,
                        curbranch: response.data.curbranch,
                        hashuserId: response.data.hashuserId,
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


        Http.get('/api/v1/branch')
            .then((response) => {
                // const { data } = response.data;
                if (this._isMounted) {
                    this.setState({
                        branches: response.data.branches,
                        error: false,
                    });
                }
            })
            .catch(() => {
                this.setState({
                    error: 'Unable to fetch data.',
                });
            });

            
console.log("this.props.location.type")
console.log(this.props.location.state.type)
        // this.identifyCurrentUser();

        if (this._isMounted) {
            this.setState({
                POSRelease: this.props.location.state.type == 'pos_release' ? 1 : 0,
            });
        }

    }

    identifyCurrentUser = () => {
        this._isMounted = true
        var localTerminal = JSON.parse(localStorage.getItem("user") || "[]");
        if (this.state.hashuserId) {
            if (this.state.hashuserId !== localTerminal.id || !localTerminal) {
                toast("You are no longer logged in, Please close this tab and open again")

                if (this._isMounted) {

                    this.setState({

                        endOfSession: "yes",

                    });
                }

            }
        }

    };

    sendTransfer = () => {
        this._isMounted = true


        if (confirm("Are you sure you want to transfer items? This will affect balances and collectibles of 2 branches")) {
            const subs = {
                date_released: this.state.date_released,
                date_received: this.state.date_received,
                items: JSON.stringify(this.state.data),
                receiver_branch: this.state.branch_id
            }

            console.log(subs)


            var api = `/api/v1/transaction/receive/transfer/direct`;
            if(this.state.POSRelease == 1){
                api = `/api/v1/transaction/receive/transfer/direct/pos/release`;
            }

            Http.post(api, subs)
                .then((response) => {
                    // const { data } = response.data;
                    this.setState({
                        data: [],

                    });
                    toast("Transfer successful");
                })

                .catch(() => {
                    if (this._isMounted) {
                        this.setState({
                            error: 'Unable to fetch data.',
                        });
                        toast("Failed to transfer");
                    }
                });


        }
    }

    handleSubmit = (e) => {
        this._isMounted = true
        const { data, items, item_id } = this.state;
        e.preventDefault();

        var res = items.filter(function (v) {
            return v.id == item_id;
        })




        var exist = "no";
        data.map((itemex) => {
            if (itemex.id == item_id) {
                exist = "yes";
            }
        })

        if (exist == "no") {
            const subs = {
                id: this.state.item_id,
                quantity: this.state.quantity,
                item: res[0].name,
                brand: res[0].brand,

            }
            this.addReqItem(subs);
        } else {
            toast("Item already exist!")
            this.setState({ loading: false });
        }

    };

    addReqItem = (property) => {
        this._isMounted = true
        const allItems = [property, ...this.state.data];

        if (this._isMounted) {
            this.setState({
                data: allItems, item_id: null,

            });
        }


    };



    handleChange = (e) => {
        this._isMounted = true
        const { name, value } = e.target;
        if (this._isMounted) {
            this.setState({ [name]: value });
        }
    };

    myChangeHandlerItem = (e, { value }) => {
        if (this._isMounted) {
            this.setState({ item_id: value })
        }
        const { items } = this.state;
        var result = items.filter(function (v) {
            return v.id == value;
        })
        if (this._isMounted) {
            this.setState({ set_max: result[0].balance })
        }
    };

    myChangeHandlerBranch = (e, { value }) => {
        if (this._isMounted) {
            this.setState({ branch_id: value })
        }

    };


    onSearchChange = (e, value) => {
        const { items } = this.state;
        // const { items } = this.state;
        this._isMounted = true
        if (this._isMounted) {
            this.setState({ loadingItm: true })
        }
        if (this.state.timeout) clearTimeout(this.state.timeout);
        this.state.timeout = setTimeout(() => {
            // console.log(value.searchQuery)
            var n = value.searchQuery
            var val = n.toString();
            const result = items.filter(function (data) {
                if (val == null) {
                    return data
                }
                else if (data.code.toLowerCase().includes(val.toLowerCase()) || data.name.toLowerCase().includes(val.toLowerCase())
                ) {
                    return data
                }
            }
            )

            // console.log(result)

            if (this._isMounted) {
                this.setState({ options: result, loadingItm: false })
            }
        }, 300);

    }

    onAfterSaveCell = (row, cellName, cellValue) => {
        // alert(`Save cell ${cellName} with value ${cellValue} ${row.id} `);
        const { data } = this.state;
        // let rowStr = '';
        // for (const prop in row) {
        //   rowStr += prop + ': ' + row[prop] + '\n';
        // }

        var commentIndex = data.findIndex(function (c) {
            return c.id == row.id;
        });
        var updatedComment = update(data[commentIndex], { [cellName]: { $set: cellValue } });
        var newData = update(data, {
            $splice: [[commentIndex, 1, updatedComment]]
        });
        if (this._isMounted) {
            this.setState({ data: newData });
        }

        toast("Item successfully updated", {
            position: toast.POSITION.BOTTOM_RIGHT,
            className: 'foo-bar'
        });

        // alert('Thw whole row :\n' + rowStr);
    }

    onRowSelect = (row, isSelected, e) => {
        const { selected, selected: se } = this.state;


        var dptemp = selected;
        if (this._isMounted) {
            if (isSelected) {
                const subs = {
                    id: row.id,
                }
                dptemp.push(subs);
                this.setState({
                    selected: dptemp,
                });

            } else {
                const index = se.findIndex(
                    (sc) => parseInt(sc.id, 10) === parseInt(row.id, 10),
                );
                const dptemp = [...se.slice(0, index), ...se.slice(index + 1)];

                this.setState({
                    selected: dptemp,
                });

            }
        }
        // console.log("sel")
        // console.log(dptemp)

    }


    onSelectAll = (isSelected, rows) => {



        const { selected, selected: se } = this.state;
        var dptemp = selected;
        var subs;
        if (this._isMounted) {
            if (isSelected) {
                dptemp = [];
                for (let i = 0; i < rows.length; i++) {
                    // alert(rows[i].id);
                    subs = {
                        id: rows[i].id,
                    }
                    dptemp.push(subs);
                }
                this.setState({
                    selected: dptemp,
                });

            } else {
                dptemp = [];
                this.setState({
                    selected: dptemp,
                });
            }
        }

    }


    deleteItems = () => {
        const { selected, selected: se, data } = this.state;
        var itmTemp = data;
        var index;
        var selindex;
        var seldptemp;


        if (selected.length > 0) {
            for (let i = 0; i < selected.length; i++) {



                index = itmTemp.findIndex(
                    (sc) => parseInt(sc.id, 10) === parseInt(selected[i].id, 10),
                );
                itmTemp = [...itmTemp.slice(0, index), ...itmTemp.slice(index + 1)];


                selindex = se.findIndex(
                    (sc) => parseInt(sc.id, 10) === parseInt(selected[i].id, 10),
                );
                seldptemp = [...se.slice(0, index), ...se.slice(index + 1)];

            }

            this.setState({
                data: itmTemp,
                selected: seldptemp,

            });
        } else {
            toast("Nothing is selected")
        }


    }

    render() {
        const { options, items, data, branches, date_released, date_received, branch_id } = this.state;
        const opt = options.map((items) => ({ key: items.id, value: items.id, text: String(items.balance).concat('----', items.code, '\xa0\xa0\xa0\xa0', items.name, "-", items.brand, " : ", items.size || items.unit ? items.size + " " + items.unit : "(No Size Spec.)") }));
        // const opt = options.map((items) => ({ key: items.id, value: items.id, text: String(items.balance).concat('----', items.code, '\xa0\xa0\xa0\xa0', items.name, "-", items.brand) }));
        const allbranch = branches.map((brnch) => ({ key: brnch.id, value: brnch.id, flag: brnch.id, text: brnch.name }));
        const cellEditProp = {
            mode: 'dbclick',
            blurToSave: true,
            // beforeSaveCell: this.onBeforeSaveCell, // a hook for before saving cell
            afterSaveCell: this.onAfterSaveCell  // a hook for after saving cell
        };

        console.log(data)

        const selectRowProp = {
            mode: 'checkbox',
            clickToSelect: true,
            onSelect: this.onRowSelect,
            onSelectAll: this.onSelectAll,
            columnWidth: '60px'
        };

        return (
            <>
                <div onClick={this.identifyCurrentUser}>
                    {
                        this.state.hashuserId ?
                        <>
                            {
                                this.state.endOfSession == "yes" ?
                                    <EndSession /> : <></>
                            }
                        </> :<></>
                    }
                    <ToastContainer />
                    {/* <div className="contentTransactSales"> */}
                    <div className="contentTransactSales" >
                        <nav aria-label="breadcrumb">
                            <ol class="breadcrumb">
                                <li class="breadcrumb-item active" aria-current="page">Transfer</li>
                                <li class="breadcrumb-item active" aria-current="page">Direct</li>
                                {this.state.POSRelease == 1 ?  <li class="breadcrumb-item active" aria-current="page">POS Release</li> : <></>}
                            </ol>

                        </nav>
                        <br />

                        <div style={{ float: "left", width: "30%" }}>
                           {/* / {this.state.hashuserId}hgf */}
                            <h3>{this.state.curbranch}  {this.state.POSRelease == 1 ? "(POS Release)": <></>}</h3>
                            <small><i>*Please refresh after transaction to get actual data</i></small>
                            <br />
                            {this.state.POSRelease == 1 ?
                            <>
                             <small><i>*Release balances will not automatically refelect to Registered POS, stockman will manually receive the items to the POS</i></small>
                            </>
                            : <></>}
                            <br /><br />
                            <form onSubmit={this.handleSubmit}>
                                <Dropdown
                                    type="select"
                                    placeholder='Select item'
                                    fluid
                                    search
                                    selection
                                    // style={req_inpt}
                                    loading={this.state.loadingItm}
                                    onChange={this.myChangeHandlerItem}
                                    onSearchChange={this.onSearchChange}

                                    options={opt}

                                    name="item_id"
                                    clearable={true}
                                    required
                                />
                                <br />
                                <input placeholder="Quantity" min="0.001" max={this.state.set_max} type="number" step=".001" name="quantity" class="form-control mb-2 mr-sm-2" onBlur={this.handleChange} />
                                <button type="submit" className={classNames('btn btn-primary mb-2')} >Add</button>
                            </form>
                            <br />
                        Date released
                        <input type="date" name="date_released" class="form-control mb-2 mr-sm-2" onChange={this.handleChange} />
                            <br />
                        Date branch received
                        <input type="date" name="date_received" class="form-control mb-2 mr-sm-2" onChange={this.handleChange} />
                        </div>
                        <div style={{ display: "inline-block", float: "right", width: "65%" }}>
                            <div style={{ width: "100%" }}>
                                <div style={{ display: "inline-block" }}>
                                    <Dropdown

                                        type="select"
                                        placeholder='Select receiving branch'
                                        fluid
                                        search
                                        selection

                                        onChange={this.myChangeHandlerBranch}

                                        style={{ width: "100%" }}
                                        options={allbranch}

                                        name="branch_id"
                                        clearable={true}
                                        required
                                    />
                                </div>
                            &nbsp;&nbsp;&nbsp;
                            {
                                    branch_id && date_received && date_released && data.length > 0 ?
                                        <button style={{ display: "inline-block" }} className={classNames('btn btn-primary mb-2')} onClick={this.sendTransfer} >Transfer Items</button>
                                        : <></>
                                }
                            </div>
                            <br /><br />
                            <button onClick={this.deleteItems} className={classNames('btn btn-primary mb-2')} >Delete selected</button>
                            <BootstrapTable
                                ref='table'
                                data={data}
                                pagination={true}
                                search={true}
                                cellEdit={cellEditProp}
                                selectRow={selectRowProp}
                            // style={itemTabs}

                            // options={options} exportCSV
                            >
                                <TableHeaderColumn dataField='id' tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} isKey={true} hidden={true}>id</TableHeaderColumn>
                                <TableHeaderColumn dataField='item_id' hidden={true} tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }}  >id</TableHeaderColumn>
                                <TableHeaderColumn editable={false} dataField="item" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Name</TableHeaderColumn>
                                <TableHeaderColumn editable={false} dataField="item_size" width="100" >Size</TableHeaderColumn>
                                <TableHeaderColumn dataField="quantity" width="100">Qty</TableHeaderColumn>
                                <TableHeaderColumn editable={false} dataField="brand" width="150" >Brand</TableHeaderColumn>


                            </BootstrapTable>
                        </div>
                    </div>
                </div>
            </>

        );
    }
}
// export default PrintReport;
const mapStateToProps = (state) => ({
    isAuthenticated: state.Auth.isAuthenticated,
    user: state.Auth.user,
});

export default connect(mapStateToProps)(PrintReport);
