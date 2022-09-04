import React, { Component, useRef } from 'react';
// import PrintHeader from './printHeader';
import Http from '../../Http';
import { connect } from 'react-redux';
import ReactToPrint from "react-to-print";
import { Dropdown, Icon, Button } from 'semantic-ui-react';
import PrintReportItem from '../prints/printReportItem';
import { Link } from 'react-router-dom';
import ReactHTMLTableToExcel from 'react-html-table-to-excel';
import { ToastContainer, toast } from 'react-toastify';
import classNames from 'classnames';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import update from 'immutability-helper';
class PrintReport extends Component {
    _isMounted = false
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            modItm: false,
            item_id: null,
            quantity: null,
            options: [],
            items: [],
            data: [],
            normal: "normal",
        }
    }

    componentDidMount() {
        this._isMounted = true
        Http.post(`/api/v1/reports/saleItems`, { id: this.props.id })
            .then((response) => {
                // const { data } = response.data.transaction.data;
                if (this._isMounted) {

                    this.setState({
                        data: response.data.items,

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
    getItems = () => {
        this._isMounted = true
        Http.post(`/api/v1/itemonly`)
            .then((response) => {

                if (this._isMounted) {

                    this.setState({
                        items: response.data.items,

                    });
                    console.log(response.data.items)
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



    submitModif = (e) => {

        if (confirm("Are you sure you want to update transaction item? This will affect to item branch balances and collectibles")) {

            if (this.props.trans_type == "Direct Sale") {

                this.submitItemDRSale()
            } else if (this.props.trans_type == "Charge") {
                this.submitItemCharge()
            }
        }

    }

    submitItemDRSale = () => {
        Http.post(`/api/v1/mod/transaction/sales/items`, { tranItems: JSON.stringify(this.state.data), })
            .then((response) => {
                toast("Transaction item successfully updated (Direct Sale)")
            })
            .catch((error) => {
                toast("Failed to update transaction item (Direct Sale)")
                console.log(error)
            });
    }

    submitItemCharge = () => {
        Http.post(`/api/v1/mod/transaction/sales/items/charge`, { tranItems: JSON.stringify(this.state.data), })
            .then((response) => {
                toast("Transaction item successfully updated (Charge)")
            })
            .catch((error) => {
                toast("Failed to update transaction item (Charge)")
                console.log(error)
            });
    }

    handleChange = (e) => {
        this._isMounted = true
        const { name, value } = e.target;
        if (this._isMounted) {
            this.setState({ [name]: value });
        }
    };
    enableModItem = (e) => {
        this._isMounted = true

        if (this._isMounted) {
            this.setState({ modItm: this.state.modItm == true ? false : true });
        }
    };

    onBeforeSaveCell(row, cellName, cellValue) {
        // You can do any validation on here for editing value,
        // return false for reject the editing
        if (confirm(`Are you sure you want to update ${row.item_name}?`)) {
            if (cellName == "quantity") {
                if (Number(cellValue) || cellValue == 0) {
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
        var updatedComment = update(data[commentIndex], { [cellName]: { $set: cellValue }, up_stat: { $set: "yes" } });
        var newData = update(data, {
            $splice: [[commentIndex, 1, updatedComment]]
        });
        if (this._isMounted) {
            this.setState({ data: newData });
        }
        console.log(newData)
        toast("Click save if you wish to save the modifications", {
            position: toast.POSITION.BOTTOM_RIGHT,
            className: 'foo-bar'
        });

        // alert('Thw whole row :\n' + rowStr);
    }

    onSearchChange = (e, value) => {
        const { items } = this.state;
        this._isMounted = true
        if (this._isMounted) {
            this.setState({ loading: true })
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
                this.setState({ options: result, loading: false })
            }

        }, 300);

    }

    myChangeHandlerItem = (e, { value }) => {
        if (this._isMounted) {
            this.setState({ item_id: value })
        }
    };

    submitNew = () => {

        const { item_id, quantity, data } = this.state;

        var exist = "no";
        data.map((itemex) => {
            if (itemex.item_id == item_id) {
                exist = "yes";
            }
        })

        console.log(data)

        if (exist == "yes") {
            toast("Item already exist")
        } else {

            if (confirm("Are you sure you want to add transaction item? This will affect to item branch balances and collectibles")) {


                const subs = {
                    item_id: item_id,
                    quantity: quantity,
                    trans_id: this.props.id
                }

                console.log(subs)

                if (this.props.trans_type == "Direct Sale") {

                    this.submitItemNew(subs)
                } else if (this.props.trans_type == "Charge") {
                    this.submitItemNewCharge(subs)
                }

            }
        }



    }

    submitItemNew = (subs) => {
        Http.post(`/api/v1/mod/transaction/sales/items/add`, subs)
            .then((response) => {
                toast("Transaction item successfully updated (Direct Sale)")
            })
            .catch((error) => {
                toast("Failed to update transaction items (Direct Sale)")
                console.log(error)
            });
    }

    submitItemNewCharge = (subs) => {
        Http.post(`/api/v1/mod/transaction/sales/items/add/charge`, subs)
            .then((response) => {
                toast("Transaction item successfully updated (Charge)")
            })
            .catch((error) => {
                toast("Failed to update transaction items (Charge)")
                console.log(error)
            });
    }





    handleChange = (e) => {
        const { name, value } = e.target;

        if (this.state.timeout) clearTimeout(this.state.timeout);
        this.state.timeout = setTimeout(() => {
            if (this._isMounted) {
                this.setState({ [name]: value });
            }
        }, 300);

    };

    allitems = () => {
        // const { trans_type } = this.props.location.state;
        const { items, options } = this.state;
        const opt = options.map((items) => ({ key: items.id, value: items.id, text: items.code.concat('\xa0\xa0\xa0\xa0', items.name, '-', items.brand) }));

        // const { loading } = this.state;
        const cellEditProp = {
            mode: 'dbclick',
            blurToSave: true,
            beforeSaveCell: this.onBeforeSaveCell, // a hook for before saving cell
            afterSaveCell: this.onAfterSaveCell  // a hook for after saving cell
        };

        const AddNew = () => {
            return (this.addNewItem())
        }
        return (
            <>
                <button onClick={this.enableModItem} className={classNames('btn btn-primary mb-2')}>Modify Items</button> &nbsp; &nbsp;
                <button data-backdrop="static" data-keyboard="false" className={classNames('btn btn-primary mb-2')} onClick={this.getItems} data-toggle="modal" data-target="#add">Add Item</button>
                <div class="modal fade" id="add" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div class="modal-dialog" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="exampleModalLabel">Add item to this transaction</h5>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body">
                                <Dropdown
                                    type="select"
                                    placeholder='Select item'
                                    fluid
                                    search
                                    selection
                                    clearable={true}
                                    options={opt}
                                    loading={this.state.loading}
                                    onChange={this.myChangeHandlerItem}
                                    onSearchChange={this.onSearchChange}

                                    id="addItem"
                                    name="item_id"
                                    required
                                />
                                <br />
                                <input type="number" placeholder="Quantity" name="quantity" class="form-control mb-2 mr-sm-2" onChange={this.handleChange} />
                            </div>
                            <div class="modal-footer">

                                <button type="button" class="btn btn-primary" onClick={this.submitNew}>Save changes</button>
                            </div>
                        </div>
                    </div>
                </div>
                <BootstrapTable
                    cellEdit={cellEditProp}
                    ref='table'
                    data={this.state.data}
                    pagination={true}
                    search={true}
                // options={options} exportCSV
                // deleteRow={true} selectRow={selectRowProp} options={options}
                >
                    <TableHeaderColumn editable={false} tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} dataField='id' hidden isKey={true}>Item Name</TableHeaderColumn>
                    <TableHeaderColumn editable={false} tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} dataField='item_name'>Item Name</TableHeaderColumn>
                    <TableHeaderColumn editable={this.state.modItm == true ? true : false} width="100" dataField='quantity'>Quantity</TableHeaderColumn>
                    <TableHeaderColumn editable={false} width="100" dataField='unit_price'>SRP</TableHeaderColumn>
                </BootstrapTable>

                <button style={{ float: "right" }} data-type={this.props.trans_type} onClick={this.submitModif} className={classNames('btn btn-primary mb-2')}>Save Modifications</button>
            </>
        )
    }


    render() {

        // const { type, code, id, path, trans_type } = this.props.location.state;
        // var path;
        // if (type == "Sale") {
        //     path = `/report/sales`;
        // }


        return (
            <>
                <ToastContainer />

                {this.allitems()}
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
