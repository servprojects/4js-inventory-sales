import React, { Component, useRef } from 'react';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import Http from '../../Http';
import { Dropdown, Icon, Button } from 'semantic-ui-react';
import update from 'immutability-helper';
import ModItems from "../reports/modIems_upReturn";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

class PrintPayCharge extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props);

        // Initial state.
        this.state = {
            released: [],
            replacements: [],
            curItemBalance: [],
            modSelected: [],
            org_items: [],
            newReturn: [],
            returns: [],
            repid: null,
            excess: null,
            modReplace: "no",
            addReturn: "no",
        };

    }

    componentDidMount() {

        this.getTransaction()
    }

    getTransaction = (code) => {

        this._isMounted = true

        Http.post('/api/v1/reports/saleCodeRet', { return_code: this.props.code })
            .then((response) => {
                this.getReleased(response.data.sale_code)

            })
            .catch(() => {

                // toast("Error getting request!")


            });



    }

    handleReturnType = (e) => {
        const { key, itmname, uprice, brand } = e.target.dataset;
        const { name, value } = e.target;



        if (this._isMounted) {

            if (name == "return_type") {
                const { newReturn } = this.state;
                if (value != "Select") {


                    var exist = "no";
                    newReturn.map((itemex) => {
                        if (itemex.item_id == key) {
                            exist = "yes";
                        }
                    })

                    if (exist == "no") {
                        const newItem = {
                            item_id: key,
                            quantity: null,
                            unit_price: uprice,
                            item_name: itmname,
                            brand: brand,
                            item_debit: "no",
                            item_status: value,
                        };
                        const allItems = [newItem, ...this.state.newReturn];
                        if (this._isMounted) {
                            this.setState({ newReturn: allItems });
                        }



                    } else {
                        // message = "Item already exist!";
                        var commentIndex = newReturn.findIndex(function (c) {
                            return c.item_id == key;
                        });

                        var updatedComment = update(newReturn[commentIndex], { status: { $set: value } });

                        var newData = update(newReturn, {
                            $splice: [[commentIndex, 1, updatedComment]]
                        });
                        if (this._isMounted) {
                            this.setState({ newReturn: newData });
                        }



                    }

                } else {
                    const index = newReturn.findIndex(
                        (c) => parseInt(c.item_id, 10) === parseInt(key, 10),
                    );
                    const newUp = [...newReturn.slice(0, index), ...newReturn.slice(index + 1)];

                    if (this._isMounted) {
                        this.setState({ newReturn: newUp });
                    }

                    const { released } = this.state;

                    var commentIndex = released.findIndex(function (c) {
                        return c.id == key;
                    });

                    var updatedComment = update(released[commentIndex], { return_qty: { $set: null } });

                    var newData = update(released, {
                        $splice: [[commentIndex, 1, updatedComment]]
                    });
                    if (this._isMounted) {
                        this.setState({ released: newData });
                    }
                }
            }
        }
    }

    getReplacements = (id) => {
        Http.post(`/api/v1/reports/saleItems`, { id: id })
            .then((response) => {
                if (this._isMounted) {
                    this.setState({
                        replacements: response.data.items,
                    });
                    this.props.replacements(response.data.items)
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

    getExcess = (id) => {
        Http.post(`/api/v1/reports/getExcessTrans`, { return_code: this.props.code })
            .then((response) => {
                if (this._isMounted) {
                    var transExcess = response.data.excess;
                    this.setState({
                        excess: transExcess[0].payable,
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

    totalitmFormatter = (cell, row) => {
        return (

            <div>
                {row.quantity * row.unit_price}
                {/* {row.req_type } */}
            </div>
        );

    }

    getReleased = (code) => {
        // console.log("transcode")
        // console.log(code)
        // console.log("return")
        // console.log(this.props.code)
        console.log("getReplace")
        console.log(this.props.code)
        const subs = { code: code, return_code: this.props.code }
        // console.log(subs)
        Http.post('/api/v1/transaction/return/getcode', subs)
            .then((response) => {

                if (this._isMounted) {
                    var items = response.data.items;
                    var returns = response.data.returns;

                    items.map((itm) => {
                        returns.map((ret) => {
                            if (itm.id == ret.id) {
                                itm.quantity -= ret.quantity;
                            }
                        });
                    });

                    this.setState({
                        released: response.data.items,
                        repid: response.data.repid,
                        org_items: response.data.org_items,
                        returns: response.data.returns,
                    });

                    this.props.released(response.data.items)

                    this.getReplacements(response.data.repid)
                    this.getExcess()
                }

            })
            .catch(() => {

                // toast("Error getting request!")


            });
    }

    setModReplace = () => {
        this._isMounted = true;

        const subs = {
            repid: this.state.repid,
            items: JSON.stringify(this.state.replacements)
        }
        // console.log("sent")
        // console.log(subs)

        Http.post('/api/v1/reports/getRepItemCurrentStock', subs)
            .then((response) => {
                if (this._isMounted) {
                    // console.log("cur items balances")
                    // console.log(response.data.items)

                    this.setState({
                        curItemBalance: response.data.items,
                    });
                }
            })
            .catch(() => {

                // toast("Error getting request!")


            });


        this.setState({
            modReplace: this.state.modReplace == "no" ? "yes" : "no",
        });
    }

    setAddReturn = () => {
        this._isMounted = true;

        if (this._isMounted) {
            this.setState({
                addReturn: this.state.addReturn == "no" ? "yes" : "no",
            });
        }
    }

    onBeforeSaveCellNR = (row, cellName, cellValue) => {
        if (Number(cellValue) || cellValue == 0) {
            if (cellValue > row.quantity || cellValue == 0) {
                toast("Must be greater than 0 or lesser than released amount");
                return false;
            } else {
                const { newReturn } = this.state;
                var exist = "no";
                newReturn.map((itemex) => {
                    if (itemex.item_id == row.id) {
                        exist = "yes";
                    }
                })

                if (exist == "no") {
                    toast("Please select status first");
                    return false;
                } else {
                    return true;
                }


            }
        } else {
            toast("Invalid amount!")
            return false;
        }
    }

    onBeforeSaveCell = (row, cellName, cellValue) => {
        // console.log("whhhhfd")
        if (Number(cellValue) || cellValue == 0) {
            // curItemBalance
            var check = "valid";
            const { curItemBalance, returns, org_items } = this.state;
            // const itemCurBal = this.state.curItemBalance;
            console.log("itemCurBal")
            console.log(curItemBalance)

            console.log("returns")
            console.log(returns)
            console.log("org_items")
            console.log(org_items)
            // console.log("itemCurBal")
            // console.log(itemCurBal)

            org_items.map((org) => {
                returns.map((ret) => {
                    if (org.id == row.item_id && ret.id == row.item_id) {

                        var calc = (parseFloat(org.quantity) + parseFloat(cellValue)) - parseFloat(ret.quantity)

                        if (calc < 0) {
                            check = "invalid";
                        } else {
                            curItemBalance.map((itemex) => {

                                if (itemex.item_id == row.item_id) {
                                    if (itemex.balance < cellValue) {
                                        check = "invalid"

                                    }
                                }
                            })
                        }


                    }

                })
            })





            if (check == "valid") {
                return true;
            } else {
                // toast("Must be lesser than current balance!")
                toast("Must be valid quantity. Please consider the quantity released, the quantity returned, and the current balance of the item")
                return false;
            }


        } else {
            toast("Invalid amount!")
            return false;
        }

    }
    retStatFormat = (cell, row) => {
        const dis = this.state.edit_qty;
        return (

            <div>


                <select class="form-control" name="return_type" data-itmname={row.item} data-brand={row.brand} data-uprice={row.unit_price} data-key={row.id} onChange={this.handleReturnType}>
                    <option >Select</option>
                    <option value="Defective">Defective</option>
                    <option value="Returned GC">Good Condition</option>
                </select>

            </div>
        )
    }
    saveMod = () => {
        const subs = {
            return_code: this.props.code,
            mod_items: JSON.stringify(this.state.modSelected),
            type: this.props.org_type
        }

        console.log("replace subs")
        console.log(subs)
        var api;

        if (this.props.org_type == "Sale") {
            api = `/api/v1/mod/transaction/replacement`;
        } else if (this.props.org_type == "Charge") {
            api = `/api/v1/mod/transaction/replacement/charge`;
        }

        if (confirm("Are you sure you want to modify this transaction?")) {
            Http.post(api, subs)
                .then((response) => {
                    toast("Transaction successfully updated");
                })
                .catch(() => {
                    toast("Error fetching")
                });
        }
    }

    saveModAddRet = () => {
        const { newReturn } = this.state;

        const subs = {
            return_code: this.props.code,
            mod_items: JSON.stringify(this.state.newReturn),
            type: this.props.org_type,
            mod_type: "Add"
        }

        // transaction/return
        console.log("submit")
        console.log(subs)
        var qty = 0;
        newReturn.map((i) => {
            qty += i.quantity;
        })

        if (qty == 0) {
            toast("Please input valid return quantity")
        } else {
            if (confirm("Are you sure you want to modify this transaction?")) {
                Http.post(`/api/v1/mod/transaction/return`, subs)
                    .then((response) => {
                        toast("Returns successfully added");
                        if (this._isMounted) {
                            this.setState({
                                newReturn: [], addReturn: "no"
                            });
                        }

                        this.getTransaction()
                    })
                    .catch(() => {
                        toast("Error fetching")
                    });
            }


        }

    }

    onAfterSaveCell = (row, cellName, cellValue) => {

        this.returnMod(row.quantity, row.unit_price, row.id, row.item_status, cellValue, "quantity", "quantity", row.item_name, row.item_id);
        // toast(row.unit_price)
    }

    onAfterSaveCellNR = (row, cellName, cellValue) => {

        const { newReturn } = this.state;

        var commentIndex = newReturn.findIndex(function (c) {
            return c.item_id == row.id;
        });

        var updatedComment = update(newReturn[commentIndex], { quantity: { $set: cellValue } });

        var newData = update(newReturn, {
            $splice: [[commentIndex, 1, updatedComment]]
        });
        if (this._isMounted) {
            this.setState({ newReturn: newData });
        }

    }

    returnMod = (quantity, uprice, key, status, value, name, type, item_name, item_id) => {

        const { modSelected } = this.state;


        var items = modSelected;

        var exist = "no";
        items.map((itemex) => {

            if (itemex.trItem_id == key) {
                exist = "yes";
                status = itemex.item_status;
                quantity = itemex.quantity;
            }
        })

        if (type == "status") {
            status = value
        } else if (type == "quantity") {
            quantity = value
        }


        if (exist == "no") {
            const newItm = {
                item_name: item_name,
                item_status: status,
                trItem_id: key,
                item_id: item_id,
                quantity: quantity,
                unit_price: uprice
            }

            items.push(newItm)

            if (this._isMounted) {
                this.setState({
                    modSelected: items,
                });
            }
        } else {
            var commentIndex = items.findIndex(function (c) {
                return c.trItem_id == key;
            });

            var updatedComment = update(items[commentIndex], { [name]: { $set: value } });

            var newData = update(items, {
                $splice: [[commentIndex, 1, updatedComment]]
            });

            if (this._isMounted) {
                this.setState({
                    modSelected: newData,
                });
            }
        }


    }

    updateDebit = (e) => {

        const { key } = e.target.dataset;
        const { name, value } = e.target;
        const { newReturn } = this.state;
        console.log("newReturn")
        console.log(newReturn)
        console.log(key)
        console.log("value")
        console.log(value)
        var exist = "no";
        newReturn.map((itemex) => {
            if (itemex.item_id == key) {
                exist = "yes";
            }
        })

        if (exist == "no") {
            toast("Please select status first");

        } else {
            // message = "Item already exist!";
            var commentIndex = newReturn.findIndex(function (c) {
                return c.item_id == key;
            });

            var updatedComment = update(newReturn[commentIndex], {  item_debit: { $set: value } });

            var newData = update(newReturn, {
                $splice: [[commentIndex, 1, updatedComment]]
            });
            if (this._isMounted) {
                this.setState({ newReturn: newData });
            }
        }



    }

    buttonFormatter_upDebit = (cell, row) => {
        const dis = this.state.edit_qty;
        return (

            <div>

                <div>
                    {row.item_debit}
                    <select class="form-control" style={dis} name="item_debit " data-key={row.id} onChange={this.updateDebit}>
                        <option >Select</option>
                        <option value="no">No</option>
                        <option value="yes">Yes</option>
                    </select>
                    {/* <input type="number" style={dis} data-key={row.item_id} data-name="returned" onChange={this.updateQty} class="form-control form-control-lg qtyInpt" name="itm_qty" required placeholder="Qty" /> */}
                </div>


            </div>
        )
    }
    render() {

        const transdet = this.props.transdet;
        const { modSelected, newReturn } = this.state;
        const formatter = new Intl.NumberFormat('fil', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2
        })
        const tabstyle = { whiteSpace: "nowrap", width: "1%" };
        const cellEditPropMain = {
            // mode: 'click',
            mode: 'dbclick',
            blurToSave: true,
            beforeSaveCell: this.onBeforeSaveCell, // a hook for before saving cell
            afterSaveCell: this.onAfterSaveCell
            // blurToSave: false,
        };
        const cellEditNewReturn = {
            // mode: 'click',
            mode: 'dbclick',
            blurToSave: true,
            beforeSaveCell: this.onBeforeSaveCellNR, // a hook for before saving cell
            afterSaveCell: this.onAfterSaveCellNR
            // blurToSave: false,
        };
        // console.log("repid")
        // console.log(this.state.repid)
        // console.log("Sleected replace")
        // console.log(modSelected)
        // console.log("Replacements")
        // console.log(this.state.replacements)


        return (
            <>
                <br />
                <br />
                {this.state.excess ? <div style={{ float: "right" }}><b>Excess Payment:</b> {formatter.format(this.state.excess)}</div> : <></>}
                <br />
                <hr />
                <h1>Overall Released Items </h1>
                Accumulated of original released and replaced Items
                <br />
                Code: {this.props.code}
                <br /><br />

                <Button style={{ float: "left" }} onClick={this.setAddReturn} primary={this.state.addReturn == "no" ? false : true}>Add Return</Button>
                {newReturn.length > 0 ? <p style={{ float: "left" }}><ModItems data={newReturn} type="replace" />  </p> : <></>}
                {newReturn.length > 0 ? <Button style={{ float: "right" }} onClick={this.saveModAddRet} primary>Save New Return</Button> : <></>}
                <br />
                <br />
                <BootstrapTable
                    ref='table'
                    data={this.state.released}
                    cellEdit={cellEditNewReturn}

                // options={options} exportCSV
                >
                    <TableHeaderColumn editable={false} tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} dataField='item' >Item Name</TableHeaderColumn>
                    <TableHeaderColumn editable={false} width="130" dataField='brand'>Brand</TableHeaderColumn>
                    <TableHeaderColumn editable={false} width="100" dataField='quantity'>Quantity</TableHeaderColumn>
                    <TableHeaderColumn editable={false} width="100" dataField='unit_price'>SRP</TableHeaderColumn>
                    <TableHeaderColumn editable={false} width="100" dataField=' ' dataFormat={this.totalitmFormatter}>Total</TableHeaderColumn>
                    {/* <TableHeaderColumn width="100" hidden dataField='item_id'>item id</TableHeaderColumn> */}
                    <TableHeaderColumn width="100" hidden={this.state.addReturn == "no" ? true : false} dataFormat={this.retStatFormat} dataField=''>Status</TableHeaderColumn>
                    <TableHeaderColumn width="100" hidden={this.state.addReturn == "no" ? true : false} dataField='return_qty'>Return Qty</TableHeaderColumn>
                    <TableHeaderColumn width="100" hidden={this.props.org_type == "Charge" && this.state.addReturn == "no" ? true : false} dataField='item_debit' dataFormat={this.buttonFormatter_upDebit}>Debit</TableHeaderColumn>
                    <TableHeaderColumn editable={false} width="100" isKey={true} hidden dataField='trnItm_id'>id</TableHeaderColumn>

                </BootstrapTable>

                <h1> Replace Items </h1>
                <Button style={{ float: "left" }} onClick={this.setModReplace} primary={this.state.modReplace == "no" ? false : true}>Update Replace</Button>
                {modSelected.length > 0 ? <p style={{ float: "left" }}><ModItems data={modSelected} type="replace" />  </p> : <></>}
                {modSelected.length > 0 ? <Button style={{ float: "right" }} onClick={this.saveMod} primary>Save Replace Modification</Button> : <></>}<br /><br />
                {/* Code: {this.state.repid} */}
                <BootstrapTable
                    ref='table'
                    data={this.state.replacements}
                    cellEdit={this.state.modReplace == "no" ? {} : cellEditPropMain}
                // options={options} exportCSV
                >
                    <TableHeaderColumn editable={false} tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} dataField='item_name' >Item Name</TableHeaderColumn>
                    <TableHeaderColumn editable={false} width="130" dataField='brand'>Brand</TableHeaderColumn>
                    <TableHeaderColumn width="100" dataField='quantity'>Quantity</TableHeaderColumn>
                    <TableHeaderColumn editable={false} width="100" dataField='unit_price'>SRP</TableHeaderColumn>
                    <TableHeaderColumn editable={false} width="100" dataFormat={this.totalitmFormatter} dataField=' '>Total</TableHeaderColumn>
                    {/* <TableHeaderColumn width="100" hidden dataField='item_id'>item id</TableHeaderColumn> */}
                    <TableHeaderColumn width="100" isKey={true} hidden dataField='trnItm_id'>id</TableHeaderColumn>
                    <TableHeaderColumn width="100" hidden dataField='item_id'>item_id</TableHeaderColumn>

                </BootstrapTable>

                <hr />
            </>
        );
    }
}
export default PrintPayCharge;