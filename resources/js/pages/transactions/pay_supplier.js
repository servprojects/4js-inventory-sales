import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../Http';
import classNames from 'classnames';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import { Dropdown } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import update from 'immutability-helper';
import AllCheques from '../reports/allCheques';
import CSVReader from 'react-csv-reader';
class PaySupplier extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);

        // Initial state.
        this.state = {
            loading: false,
            load: false,
            urgency_status: null,
            estimated_receiving_date: null,
            type: null,
            error: false,
            upId: null,
            branch_id: null,
            status: null,
            display_cheOpt: { display: "none" },
            pay_cheque: "no",
            date_transac: null,
            amount: null,
            receipt_id: null,
            cheque_code: null,
            payee: null,
            bank: null,
            supplier_id: null,
            chq_date: null,
            upIdItem: null,
            data: [],
            supplier: [],
            supplierCharges: [],
            tranItems: [],
            tranItems: [],
            selectedCharge: [],
            allCheque: [],
            imported: [],

        };

        // API endpoint.
        this.api = '/api/v1/request';
    }
    componentDidMount() {
        this._isMounted = true
        if (this._isMounted) { this.setState({ load: true }); };
        Http.get(`/api/v1/transaction/pay/supplier`)
            .then((response) => {
                // const { data } = response.data.requests;
                if (this._isMounted) {
                    // this.setState({
                    //     data,
                    //     // branch: response.data.branch.data,
                    //     error: false,
                    // });
                    this.setState({
                        supplier: response.data.supplier,
                        allCheque: response.data.cheques,
                        error: false,
                        load: false,
                    });



                }

            })

            .catch(() => {
                if (this._isMounted) {
                    this.setState({
                        error: 'Unable to fetch data.',
                        load: false,
                    });
                }
            });
    }
    // setUpId = (e) => {
    //     this._isMounted = true
    //     const { key, id } = e.target.dataset;
    //     // if (this._isMounted) {
    //     //   this.setState({ upIdItem: key })
    //     // }

    //     Http.post(`/api/v1/transaction/pay/supplier/charges/items`, { supplier_id: key, tr_id: id })
    //         .then((response) => {
    //             // const { data } = response.data.transaction.data;
    //             if (this._isMounted) {

    //                 this.setState({
    //                     tranItems: response.data.items,

    //                 });
    //             }
    //         })

    //         .catch(() => {
    //             if (this._isMounted) {
    //                 toast("Error getting items!")
    //                 this.setState({ loading: false });
    //             }
    //         });



    // };

    updateCheq = (property) => {
        property.preventDefault();

        if (confirm("Are you sure you want to update cheque? If already confirmed, changes will also take effect to transaction records and supplier credit balance")) {
            const { key } = property.target.dataset;
            const subs = {

                cheque_code: this.state.cheque_code,
                bank: this.state.bank,
                payee: this.state.payee,
                cheq_date: this.state.chq_date,
                supplier_id: this.state.supplier_id,
                cheq_amount: this.state.amount,
                id: key,
            }

            Http.post(`/api/v1/transaction/pay/uppdc`, subs)
                .then((response) => {
                    // const { data } = response.data.transaction.data;
                    if (this._isMounted) {
                        this.setState({
                            allCheque: response.data.updated,
                            cheque_code: null,
                            bank: null,
                            payee: null,
                            chq_date: null,
                            supplier_id: null,
                            amount: null,
                        });

                    }
                    toast("Cheque Updated successfully!")
                })
                .catch(() => {

                    toast("Error updating Cheque")
                });

        }

    };

    reset = (e) => {
        this._isMounted = true
        if (this._isMounted) {
            this.setState({ name: null, location: null });
        }

    };

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
            urgency_status: this.state.urgency_status,
            estimated_receiving_date: this.state.estimated_receiving_date,
            type: this.state.type,
            request_to: this.state.branch_id
        }
        if (this._isMounted) {
            this.setState({ loading: true });
        }
        this.addRequest(subs);
    };

    // addRequest = (request) => {
    //     this._isMounted = true
    //     Http.post(this.api, request)
    //         .then(({ data }) => {

    //             if (data.status === 155) {
    //                 toast("You cannot request transfer from your own branch.")
    //                 this.setState({ loading: false });
    //             } else {



    //                 const newItem = {
    //                     id: data.id,
    //                     code: data.code,
    //                     urgency_status: request.urgency_status,
    //                     estimated_receiving_date: request.estimated_receiving_date,
    //                     type: request.type,
    //                     request_status: data.status,
    //                 };
    //                 const allRequest = [newItem, ...this.state.data];
    //                 if (this._isMounted) {
    //                     this.setState({ data: allRequest, urgency_status: null, estimated_receiving_date: null, type: null, branch_id: null });
    //                 }
    //                 this.addForm.reset();
    //                 if (this._isMounted) {
    //                     this.setState({ loading: false });
    //                 }
    //                 toast("Request Added successfully!")

    //             }

    //         })
    //         .catch(() => {
    //             if (this._isMounted) {

    //                 toast("Error adding request!")
    //                 this.setState({ loading: false });
    //             }
    //         });
    // };

    submitPayment = (request) => {

        this._isMounted = true
        request.preventDefault();
        const { selectedCharge } = this.state;
        const subs = {
            pay_cheque: this.state.pay_cheque,
            cheque_code: this.state.cheque_code,
            bank: this.state.bank,
            payee: this.state.payee,
            date_transac: this.state.date_transac,
            supplier_id: this.state.supplier_id,
            amount: this.state.amount,
            receipt_code: this.state.receipt_id,
            items: JSON.stringify(selectedCharge)
        }
        Http.post(`/api/v1/transaction/pay/supplier`, subs)
            .then(({ data }) => {
                toast("Payment successful!")
                if (this._isMounted) {
                    this.setState({
                        supplierCharges: [],
                        supplier: data.supplier,
                        pay_cheque: "no",
                        date_transac: null,
                        amount: null,
                        receipt_id: null,
                        cheque_code: null,
                        payee: null,
                        bank: null,
                        supplier_id: null,
                        // selectedCharge: [],
                    });
                }

            })
            .catch(() => {
                if (this._isMounted) {

                    toast("Error adding payment")
                }
            });
    };

    submitPDC = (request) => {

        this._isMounted = true
        request.preventDefault();

        const subs = {

            cheque_code: this.state.cheque_code,
            bank: this.state.bank,
            payee: this.state.payee,
            cheq_date: this.state.chq_date,
            supplier_id: this.state.supplier_id,
            cheq_amount: this.state.amount,
        }
        Http.post(`/api/v1/transaction/pay/addpdc`, subs)
            .then((response) => {
                toast("Cheque added successful!")
                if (this._isMounted) {
                    this.setState({
                        allCheque: response.data.cheques,
                        cheque_code: null,
                        bank: null,
                        payee: null,
                        chq_date: null,
                        supplier_id: null,
                        amount: null,
                    });
                }
                this.addForm.reset();

            })
            .catch(() => {
                if (this._isMounted) {

                    toast("Error adding payment")
                }
            });
    };

    myChangeHandlersup = (e, { value }) => {
        if (this._isMounted) {
            this.setState({ supplier_id: value })
        }
    };

    addPay = (e) => {
        this._isMounted = true
        const { key, payable, code } = e.target.dataset;
        const { supplierCharges, selectedCharge, amount } = this.state;
        var totalPay;
        if (isNaN(parseInt(amount))) {
            totalPay = parseInt("0");
        } else {
            totalPay = parseInt(amount);
        }


        //    selectedCharge.map((brnch) => (totalPay += parseInt(brnch.total)));

        var exist = "no";
        selectedCharge.map((itemex) => {
            if (itemex.id == key) {
                exist = "yes";
            }
        })

        // var message = "Charge Added successfully!";
        if (exist == "no") {
            const newItem = {
                id: key,
                total: payable,
                code: code
            };
            const allItems = [newItem, ...this.state.selectedCharge];
            if (this._isMounted) {
                this.setState({ selectedCharge: allItems });
            }

            totalPay += parseInt(payable);



            // update icon
            var commentIndex = supplierCharges.findIndex(function (c) {
                return c.t_id == key;
            });

            var updatedComment = update(supplierCharges[commentIndex], { icon: { $set: "minus icon" } });

            var newData = update(supplierCharges, {
                $splice: [[commentIndex, 1, updatedComment]]
            });
            if (this._isMounted) {
                this.setState({ supplierCharges: newData, amount: totalPay });
            }






        } else {


            const { selectedCharge: itm } = this.state;
            const index = itm.findIndex(
                (item) => parseInt(item.id, 10) === parseInt(key, 10),
            );
            const remove = [...itm.slice(0, index), ...itm.slice(index + 1)];
            if (this._isMounted) {
                this.setState({ selectedCharge: remove });
            }

            totalPay -= parseInt(payable);

            // update icon
            var commentIndex = supplierCharges.findIndex(function (c) {
                return c.t_id == key;
            });

            var updatedComment = update(supplierCharges[commentIndex], { icon: { $set: "plus icon" } });

            var newData = update(supplierCharges, {
                $splice: [[commentIndex, 1, updatedComment]]
            });
            if (this._isMounted) {
                this.setState({ supplierCharges: newData, amount: totalPay });
            }



        }
    }
    buttonFormatterSelect = (cell, row) => {

        return (
            <div>
                <i class={row.icon} onClick={this.addPay} data-key={row.t_id} data-code={row.code} data-payable={row.total} ></i>
            </div>
        )
    }
    // buttonFormatterItem = (cell, row) => {
    //     const { tranItems } = this.state;
    //     const idqh = "#idiq" + row.t_id;
    //     const idq = "idiq" + row.t_id;
    //     return (
    //         <div>
    //             <a href="#" data-toggle="modal" data-key={row.supplier_id} data-id={row.t_id} onClick={this.setUpId} data-target={idqh}>{row.total_items}</a>

    //             <div class="modal fade" id={idq}>
    //                 <div class="modal-dialog modal-lg">
    //                     <div class="modal-content">


    //                         <div class="modal-header">
    //                             <button type="button" class="close" data-dismiss="modal">&times;</button>

    //                         </div>


    //                         <div class="modal-body">
    //                             {row.code}

    //                             <BootstrapTable
    //                                 ref='table'
    //                                 data={tranItems}
    //                                 pagination={true}
    //                                 search={true}
    //                             // options={options} exportCSV
    //                             >
    //                                 <TableHeaderColumn tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} dataField='item_name' isKey={true}>Item Name</TableHeaderColumn>
    //                                 <TableHeaderColumn dataField='quantity'>Quantity</TableHeaderColumn>
    //                                 <TableHeaderColumn dataField='beg_balance'>Beginning Balance</TableHeaderColumn>
    //                                 <TableHeaderColumn dataField='end_bal'>Ending Balance</TableHeaderColumn>
    //                                 <TableHeaderColumn dataField='original_price'>Price</TableHeaderColumn>
    //                             </BootstrapTable>
    //                         </div>


    //                         <div class="modal-footer">
    //                             <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
    //                         </div>

    //                     </div>
    //                 </div>
    //             </div>
    //         </div>
    //     )
    // }
    optPay = (item) => {
        this._isMounted = true
        if (this._isMounted) {

            if (this.state.pay_cheque == "no") {
                this.setState({
                    pay_cheque: "yes",
                    display_cheOpt: { display: "block" }

                    // checked: props.checked || true
                });
            } else {
                this.setState({
                    pay_cheque: "no",
                    display_cheOpt: { display: "none" }
                    // checked: props.checked || false
                });
            }
        }
    }
    getSupCharge = (e, { value }) => {
        this._isMounted = true

        if (this._isMounted) {
            this.setState({ supplier_id: value })
        }
        // Http.post(`/api/v1/transaction/pay/supplier/charges`, { supplier_id: value })
        //     .then(({ data }) => {
        //         if (this._isMounted) {
        //             this.setState({
        //                 // selectedCharge: [],
        //                 supplierCharges: data.transaction,
        //             });
        //         }
        //     })
        //     .catch(() => {
        //         toast("Failed to get data")
        //     });


    };
    deleteChq = (e) => {
        this._isMounted = true
        const { key } = e.target.dataset;
        const { allCheque: brnc } = this.state;
        //  const brnc = this.props.data;

        if (confirm("Confirm delete")) {


            Http.delete(`/api/v1/transaction/pay/supplier/${key}`,)
                .then((response) => {
                    if (response.status === 204) {
                        const index = brnc.findIndex(
                            (branch) => parseInt(branch.id, 10) === parseInt(key, 10),
                        );
                        const update = [...brnc.slice(0, index), ...brnc.slice(index + 1)];
                        if (this._isMounted) {
                            this.setState({ allCheque: update });
                        }
                    }
                    toast("Cheque deleted successfully!")
                })
                .catch((error) => {
                    console.log(error);
                    toast("Error deleting Cheque")
                });

        }

    };
    handleExportCSVButtonClick = (onClick) => {
        onClick();
    }
    createCustomExportCSVButton = (onClick) => {
        return (
            <div>
                <ExportCSVButton
                    btnText=' '
                    onClick={() => this.handleExportCSVButtonClick(onClick)} />
              &nbsp; &nbsp; &nbsp; &nbsp;
                <button class="ui button" tabindex="0" data-toggle="modal" data-target="#myModal">
                    Add New PDC
              </button>


            </div>
        );
    }
    createPDC = (onClick) => {
        return (
            <button class="ui primary button">
                Save
            </button>
        );
    }


    confpay = (e) => {
        this._isMounted = true

        const { key } = e.target.dataset;
        const { allCheque } = this.state;

        if (confirm("You are about to confirm your cheque payment. The cheque amount will be deducted to suppliers credit balance.")) {
            if (this._isMounted) { this.setState({ load: true }); };
            Http.post(`/api/v1/transaction/pay/supplier/confirmation`, { id: key })
                .then(({ data }) => {
                    if (this._isMounted) {

                        // update icon
                        var commentIndex = allCheque.findIndex(function (c) {
                            return c.id == key;
                        });

                        var updatedComment = update(allCheque[commentIndex], { status: { $set: "Confirmed" } });

                        var newData = update(allCheque, {
                            $splice: [[commentIndex, 1, updatedComment]]
                        });
                        if (this._isMounted) {
                            this.setState({ allCheque: newData, load: false });
                        }
                    }
                    toast("Payment confirmation successful")
                })
                .catch(() => {
                    if (this._isMounted) { this.setState({ load: false }); };
                    toast("Error confirming payment")
                });
        }


    }

    btnFormatterEdit = (cell, row) => {
        const { supplier, loading } = this.state;
        const sups = supplier.map((brnch) => ({ key: brnch.id, value: brnch.id, text: brnch.name }));
        const idh = "#id" + row.id;
        const id = "id" + row.id;

        var dis = { display: "block" };
        if (row.status == "Confirmed") {
            dis = { display: "none" };
        }
        return (
            <>
                {/* <div style={dis}> */}
                {/* onClick={this.displayQty} */}
                {/* onClick={this.deleteReq} */}
                <i data-key={row.id} class="pencil alternate icon" data-toggle="modal" data-target={idh} data-backdrop="static" data-keyboard="false"></i>
                {
                    row.status == "Confirmed" ? <></> :
                        <i class="trash alternate icon" data-key={row.id} onClick={this.deleteChq} ></i>}
                {/* </div> */}


                <div class="modal fade" id={"id" + row.id}>
                    <div class="modal-dialog">
                        <div class="modal-content">


                            <div class="modal-header">
                                <h4 class="modal-title">{row.code}</h4>
                                <button type="button" class="close" data-dismiss="modal">&times;</button>
                            </div>
                            <div class="modal-body">

                                <form

                                    data-key={row.id}
                                    onSubmit={this.updateCheq}
                                    ref={(el) => {
                                        this.updateForm = el;
                                    }}
                                >

                                    <label >Supplier</label><br />
                                    <Dropdown disabled={row.status == "Confirmed" ? true : false} type="select" placeholder={row.supplier} fluid search selection balance
                                        onChange={this.getSupCharge}
                                        options={sups}
                                        class="form-control form-control-lg "
                                        required
                                    />

                                    <label >Cheque Date</label><br />
                                    <input required type="date" defaultValue={row.date} name="chq_date" class="form-control mb-2 mr-sm-2" onChange={this.handleChange} />

                                    <label >Amount</label><br />
                                    <input required type="number" name="amount" defaultValue={row.amount} class="form-control mb-2 mr-sm-2" onChange={this.handleChange} />


                                    <label >Code</label><br />
                                    <input required type="text" name="cheque_code" defaultValue={row.code} class="form-control mb-2 mr-sm-2" onChange={this.handleChange} />
                                    <label >Payee</label><br />
                                    <input required type="text" name="payee" defaultValue={row.payee} class="form-control mb-2 mr-sm-2" onChange={this.handleChange} />
                                    <label >Bank</label><br />
                                    <input required type="text" name="bank" defaultValue={row.bank} class="form-control mb-2 mr-sm-2" onChange={this.handleChange} />

                                    <br />
                                    <button type="submit" className={classNames('btn btn-primary mb-2', {
                                        'btn-loading': loading,
                                    })} >Submit</button>

                                </form>
                            </div>
                        </div>
                    </div>
                </div>




            </>
        );
    }

    btnFormatterConfirm = (cell, row) => {
        // var today = new Date();
        // var dd = String(today.getDate()).padStart(2, '0');
        // var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        // var yyyy = String(today.getFullYear());
        // const date = yyyy + "-" + mm + "-" +dd;
        var dis = { display: "block" };
        if (row.status == "Confirmed") {
            dis = { display: "none" };
        }
        return (
            <div>
                <button style={dis} class="ui button" data-key={row.id} onClick={this.confpay}>
                    Confirm Payment
            </button>

            </div>
        );
    }
    // import


    buttonFormatterDel = (cell, row) => {

        return (<i class="trash icon" onClick={this.impdel} data-key={row.id}></i>)
    }
    impdel = (e) => {
        this._isMounted = true
        const { key } = e.target.dataset;
        const { imported: pos } = this.state;


        if (confirm(`Are you sure you want to delete ${key}?`)) {
            const index = pos.findIndex(
                (item) => parseInt(item.id, 10) === parseInt(key, 10),
            );
            const update = [...pos.slice(0, index), ...pos.slice(index + 1)];
            if (this._isMounted) {
                this.setState({ imported: update });

            }

            toast("Transaction deleted successfully!")
        }
    };
    onBeforeSaveCell(row, cellName, cellValue) {
        // You can do any validation on here for editing value,
        // return false for reject the editing
        if (confirm(`Are you sure you want to update ${row.name}?`)) {
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
    onAfterSaveCell = (row, cellName, cellValue) => {
        // alert(`Save cell ${cellName} with value ${cellValue} ${row.id} `);
        const { imported } = this.state;
        // let rowStr = '';
        // for (const prop in row) {
        //   rowStr += prop + ': ' + row[prop] + '\n';
        // }

        var commentIndex = imported.findIndex(function (c) {
            return c.id == row.id;
        });
        var updatedComment = update(imported[commentIndex], { [cellName]: { $set: cellValue } });
        var newData = update(imported, {
            $splice: [[commentIndex, 1, updatedComment]]
        });
        if (this._isMounted) {
            this.setState({ imported: newData });
        }

        toast("Transaction successfully updated", {
            position: toast.POSITION.BOTTOM_RIGHT,
            className: 'foo-bar'
        });

        // alert('Thw whole row :\n' + rowStr);
    }
    submitImport = (e) => {
        this._isMounted = true
        if (confirm(`Are you sure you want to insert data?`)) {
            Http.post(`/api/v1/transaction/pay/import`, { items: JSON.stringify(this.state.imported) })//last stop here no API YET
                .then(({ data }) => {

                    if (this._isMounted) {
                        this.setState({
                            imported: [],
                            // data: data.updated,
                            // error: false,
                        });

                    }
                    toast("PDC imported successfully!")

                })
                .catch(() => {

                    toast("Error importing items")
                });

        }
    }

    // import
    render() {
        const { supplier, imported, data, error, loading, supplierCharges, selectedCharge, allCheque, load } = this.state;
        // const {  data, error, loading } = this.state;
        const pill_form = { textAlign: "center", paddingLeft: "30%", };
        const up_form = { paddingLeft: "28%", width: "100%", };
        const up_input = { width: "100%", };
        const req_tab = { width: "100%", };
        const req_list = { width: "80%", float: "right" };
        const req_inpt = { width: "100%", };
        const addBtn = { float: "right", };
        const label = { float: "left", };
        const chqOpt = this.state.display_cheOpt;
        var totalPay = 0;

        selectedCharge.map((brnch) => (totalPay += parseInt(brnch.total)));
        const sups = supplier.map((brnch) => ({ key: brnch.id, value: brnch.id, text: brnch.name }));
        const formatter = new Intl.NumberFormat('fil', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2
        })
        const columnHover = (cell, row, enumObject, rowIndex) => {
            return cell
        }
        const options = {
            exportCSVBtn: this.createCustomExportCSVButton,
            addCheque: this.createPDC
        };
        const cellEditProp = {
            mode: 'dbclick',
            blurToSave: true,
            beforeSaveCell: this.onBeforeSaveCell, // a hook for before saving cell
            afterSaveCell: this.onAfterSaveCell  // a hook for after saving cell
        };

        return (
            <div>
                <div className={classNames('ui  inverted dimmer loads', {
                    'active': load,
                })} >
                    <center>
                        <div class="ui text loader">Loading</div>
                    </center>
                </div>

                <div className="contentCheque">
                    <nav aria-label="breadcrumb">
                        <ol class="breadcrumb">
                            <li class="breadcrumb-item active" aria-current="page">Pay Supplier</li>
                        </ol>
                    </nav>
                    <ToastContainer />
                    {/* {this.state.urgency_status}
                {this.state.estimated_receiving_date}
                {this.state.type} */}
                    {/* {this.state.branch_id} */}
                    {/* {this.state.amount} */}
                    <div class="leftcolumn">
                        {/* {this.state.supplier_id}<br/>
                    {this.state.pay_cheque}<br/>
                    {this.state.date_transac}<br/>
                    {this.state.amount}<br/>
                    {this.state.receipt_id}<br/>
                    {this.state.cheque_code}<br/>
                    {this.state.payee}<br/>
                    {this.state.bank}<br/> */}


                        {/* <center>  <h3>Transaction Details</h3> </center>
                    <br />
                     */}




                    </div>


                    <div>
                        <div class="inline_block">
                            <Link to="/ChqSuppliers"> <button class="ui primary button">
                                All Suppliers
                            </button> </Link>
                        </div>
                        <div class="inline_block" >
                            <button type="button" class="ui primary button" data-toggle="modal" data-target="#imp">
                                Import Payments
                            </button>
                        </div>
                        <div class="modal fade" id="imp">
                            <div class="modal-dialog modal-xxl">
                                <div class="modal-content">


                                    <div class="modal-header">
                                        <h4 class="modal-title">Import historical Payments</h4>
                                        {/* <br /> */}

                                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                                    </div>


                                    <div class="modal-body">
                                        {/* <i style={{ color: "red" }}>Important Reminders</i><br />
                                        <i>*import supplier are for those suppliers that do not exist yet in the system. If you want to update a supplier please use the update
                                    " <i class='fas icons'>&#xf304;</i>" icon of an item inside utilities/supplier
                                        </i> */}
                                        <div class="inline_block" style={{ float: "right" }}>
                                            <a href='/templates/pdc_template.csv' download>Download template here</a><br />
                                            <small>*Don't change the headings of the template</small>
                                        </div>

                                        <form>
                                            <div class="custom-file">
                                                <CSVReader
                                                    parserOptions={{ header: true }}
                                                    onFileLoaded={(dataf, fileInfof) => {
                                                        this._isMounted = true
                                                        if (this._isMounted) {
                                                            this.setState({
                                                                imported: dataf
                                                            });
                                                        }
                                                        console.dir(JSON.stringify(dataf))
                                                        // console.dir(dataf)
                                                    }


                                                    }
                                                    cssClass="custom-file-input"
                                                />
                                                <label class="custom-file-label" for="customFile">Choose file</label>
                                            </div>
                                        </form>

                                        <br />
                                        <BootstrapTable
                                            ref='table'
                                            data={imported}
                                            pagination={true}
                                            search={true}
                                            cellEdit={cellEditProp}
                                        // deleteRow={true} selectRow={selectRowProp} options={options}
                                        >
                                            <TableHeaderColumn dataField='id' width="30" dataFormat={this.buttonFormatterDel}  ></TableHeaderColumn>
                                            <TableHeaderColumn dataField='id' hidden={true} width="30" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} isKey={true}>id</TableHeaderColumn>
                                            <TableHeaderColumn dataField='cheque_code' width="200" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Cheque Code</TableHeaderColumn>
                                            <TableHeaderColumn dataField='bank' width="100" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Bank</TableHeaderColumn>
                                            <TableHeaderColumn dataField='payee' tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Payee</TableHeaderColumn>
                                            <TableHeaderColumn dataField='cheq_date' width="150" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Cheque Date</TableHeaderColumn>
                                            <TableHeaderColumn dataField='supplier' width="200" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }}  >Supplier</TableHeaderColumn>
                                            <TableHeaderColumn dataField='amount' width="100" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }}  >Amount</TableHeaderColumn>
                                            <TableHeaderColumn dataField='status' width="80" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Status</TableHeaderColumn>
                                            <TableHeaderColumn dataField='date_paid' width="110" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Date Paid</TableHeaderColumn>



                                        </BootstrapTable>
                                        <br />
                                        <button type="button" class="btn btn-primary" onClick={this.submitImport}>Import</button>
                                    </div>


                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                                    </div>

                                </div>
                            </div>
                        </div>

                    </div>

                    <br /><br />

                    {/* <AllCheques
                    data={this.state.allCheque}
                /> */}
                    <BootstrapTable
                        ref='table'
                        data={allCheque}
                        pagination={true}
                        search={true}
                        options={options} exportCSV
                    >
                        <TableHeaderColumn dataField='id' isKey={true} hidden={true}></TableHeaderColumn>
                        <TableHeaderColumn dataField='code'>Code</TableHeaderColumn>
                        <TableHeaderColumn dataField='supplier' >Supplier</TableHeaderColumn>
                        <TableHeaderColumn dataField='payee' >Account Name</TableHeaderColumn>
                        <TableHeaderColumn dataField='date' >Cheque Date</TableHeaderColumn>
                        <TableHeaderColumn dataField='amount'>Amount</TableHeaderColumn>
                        <TableHeaderColumn dataField='bank'>Bank</TableHeaderColumn>
                        <TableHeaderColumn dataField='status'>Status</TableHeaderColumn>
                        <TableHeaderColumn dataField='id' width="60" dataFormat={this.btnFormatterEdit}></TableHeaderColumn>
                        <TableHeaderColumn dataField='id' width="180" dataFormat={this.btnFormatterConfirm}></TableHeaderColumn>
                    </BootstrapTable>
                    <div class="modal fade" id="myModal">
                        <div class="modal-dialog">
                            <div class="modal-content">


                                <div class="modal-header">
                                    <h4 class="modal-title">Add New Post Dated Cheque</h4>
                                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                                </div>
                                <div class="modal-body">
                                    <form class="form-inline"
                                        // method="post"

                                        onSubmit={this.submitPDC}
                                        ref={(el) => {
                                            this.addForm = el;
                                        }}
                                    >
                                        <table style={req_tab}>
                                            <tr>
                                                <td>
                                                    <center>
                                                        <label style={label}>Supplier</label><br />
                                                        <Dropdown type="select" placeholder='Select supplier' fluid search selection balance
                                                            onChange={this.getSupCharge}
                                                            options={sups}
                                                            class="form-control form-control-lg "
                                                            required
                                                        />
                                                    </center>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <center>
                                                        <label style={label}>Cheque Date</label><br />
                                                        <input required data-total={totalPay} type="date" name="chq_date" class="form-control mb-2 mr-sm-2" style={req_inpt} onChange={this.handleChange} />
                                                    </center>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <center>
                                                        <label style={label}>Amount</label><br />
                                                        <input required type="number" name="amount" class="form-control mb-2 mr-sm-2" style={req_inpt} onChange={this.handleChange} />

                                                    </center>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <label style={label}>Code</label><br />
                                                    <input required type="text" name="cheque_code" class="form-control mb-2 mr-sm-2" style={req_inpt} onChange={this.handleChange} />
                                                    <label style={label}>Payee</label><br />
                                                    <input required type="text" name="payee" class="form-control mb-2 mr-sm-2" style={req_inpt} onChange={this.handleChange} />
                                                    <label style={label}>Bank</label><br />
                                                    <input required type="text" name="bank" class="form-control mb-2 mr-sm-2" style={req_inpt} onChange={this.handleChange} />
                                                </td>
                                            </tr>
                                            <tr>
                                                <td >
                                                    <br />
                                                    <button type="submit" style={addBtn} className={classNames('btn btn-primary mb-2', {
                                                        'btn-loading': loading,
                                                    })} >Submit</button>
                                                </td>
                                            </tr>
                                        </table>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* {allCheque.map((item) => (
                        <div class="modal fade" id={"id" + item.id}>
                            <div class="modal-dialog">
                                <div class="modal-content">


                                    <div class="modal-header">
                                        <h4 class="modal-title">{item.code}</h4>
                                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                                    </div>
                                    <div class="modal-body">
                                        
                                        <form class="form-inline"
                                            
                                            data-key={item.id}
                                            onSubmit={this.updateCheq}
                                            ref={(el) => {
                                                this.updateForm = el;
                                            }}
                                        >
                                            <table style={req_tab}>
                                                <tr>
                                                    <td>
                                                        <center>
                                                            <label style={label}>Supplier</label><br />
                                                            <Dropdown type="select" placeholder={item.supplier} fluid search selection balance
                                                                onChange={this.getSupCharge}
                                                                options={sups}
                                                                class="form-control form-control-lg "
                                                                required
                                                            />
                                                        </center>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <center>
                                                            <label style={label}>Cheque Date</label><br />
                                                            <input required data-total={totalPay} type="date" defaultValue={item.date} name="chq_date" class="form-control mb-2 mr-sm-2" style={req_inpt} onChange={this.handleChange} />
                                                        </center>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <center>
                                                            <label style={label}>Amount</label><br />
                                                            <input required type="number" name="amount" defaultValue={item.amount} class="form-control mb-2 mr-sm-2" style={req_inpt} onChange={this.handleChange} />

                                                        </center>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <label style={label}>Code</label><br />
                                                        <input required type="text" name="cheque_code" defaultValue={item.code} class="form-control mb-2 mr-sm-2" style={req_inpt} onChange={this.handleChange} />
                                                        <label style={label}>Payee</label><br />
                                                        <input required type="text" name="payee" defaultValue={item.payee} class="form-control mb-2 mr-sm-2" style={req_inpt} onChange={this.handleChange} />
                                                        <label style={label}>Bank</label><br />
                                                        <input required type="text" name="bank" defaultValue={item.bank} class="form-control mb-2 mr-sm-2" style={req_inpt} onChange={this.handleChange} />
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td >
                                                        <br />
                                                        <button type="submit" style={addBtn} className={classNames('btn btn-primary mb-2', {
                                                            'btn-loading': loading,
                                                        })} >Submit</button>
                                                    </td>
                                                </tr>
                                            </table>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))} */}

                </div >
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    isAuthenticated: state.Auth.isAuthenticated,
    user: state.Auth.user,
});

export default connect(mapStateToProps)(PaySupplier);
