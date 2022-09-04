import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../Http';
import classNames from 'classnames';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Dropdown } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import update from 'immutability-helper';
import { Link } from 'react-router-dom';
import { Button } from 'semantic-ui-react';

class HistoricalRNRExisting extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);

        // Initial state.
        this.state = {
            timeout: 0,
            loading: false,
            priceOption: "pertain",
            item_id: null,
            sup_id: "1",
            original_price: null,
            srp: null,
            quantity: null,
            date_received: null,
            edit_qty: { display: "none" },
            isedit_qty: "no",
            for_payment: "no",
            sup_name: "Not Specified",
            dis_orgprice: { display: "none" },

            new_name: null,
            new_size: null,
            unit_id: null,
            cat_id: "1",
            brand_id: "1",
            sup_id: "1",
            unit_id: null,

            items: [],
            supplier: [],
            selectedItems: [],
            brand: [],
            itemcat: [],
            supplier: [],
            unit: [],
            options: []
        };

    }
    componentDidMount() {
        this._isMounted = true

        Http.get(`/api/v1/transaction/receive/purchase/noreqexisting`)
            .then((response) => {
                // const { data } = response.data;
                if (this._isMounted) {
                    this.setState({
                        items: response.data.items,
                        supplier: response.data.supplier,
                        itemcat: response.data.itemcat,
                        supplier: response.data.supplier,
                        unit: response.data.unit,
                        brand: response.data.brand,
                        // options: response.data.items.map((items) => ({ key: items.id, value: items.id, text: items.name.concat('\xa0\xa0\xa0\xa0\xa0\xa0\xa0', ' (', items.size, items.unit, ') -  ', items.brand) }))
                    });
                    // const sups = [];
                    // sups = response.data.supplier;
                    // var result =  sups.filter(function (v) {
                    //   return v.id == this.state.sup_id;
                    // })
                    // this.setState({
                    //   sup_name: result[0].name,

                    // });

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

    displayQty = (e) => {
        this._isMounted = true
        if (this._isMounted) {

            if (this.state.isedit_qty == "yes") {
                this.setState({ edit_qty: { display: "none" }, isedit_qty: "no" });
            } else {
                this.setState({ edit_qty: { display: "block" }, isedit_qty: "yes" });
            }
        }
    };
    buttonFormatter = (cell, row) => {
        const dis = this.state.edit_qty;
        return (

            <div>
                {/* <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#exampleModal"  data-key={row.id}> */}
                <i onClick={this.deleteItem} data-key={row.item_id} class="minus square icon"></i>
                <i data-key={row.id}
                    // onClick={this.displayQty} 
                    class="pencil alternate icon" data-toggle="modal" data-target={"#m" + row.item_id}></i>
                {/* <div>
                    <input type="number" style={dis} data-key={row.item_id} data-price={row.original_price} onChange={this.updateQty} class="form-control form-control-lg qtyInpt" name="itm_qty" required placeholder="Qty" />
                </div> */}

                {/* </button> */}

                <div class="modal fade" id={"m" + row.item_id}>
                    <div class="modal-dialog modal-sm">
                        <div class="modal-content">


                            <div class="modal-header">

                                <button type="button" class="close" data-dismiss="modal">&times;</button>
                            </div>


                            <div class="modal-body">
                                <label> Quantity</label>
                                <input type="number" name="quantity" defaultValue={row.quantity} data-key={row.item_id} data-price={row.original_price} class="form-control mb-2 mr-sm-2" onChange={this.updateItem} />
                                <label> Original Price </label>
                                <input type="number" name="original_price" defaultValue={row.original_price} data-key={row.item_id} data-qty={row.quantity} class="form-control mb-2 mr-sm-2" onChange={this.updateItem} />
                                <label> SRP </label>
                                <input type="number" name="srp" defaultValue={row.srp} data-key={row.item_id} class="form-control mb-2 mr-sm-2" onChange={this.updateItem} />
                            </div>




                        </div>
                    </div>
                </div>


            </div>
        )
    }
    handleSubmit = (e) => {
        this._isMounted = true
        e.preventDefault();
        const subs = {
            name: this.state.new_name,
            brand_id: this.state.brand_id,
            size: this.state.new_size,
            category_id: this.state.cat_id,
            original_price: this.state.original_price,
            unit: this.state.unit_id,
            // unit_price: this.state.unit_price
        }
        if (this._isMounted) {
            this.setState({ loading: true });
        }
        this.addnewItem(subs);
    };
    addnewItem = (item) => {
        this._isMounted = true
        Http.post(`/api/v1/item`, item)
            .then((response) => {
                // items items: response.data.items,
                if (this._isMounted) {
                    this.setState({
                        items: response.data.items,
                        original_price: null,
                        new_name: null,
                        new_size: null,
                        unit_id: null,
                        cat_id: "1",
                        brand_id: "1",
                        sup_id: "1",
                        unit_id: null,
                    });
                }
                this.addnewForm.reset();

                toast("Item added successfully!")
            })
            .catch(() => {
                if (this._isMounted) {
                    this.setState({
                        error: 'Sorry, there was an error saving your to do.',
                    });
                    toast("Error adding item!")
                    this.setState({ loading: false });
                }
            });
    };
    handleChange = (e) => {
        const { name, value } = e.target;

        if (this.state.timeout) clearTimeout(this.state.timeout);
        this.state.timeout = setTimeout(() => {

            if (this._isMounted) {
                this.setState({ [name]: value });
            }

        }, 300);
    };
    myChangeHandlerItem = (e, { value }) => {
        if (this._isMounted) {
            this.setState({ item_id: value })
        }
    };
    myChangeHandlerSup = (e, { value }) => {
        if (this._isMounted) {
            const { supplier } = this.state;
            var resultSup = supplier.filter(function (v) {
                return v.id == value;
            })
            this.setState({ sup_id: value, sup_name: resultSup[0].name })
        }
    };
    myChangeHandlerUnit = (e, { value }) => {
        if (this._isMounted) {
            this.setState({ unit_id: value })
        }
    };
    myChangeHandlerCat = (e, { value }) => {
        //  const { itemcat } = this.state;
        // var result = itemcat.filter(function (v) {
        //   return v.id == value;
        // })
        if (this._isMounted) {
            this.setState({
                cat_id: value,
                // cat_name: result[0].name 
            })
        }
    };
    myChangeHandlerBrand = (e, { value }) => {
        //  const { brand } = this.state;
        // var result = brand.filter(function (v) {
        //   return v.id == value;
        // })
        if (this._isMounted) {
            this.setState({
                brand_id: value,
                // brand_name: result[0].name 
            })
        }
    };
    handleAddItem = (e) => {
        this._isMounted = true
        e.preventDefault();
        const subs = {
            item_id: this.state.item_id,
            sup_id: this.state.sup_id,
            name: "hello",
            unit_price: "89",
            //   Quantity: this.state.qty
        }

        this.addItem(subs);
    };

    addItem = (item) => {
        this._isMounted = true

        const { items, supplier, selectedItems } = this.state;

        var result = items.filter(function (v) {
            return v.id == item.item_id;
        })
        var resultSup = supplier.filter(function (v) {
            return v.id == item.sup_id;
        })

        var exist = "no";
        selectedItems.map((itemex) => {
            if (itemex.item_id == this.state.item_id) {
                exist = "yes";
            }
        })
        var price = this.state.original_price;
        // if (this.state.priceOption == "pertain") {
        //     price = result[0].original_price;
        // }

        var message = "Item Added successfully!";

        if (this.state.for_payment == "yes" && this.state.sup_id == "1") {
            message = "Please select proper supplier";
        } else {

            if (exist == "no") {
                if (this.state.quantity) {
                    const newItem = {
                        item_id: this.state.item_id,
                        sup_id: this.state.sup_id,
                        priceOption: this.state.priceOption,
                        name: result[0].name,
                        sup_name: resultSup[0].name,
                        original_price: price,
                        quantity: this.state.quantity,
                        total: this.state.quantity * price,
                        for_payment: this.state.for_payment,
                        srp: this.state.srp,
                    };
                    const allItems = [newItem, ...this.state.selectedItems];

                    var sid = this.state.sup_id;
                    var fp = this.state.for_payment;
                    allItems.map(function (x) {
                        x.sup_id = sid;
                        x.sup_name = resultSup[0].name;
                        x.for_payment = fp;
                        return x
                    });


                    if (this._isMounted) {
                        this.setState({
                            selectedItems: allItems, item_id: null,
                            //  sup_id: "1", 
                            original_price: null, quantity: null,
                            sup_name: resultSup[0].name
                            // priceOption: "pertain",
                            // for_payment: "no",
                        });
                    }


                    this.addForm.reset();
                }
            } else {
                message = "Item already exist!";
            }
        }
        toast(message, {
            position: toast.POSITION.BOTTOM_RIGHT,
            className: 'foo-bar'
        });

    };


    SubmitAll = (e) => {
        this._isMounted = true
        const { selectedItems } = this.state;
        // e.preventDefault();

        const subs = {

            supplier_id: this.state.sup_id,
            for_payment: this.state.for_payment,
            date_transac: this.state.date_received,
            items: JSON.stringify(selectedItems)

        }

        if (selectedItems === undefined || selectedItems.length == 0) {
            toast("TRANSACTION EMPTY")
        } else {

            if (this.state.date_received) {
                // console.log(subs)
                if (confirm("Are you sure you want to record historical purchases? This will not affect to all system balances including Items and Suppliers since this is just a historical purchase for references ")) {
                    this.addSales(subs);
                }
            } else {
                toast("EMPTY DATE RECEIVED")
            }




        }



    };

    addSales = (subs) => {
        this._isMounted = true
        Http.post(`/api/v1/transaction/receiving/historical`, subs)
            .then(({ data }) => {

                if (this._isMounted) {
                    this.setState({
                        priceOption: "pertain",
                        item_id: null,
                        sup_id: null,
                        original_price: null,
                        quantity: null,
                        date_received: null,
                        selectedItems: [],

                    });

                }
                this.addForm.reset();
                toast("TRANSACTION COMPLETE");
            })
            .catch(() => {

                toast("TRANSACTION FAILED")

            });
    };
    deleteItem = (e) => {
        this._isMounted = true
        const { key } = e.target.dataset;
        const { selectedItems: itm } = this.state;


        const index = itm.findIndex(
            (item) => parseInt(item.item_id, 10) === parseInt(key, 10),
        );
        const update = [...itm.slice(0, index), ...itm.slice(index + 1)];
        if (this._isMounted) {
            this.setState({ selectedItems: update });

        }

        toast("Item successfully deleted", {
            position: toast.POSITION.BOTTOM_RIGHT,
            className: 'foo-bar'
        });


    };

    updateQty = (e) => {
        this._isMounted = true

        const { key, price } = e.target.dataset;
        const { value } = e.target;



        var selectedItems = this.state.selectedItems;

        if (value == 0) {
            toast("Item quantity must greater than 0", {
                position: toast.POSITION.BOTTOM_RIGHT,
                className: 'foo-bar'
            });
        } else {
            var commentIndex = selectedItems.findIndex(function (c) {
                return c.item_id == key;
            });

            var updatedComment = update(selectedItems[commentIndex], { quantity: { $set: value }, total: { $set: value * price } });

            var newData = update(selectedItems, {
                $splice: [[commentIndex, 1, updatedComment]]
            });
            if (this._isMounted) {
                this.setState({ selectedItems: newData });
            }
            toast("Item successfully updated", {
                position: toast.POSITION.BOTTOM_RIGHT,
                className: 'foo-bar'
            });

        }

    };

    updateItem = (e) => {
        this._isMounted = true

        const { key, price, qty } = e.target.dataset;
        const { name, value } = e.target;



        var selectedItems = this.state.selectedItems;

        if (value == 0) {
            toast("Item quantity must greater than 0", {
                position: toast.POSITION.BOTTOM_RIGHT,
                className: 'foo-bar'
            });
        } else {
            var commentIndex = selectedItems.findIndex(function (c) {
                return c.item_id == key;
            });
            var updatedComment;

            if (name == "quantity") {
                updatedComment = update(selectedItems[commentIndex], { quantity: { $set: value }, total: { $set: value * price } });
            } else if (name == "original_price") {
                updatedComment = update(selectedItems[commentIndex], { [name]: { $set: value }, total: { $set: value * qty } });
            } else {
                updatedComment = update(selectedItems[commentIndex], { [name]: { $set: value } });
            }


            var newData = update(selectedItems, {
                $splice: [[commentIndex, 1, updatedComment]]
            });
            if (this._isMounted) {
                this.setState({ selectedItems: newData });
            }
            toast("Item successfully updated", {
                position: toast.POSITION.BOTTOM_RIGHT,
                className: 'foo-bar'
            });

        }

    };
    reset = (e) => {
        this._isMounted = true
        if (this._isMounted) {
            this.setState({
                original_price: null,
                new_name: null,
                new_size: null,
                unit_id: null,
                cat_id: "1",
                brand_id: "1",
                sup_id: "1",
                unit_id: null,
            });
        }
        this.addnewForm.reset();

    };

    optPay = (item) => {
        this._isMounted = true
        if (this._isMounted) {

            if (this.state.for_payment == "no") {
                this.setState({ for_payment: "yes" });
            } else {
                this.setState({ for_payment: "no" });
            }
        }
    }
    optPrice = (item) => {
        this._isMounted = true
        if (this._isMounted) {

            if (this.state.priceOption == "pertain") {
                this.setState({ priceOption: "replace", dis_orgprice: { display: "block" } });
            } else {
                this.setState({ priceOption: "pertain", dis_orgprice: { display: "none" } });
            }
        }
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

    render() {
        const { items, supplier, selectedItems, brand, itemcat, unit, options } = this.state;
        // const itms = items.map((items) => ({ key: items.id, value: items.id, text: items.name.concat('\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0', ' (', items.size, items.unit, ') -  ', items.brand, '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0', items.code ) }));
        const itms = items.map((items) => ({ key: items.id, value: items.id, text: items.code.concat('\xa0\xa0\xa0\xa0', items.name) }));
        // const opt = options.map((items) => ({ key: items.id, value: items.id, text: items.name }));
        const opt = options.map((items) => ({ key: items.id, value: items.id, text: items.code.concat('\xa0\xa0\xa0\xa0', items.name, '-', items.brand) }));
        const sup = supplier.map((un) => ({ key: un.id, value: un.id, text: un.name }));
        const disorg = this.state.dis_orgprice;
        const brd = brand.map((br) => ({ key: br.id, value: br.id, text: br.name }));
        const itc = itemcat.map((un) => ({ key: un.id, value: un.id, text: un.name }));
        const units = unit.map((un) => ({ key: un.id, value: un.abv, text: un.name }));
        console.log(selectedItems)

        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1; //January is 0!
        var yyyy = today.getFullYear();
        if (dd < 10) {
            dd = '0' + dd
        }
        if (mm < 10) {
            mm = '0' + mm
        }

        today = yyyy + '-' + mm + '-' + dd;

        return (
            <div>

                <ToastContainer limit={3} />
                {/* <div class="resContainer"> */}
                <div class="contentreq">
                    <nav aria-label="breadcrumb">
                        <ol class="breadcrumb">
                            <li class="breadcrumb-item active" aria-current="page">Receiving</li>
                            <li class="breadcrumb-item active" aria-current="page">No Request</li>
                            <li class="breadcrumb-item active" aria-current="page">Purchase</li>
                            <li class="breadcrumb-item active" aria-current="page">Historical</li>
                        </ol>

                    </nav>
                    <br />
                    {/* {this.state.priceOption}
       {this.state.item_id}
       {this.state.sup_id}
       {this.state.original_price}
       {this.state.quantity} */}
                    {/* {this.state.date_received} */}
                    {/* <div class="inline_block leftForm"> */}
                    <div class="inline_block leftFormN">
                        {/* {this.state.priceOption}
            {this.state.for_payment} */}
            Supplier: {this.state.sup_name}<br />
            For payment: {this.state.for_payment}<br />
            Price Option: {this.state.priceOption} original price
            <hr />
                        <div class="form-check">

                            <input class="form-check-input" onClick={this.optPay} type="checkbox" name="for_payment" id="exampleRadios1" value="yes" />
                            <label class="form-check-label" for="exampleRadios1">
                                This transaction is for payment to supplier
                                </label><br />

                            {/* <input class="form-check-input" type="checkbox" onClick={this.optPrice} name="priceOption" id="exampleRadios2" value="replace" />
              <label class="form-check-label" for="exampleRadios2">
                Replace Item's original price
                                </label> */}
                        </div>
                        <br />
                        <form
                            method="post"
                            onSubmit={this.handleAddItem}
                            ref={(el) => {
                                this.addForm = el;
                            }}
                        >
                            {/* <div class="form-check">
                                <input class="form-check-input" type="radio" name="priceOption" id="exampleRadios1" value="yes" onChange={this.handleChange}  />
                                <label class="form-check-label" for="exampleRadios1">
                                Pertain Item's original price
                                </label>
                            </div> */}

                            <a href="#" data-toggle="modal" data-backdrop="static" data-keyboard="false" data-target="#imp">Add new item</a><br />
                            <label> Item &nbsp; {this.state.item_id} </label>

                            <Dropdown
                                type="select"
                                placeholder='Select item'
                                fluid
                                search
                                selection
                                clearable={true}
                                options={opt}
                                loading={this.state.loading}
                                // style={req_inpt}
                                onChange={this.myChangeHandlerItem}
                                onSearchChange={this.onSearchChange}
                                // onSearchChange={this.onSearchChange}
                                // selectOnBlur={false}

                                // options={this.state.options}
                                // options={itms}

                                id="addItem"
                                name="item_id"
                                required
                            />
                            {/* <select class="ui search dropdown" id="search-select">
                {options.map((opts) => (
                  <option value={opts.id}>{opts.name}</option>
                ))}
              </select> */}
                            <label> Supplier &nbsp; {this.state.sup_id} </label>
                            <Dropdown
                                type="select"
                                placeholder='Select item'
                                fluid
                                search
                                selection
                                clearable={true}
                                // style={req_inpt}
                                onChange={this.myChangeHandlerSup}
                                options={sup}
                                id="addItem"
                                name="sup_id"
                                required
                            />
                            {/* <div style={disorg}>
                                <label> Original Price &nbsp; {this.state.original_price}</label>
                                <input type="number" step="0.001" name="original_price" class="form-control mb-2 mr-sm-2" onChange={this.handleChange} />
                            </div> */}

                            <div>
                                <div class="inline_block" style={{ width: "47%" }}>
                                    <label> Quantity</label>
                                    <input type="number" name="quantity" class="form-control mb-2 mr-sm-2" onChange={this.handleChange} />
                                </div>
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <div class="inline_block" style={{ width: "47%" }}>
                                    <label> Original Price </label>
                                    <input type="number" name="original_price" class="form-control mb-2 mr-sm-2" onChange={this.handleChange} />
                                </div>
                            </div>

                            <div>
                                <div class="inline_block" style={{ width: "47%" }}>
                                    <label> SRP </label>
                                    <input type="number" name="srp" class="form-control mb-2 mr-sm-2" onChange={this.handleChange} />
                                </div>

                            </div>







                            <button type="submit" class="btn btn-primary btn-lg"  >Add</button>
                        </form>
                        <label> Date Received</label>
                        <input type="date" name="date_received" max={today} class="form-control mb-2 mr-sm-2" onChange={this.handleChange} />
                        <button type="button" class="btn btn-primary btn-lg" onClick={this.SubmitAll}  >Receive All Items</button>
                    </div>
                    {/* <div class="inline_block rightTable"> */}
                    <div class="inline_block rightTableN">
                        <div style={{ float: "left" }}>
                            <small><i>*This transaction <b>WILL NOT AFFECT BALANCES</b></i></small>
                        </div>
                        <div style={{ float: "right" }}>
                            <Link to="/receive/norequest/purchase"><Button>Add New Purchases</Button></Link>
                        </div><br /><br /><br />
                        <BootstrapTable
                            ref='table'
                            data={selectedItems}
                            pagination={true}
                            search={true}
                        // style={itemTabs}

                        // options={options} exportCSV
                        >
                            <TableHeaderColumn dataField='for_payment' width="70">Credit</TableHeaderColumn>
                            <TableHeaderColumn tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} dataField='name' >Name</TableHeaderColumn>
                            <TableHeaderColumn tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} width="150" dataField='sup_name'>Supplier</TableHeaderColumn>
                            <TableHeaderColumn dataField='original_price' width="80">Org. <br />Price</TableHeaderColumn>
                            <TableHeaderColumn dataField='srp' width="80">SRP</TableHeaderColumn>
                            <TableHeaderColumn dataField="quantity" width="80">Quantity</TableHeaderColumn>
                            <TableHeaderColumn dataField="total" width="100">Total</TableHeaderColumn>
                            <TableHeaderColumn dataField="item_id" width="80" isKey={true} dataFormat={this.buttonFormatter}>Action</TableHeaderColumn>
                        </BootstrapTable>
                    </div>
                </div>
        &zwnj;
                <div class="modal fade" id="imp">
                    <div class="modal-dialog modal-md">
                        <div class="modal-content">


                            <div class="modal-header">
                                <h4 class="modal-title">Add new item</h4>
                                <button type="button" class="close" onClick={this.reset} data-dismiss="modal">&times;</button>
                            </div>


                            <div class="modal-body">
                                <form
                                    method="post"
                                    onSubmit={this.handleSubmit}
                                    ref={(el) => {
                                        this.addnewForm = el;
                                    }}
                                >
                                    {/* style={label_style}  */}
                                    <label for="name" >Item Name &nbsp; {this.state.new_name}</label>
                                    <input type="text"
                                        id="addItem"
                                        name="new_name"
                                        onChange={this.handleChange}
                                        // style={inpt_style}
                                        class="form-control mb-2 mr-sm-8" placeholder="Enter item name"
                                        required
                                    />
                                    <label for="name" >Measurement  &nbsp; {this.state.new_size}</label>
                                    <input type="text"
                                        id="addItem"
                                        name="new_size"
                                        onChange={this.handleChange}
                                        // style={inpt_style}
                                        class="form-control mb-2 mr-sm-8" placeholder="Enter item size"

                                    />
                                    <label for="name" >Original Price &nbsp; {this.state.original_price}</label>
                                    <input type="number"
                                        id="addItem"
                                        name="original_price"
                                        onChange={this.handleChange}
                                        // style={inpt_style}
                                        class="form-control mb-2 mr-sm-8" placeholder="Enter item original price"
                                        required
                                        step="0.001"
                                    />
                Unit measure  &nbsp; {this.state.unit_id}
                                    <Dropdown
                                        type="select"
                                        placeholder='Select unit'
                                        fluid
                                        search
                                        selection
                                        // style={inpt_style}
                                        onChange={this.myChangeHandlerUnit}
                                        options={units}
                                        id="addItem"
                                        name="unit_name"
                                        clearable={true}

                                    />
                Item Category &nbsp; {this.state.cat_id}
                                    <Dropdown
                                        type="select"
                                        placeholder='Select category'
                                        fluid
                                        search
                                        selection
                                        // style={inpt_style}
                                        onChange={this.myChangeHandlerCat}
                                        options={itc}
                                        id="addItem"
                                        name="category_id"
                                        clearable={true}
                                        required
                                    />
                  Brand &nbsp; {this.state.brand_id}
                                    <Dropdown
                                        type="select"
                                        placeholder='Select brand'
                                        fluid
                                        search
                                        selection
                                        // style={inpt_style}
                                        onChange={this.myChangeHandlerBrand}
                                        options={brd}
                                        id="addItem"
                                        name="brand_id"
                                        required
                                    />
                                    <button type="submit" class="btn btn-primary btn-lg"  >Add</button>
                                    <div class="modal-footer">
                                        <button type="button" class="btn btn-secondary" onClick={this.reset} data-dismiss="modal">Close</button>
                                    </div>
                                </form>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    isAuthenticated: state.Auth.isAuthenticated,
    user: state.Auth.user,
});

export default connect(mapStateToProps)(HistoricalRNRExisting);
