import React, { Component, useRef } from 'react';
// import PrintHeader from './printHeader';
import Http from '../../Http';
import UpCreditToggle from './upToggleCredit';
import { connect } from 'react-redux';
import ReactToPrint from "react-to-print";
import { Dropdown, Icon, Button } from 'semantic-ui-react';
import PrintReportItem from '../prints/printReportItem';
import { Link } from 'react-router-dom';
import ReactHTMLTableToExcel from 'react-html-table-to-excel';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import update from 'immutability-helper';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddHistPurItm from "../transactions/addHistorical_purchase";
import TransLog from "../reports/updateLogRecevingTrans";
import DeletedItems from "../reports/deletedRecTrans";
import classNames from 'classnames';

class UpdateTransaction extends Component {
    _isMounted = false
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            crdexist: null,
            openDelete: "no",
            deact_stat: null,
            selected: [],
            tranItems: [],
            deleted: [],
            transaction: [],
            temp: [],
            normal: "normal",
            reason: "none",
            message: ' '
        }
        this.add = React.createRef();
    }

    componentDidMount() {
        this._isMounted = true
        Http.post(`/api/v1/reports/saleItems`, { id: this.props.location.state.id })
            .then((response) => {
                // const { data } = response.data.transaction.data;
                localStorage.setItem('upitm', JSON.stringify(response.data.items))
                var localTerminal = JSON.parse(localStorage.getItem("upitm") || "[]");
                if (this._isMounted) {

                    var details = response.data.details;

                    this.setState({
                        tranItems: response.data.items,
                        temp: localTerminal,
                        details: details,
                        deact_stat: details[0].transaction_status,
                        replacement: response.data.replacement,
                        repCode: response.data.repCode,
                        relCode: response.data.relCode,
                        retCode: response.data.retCode,

                    });
                    console.log(response.data.details)
                }
            })

            .catch(() => {
                if (this._isMounted) {
                    this.setState({
                        error: 'Unable to fetch data.',
                    });
                }
            });


        // 
        Http.post(`/api/v1/reports/specTransaction`, { id: this.props.location.state.id })
            .then((response) => {
                if (this._isMounted) {

                    this.setState({
                        transaction: response.data.transaction,

                    });
                    console.log("transaction")
                    console.log(response.data.transaction)
                }
            })

            .catch(() => {
                if (this._isMounted) {
                    this.setState({
                        error: 'Unable to fetch data.',
                    });
                }
            });

        this.getStatus();
    }

    getStatus = () => {

        this._isMounted = true
        Http.post(`/api/v1/reports/check/credit`, { id: this.props.location.state.id })
            .then((response) => {

                if (this._isMounted) {
                    this.setState({
                        crdexist: response.data.exist_credit,

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





    saveChanges = (e) => {
        // amountdue
        const { amountdue } = e.target.dataset;
        const { imported } = this.props.location.state;
        var api;
        if (imported == "yes") {
            api = '/api/v1/mod/transaction/items';
        } else {
            api = '/api/v1/mod/transaction/receiving';
        }
        e.preventDefault();
        this._isMounted = true
        if (confirm("Are you sure you want to modify this transaction? Changes will also take effect if this transaction is credited to a supplier. ")) {
            const { deleted, tranItems } = this.state;

            tranItems.map(function (x) {
                if (x.up_stat == " ") {
                    x.up_stat = null;
                }
                return x
            });


            const subs = {
                amntdue: parseFloat(amountdue),
                deleted: JSON.stringify(deleted) == "[]" ? null : JSON.stringify(deleted),
                tranItems: JSON.stringify(tranItems) == "[]" ? null : JSON.stringify(tranItems),
                code: this.props.location.state.code,
                reason: this.state.reason,
            }
            console.log("now")
            console.log(subs)
            if (this._isMounted) {
                this.setState({ loading: true });
            }

            Http.post(api, subs)
                .then((response) => {
                    toast("Changes saved successfully")

                    tranItems.map(function (x) {
                        x.up_stat = null;
                        return x
                    });

                    this.setState({
                        loading: false, amntdue: null, deleted: [], tranItems: tranItems, reason: null
                    });
                    // console.log("nITEM")
                    // console.log(response.data.nitem)

                    // console.log("reqAmt")
                    // console.log(response.data.reqAmt)


                })
                .catch(() => {
                    toast("Error saving changes")
                    this.setState({ loading: false });
                });

        }




    }
    handleChange = (e) => {
        const { name, value } = e.target;
        if (this._isMounted) {
            this.setState({ [name]: value });
        }
    }; 
    
    setOpenDel = () => {
      
        if (this._isMounted) {
            this.setState({ openDelete: this.state.openDelete == "no" ? "yes" : "no" });
        }
    };
    onBeforeSaveCell(row, cellName, cellValue) {
        // You can do any validation on here for editing value,
        // return false for reject the editing
        if (confirm(`Are you sure you want to update ${row.item_name}?`)) {
            if (cellName == "balance") {
                if (Number(cellValue)) {
                    return true;
                } else {
                    toast("Invalid amount!")
                    return false;
                }
            } else {
                return true;
            }

        } else {
            return false;
        }
    }
    reset = () => {
        this._isMounted = true
        var localTerminal = JSON.parse(localStorage.getItem("upitm") || "[]");
        if (this._isMounted) {
            this.setState({ tranItems: localTerminal });
            toast("Reset")
        }
    }
    onAfterSaveCell = (row, cellName, cellValue) => {
        // alert(`Save cell ${cellName} with value ${cellValue} ${row.id} `);
        const { tranItems } = this.state;
        // let rowStr = '';
        // for (const prop in row) {
        //   rowStr += prop + ': ' + row[prop] + '\n';
        // }

        var commentIndex = tranItems.findIndex(function (c) {
            return c.id == row.id;
        });
        var updatedComment = update(tranItems[commentIndex], { [cellName]: { $set: cellValue }, up_stat: { $set: "yes" } });
        var newData = update(tranItems, {
            $splice: [[commentIndex, 1, updatedComment]]
        });
        if (this._isMounted) {
            this.setState({ tranItems: newData });
        }

        toast("Click save if you wish to save the modifications", {
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
        const { selected, selected: se, tranItems, deleted } = this.state;
        var itmTemp = tranItems;
        var index;
        var selindex;
        var seldptemp;
        var result;
        var localTerminal = JSON.parse(localStorage.getItem("upitm") || "[]");
        var subs;
        var deletedT = deleted;
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

                result = localTerminal.filter(function (v) {
                    if (v.id == selected[i].id) {
                        subs = {
                            id: v.id,
                        }
                        deletedT.push(subs);
                        return v
                    } else {
                        return null
                    }

                })





            }

            this.setState({
                tranItems: itmTemp,
                selected: seldptemp,
                deleted: deletedT
            });
        } else {
            toast("Nothing is selected")
        }


    }

    childAdd = () => {
        this.add.current.getAlert();
    };

    callbackFunction = (dat) => {



        this._isMounted = true

        const { tranItems } = this.state;

        // console.log("tranItemstranItems")
        // console.log(tranItems)

        var exist = "no";
        tranItems.map((itemex) => {
            if (itemex.item_id == dat.item_id) {
                exist = "yes";
            }
        })

        // if (this.state.priceOption == "pertain") {
        //     price = result[0].original_price;
        // }

        var message = "Item Added successfully!";

        var supplier;
        var supId;
        var item_status;
        var trans_id;

        tranItems.map((f, i) => {
            if (i === 0) {
                supplier = f.supplier;
                supId = f.supplier_id;
                item_status = f.item_status;
                trans_id = f.transaction_id;
            }
        });


        if (exist == "no") {
            var min = 100;
            var max = 999;
            var random = Math.floor(Math.random() * (+max - +min)) + +min;
            const newItem = {
                id: random,
                item_name: dat.item_name,
                quantity: dat.quantity,
                supplier: supplier,
                original_price: dat.original_price,
                unit_price: dat.srp,
                item_id: dat.item_id,
                item_status: item_status,
                supplier_id: supId,
                // transaction_id: trans_id,
                transaction_id: this.props.location.state.id,
                stat: "new",
            };
            // console.log("newItem")
            // console.log(newItem)
            const allItems = [newItem, ...this.state.tranItems];




            if (this._isMounted) {
                this.setState({
                    tranItems: allItems
                });
            }




        } else {
            message = "Item already exist!";
        }

        toast(message, {
            position: toast.POSITION.BOTTOM_RIGHT,
            className: 'foo-bar'
        });

    }
    // transaction/deactivate
    creditExist = (data) => {

        if (this._isMounted) {
            this.setState({
                crdexist: data
            });
        }

    }

    sendDeact = () => {
        const { tranItems, crdexist } = this.state;

        if (tranItems.length > 0 || crdexist == "yes") {
            if (tranItems.length > 0) {
                toast("Please clear/delete the items to return to its original balances before deactivation");
            }

            if (crdexist == "yes") {
                toast("Please uncredit first the supplier's credit before deactivation");
            }
        }
        else {
            Http.post('/api/v1/mod/transaction/deactivate', { trans_id: this.props.location.state.id })
                .then((response) => {
                    toast("Transaction Successfully deactivated")


                })
                .catch(() => {
                    toast("Error saving changes")
                    this.setState({ loading: false });
                });
        }

    }





    render() {

        const { path, type, code, imported, loading } = this.props.location.state;
        const { tranItems, temp, selected, deleted } = this.state;
        const total = (cell, row) => {
            return (
                <>
                    {row.original_price * row.quantity}
                </>
            );
        }

        const formatter = new Intl.NumberFormat('fil', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2
        })



        var overtotal = 0;
        tranItems.map((i) => (overtotal += parseFloat(i.original_price) * parseFloat(i.quantity)))

        const cellEditProp = {
            mode: 'dbclick',
            blurToSave: true,
            beforeSaveCell: this.onBeforeSaveCell, // a hook for before saving cell
            afterSaveCell: this.onAfterSaveCell  // a hook for after saving cell
        };

        // console.log(tranItems)
        // console.log("temp")
        // console.log(temp)

        const selectRowProp = {
            mode: 'checkbox',
            clickToSelect: true,
            onSelect: this.onRowSelect,
            onSelectAll: this.onSelectAll,
            columnWidth: '60px'
        };

        // console.log(tranItems)
        // console.log("deleted")
        // console.log(deleted)


        // const conts = {
        //     supplier: supplier,
        //     supId: supId,
        //     item_status: item_status,
        //     trans_id: trans_id,
        //     id: "new",
        // }


        return (
            <>
                <div className="contentTransactSales">

                    <ToastContainer limit={3} />

                    <Link to={{ pathname: path, state: { type: type, path: path, defCode: code } }}>
                        <Button icon labelPosition='left'><Icon name='angle left' /> Back to Tansaction view </Button>
                    </Link>
                    {tranItems.length == 0 ? <></> :
                        <>
                            <Button onClick={this.reset}>Reset</Button>
                            <Button onClick={this.deleteItems}>Delete selected items</Button>

                            <AddHistPurItm imported={imported} parentCallback={this.callbackFunction} />
                        </>
                    }

                    {this.state.deact_stat == "Deactivated" ? <></> :
                        <Button onClick={this.sendDeact}
                        //  disabled={this.state.crdexist == "yes" && tranItems.length > 0 ? true : false}
                        >Deactivate Transaction</Button>
                    }


                    <TransLog code={code} />


                    {/* <UpCreditToggle class="inline_block" style={{ float: "right" }} />  */}

                    <div class="inline_block" style={{ float: "right" }}>

                       { this.state.deact_stat == "Deactivated" ? <></> : <Button data-toggle="modal" color={imported == "yes" ? 'blue' : 'yellow'} data-target="#rs" >Save Changes</Button> }
                       </div>
                    <div class="modal fade" id="rs">
                        <div class="modal-dialog modal-xs">
                            <div class="modal-content">


                                <div class="modal-header">
                                    <h4 class="modal-title">Please state your reason for modifications</h4>
                                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                                </div>

                                {/* onClick={this.saveChanges} */}
                                <div class="modal-body">
                                    <small><i>*Take note that if you delete all items in this transaction,
                                        the transaction itself will also be deleted and other connected transactions (e.g Credit to supplier transaction)</i></small>
                                    <br />
                                    <br />
                                    <form
                                        data-amountdue={overtotal}
                                        method="post"
                                        onSubmit={this.saveChanges}
                                        ref={(el) => {
                                            this.addForm = el;
                                        }}
                                    >
                                        <textarea required class="form-control mb-5 mr-sm-5  " placeholder="Reason for changing" name="reason" onChange={this.handleChange} > </textarea>
                                        <Button type="submit" disabled={this.state.reason ? false : true} className={classNames(' ', {
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
                    <br/>
                    {this.state.deact_stat == "Deactivated" ?   <h1><b>TRANSACTION DEACTIVATED</b></h1> :  <></> }
                    


                    <br />
                    <br />
                    {/* <h2>{transaction[0].transaction_type}</h2> */}
                    {this.state.deact_stat == "Deactivated" ? <></> : <UpCreditToggle exist={this.getStatus} id={this.props.location.state.id} />}
                    <br />
                    <h2 class="inline_block"> {code} </h2><h2 style={{ float: "right" }} class="inline_block">{formatter.format(overtotal)}</h2>
                    <br />
                    <BootstrapTable
                        // ref='table'
                        data={tranItems}
                        pagination={true}
                        search
                        cellEdit={cellEditProp}
                        selectRow={selectRowProp}
                    // options={options} exportCSV
                    >
                        <TableHeaderColumn isKey={true} hidden width="100" dataField='id'>id</TableHeaderColumn>
                        <TableHeaderColumn editable={false} tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} dataField='item_name'>Item Name</TableHeaderColumn>
                        <TableHeaderColumn className="upTabStyle" width="100" dataField='quantity'>Quantity</TableHeaderColumn>
                        <TableHeaderColumn editable={false} hidden={true} width="120" dataField='beg_balance'>Beg Item Bal</TableHeaderColumn>
                        <TableHeaderColumn editable={false} hidden={true} width="120" dataField='end_bal'>End Item Bal</TableHeaderColumn>
                        <TableHeaderColumn editable={false} width="250" dataField='supplier'>Supplier</TableHeaderColumn>
                        <TableHeaderColumn className="upTabStyle" width="100" dataField='original_price'>Org.  Price</TableHeaderColumn>
                        <TableHeaderColumn editable={false} width="100" dataField='original_price' dataFormat={total}>Total</TableHeaderColumn>
                        <TableHeaderColumn editable={imported == "yes" ? true : false} className={imported == "yes" ? "upTabStyle" : " "} width="100" dataField='unit_price'>SRP</TableHeaderColumn>
                        <TableHeaderColumn editable={false} width="100" dataField='up_stat'>Update</TableHeaderColumn>
                    </BootstrapTable>


                    <br />
                    <Button onClick={this.setOpenDel}>Deleted Items</Button>
                  { this.state.openDelete == "yes" ? < DeletedItems id={this.props.location.state.id} /> : <></>}
                    {/* {this.state.message} */}
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

export default connect(mapStateToProps)(UpdateTransaction);
