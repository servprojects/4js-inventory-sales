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

class RNRNewItem extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);

    // Initial state.
    this.state = {
      loading: false,



      date_received: null,
      edit_qty: { display: "none" },
      isedit_qty: "no",
      new_name: null,
      new_size: null,
      unit_id: null,
      cat_id: "1",
      brand_id: "1",
      sup_id: "1",
      original_price: null,
      quantity: null,
      cat_name: "Miscellaneous",
      brand_name: "No Brand",
      sup_name: "Not Specified",
      for_payment: "no",

      selectedItems: [],
      sentItems: [],
      brand: [],
      itemcat: [],
      supplier: [],
      unit: [],
    };

  }
  componentDidMount() {
    this._isMounted = true

    Http.get(`/api/v1/transaction/receive/purchase/noreqexisting`)
      .then((response) => {
        // const { data } = response.data;
        if (this._isMounted) {
          this.setState({
            brand: response.data.brand,
            itemcat: response.data.itemcat,
            supplier: response.data.supplier,
            unit: response.data.unit,

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
        <i data-key={row.id} onClick={this.displayQty} class="pencil alternate icon"></i>
        <div>
          <input type="number" style={dis} data-key={row.item_id} data-price={row.original_price} onChange={this.updateQty} class="form-control form-control-lg qtyInpt" name="itm_qty" required placeholder="Qty" />
        </div>
        {/* </button> */}

      </div>
    )
  }

  handleChange = (e) => {
    const { name, value } = e.target;
    if (this._isMounted) {
      this.setState({ [name]: value });
    }
  };

  myChangeHandlerSup = (e, { value }) => {
    const { supplier } = this.state;
    var resultSup = supplier.filter(function (v) {
      return v.id == value;
    })
    if (this._isMounted) {
      this.setState({ sup_id: value, sup_name: resultSup[0].name })
    }
  };
  myChangeHandlerUnit = (e, { value }) => {
    if (this._isMounted) {
      this.setState({ unit_id: value })
    }
  };
  myChangeHandlerCat = (e, { value }) => {
     const { itemcat } = this.state;
    var result = itemcat.filter(function (v) {
      return v.id == value;
    })
    if (this._isMounted) {
      this.setState({ cat_id: value, cat_name: result[0].name })
    }
  };
  myChangeHandlerBrand = (e, { value }) => {
     const { brand } = this.state;
    var result = brand.filter(function (v) {
      return v.id == value;
    })
    if (this._isMounted) {
      this.setState({ brand_id: value, brand_name: result[0].name })
    }
  };
  handleAddItem = (e) => {
    this._isMounted = true
    e.preventDefault();
    const subs = {

      sup_id: this.state.sup_id,

    }

    this.addItem(subs);
  };

  addItem = (item) => {
    this._isMounted = true

    const { supplier, selectedItems, sentItems } = this.state;


    var resultSup = supplier.filter(function (v) {
      return v.id == item.sup_id;
    })
    var id = Math.floor(Math.random() * 999);
    var exist = "no";
    selectedItems.map((itemex) => {
      if (itemex.item_id == id) {
        exist = "yes";
      }
    })


    var message = "Item Added successfully!";
    if (this.state.for_payment == "yes" && this.state.sup_id == "1") {
      message = "Please select proper supplier";
    } else {

      if (exist == "no") {
        if (this.state.quantity) {
          const newItem = {

            item_id: id,
            supplier_id: this.state.sup_id,
            new_size: this.state.new_size,
            unit: this.state.unit_id,
            category_id: this.state.cat_id,
            brand_id: this.state.brand_id,
            new_name: this.state.new_name,
            original_price: this.state.original_price,
            quantity: this.state.quantity,
            total: this.state.quantity * this.state.original_price,
            sup_name: resultSup[0].name,
            for_payment: this.state.for_payment,
          };
          // const sent = {


          //     supplier_id: this.state.sup_id,
          //     new_size: this.state.new_size,
          //     unit: this.state.unit_id,
          //     category_id: this.state.cat_id,
          //     brand_id: this.state.brand_id,
          //     new_name: this.state.new_name,
          //     original_price: this.state.original_price,
          //     quantity: this.state.quantity,
          // };
          const allItems = [newItem, ...this.state.selectedItems];
          // const allItemsSent = [sent, ...this.state.sentItems];
          if (this._isMounted) {
            this.setState({
              selectedItems: allItems, new_name: null,
              new_size: null,
              unit_id: null,
              // cat_id: "1",
              // brand_id: "1",
              // sup_id: "1",
              original_price: null,
              quantity: null, 
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
      date_transac: this.state.date_received,
      items: JSON.stringify(selectedItems)

    }

    if (selectedItems === undefined || selectedItems.length == 0) {
      toast("TRANSACTION EMPTY")
    } else {
      this.addSales(subs);
    }



  };

  addSales = (subs) => {
    this._isMounted = true
    Http.post(`/api/v1/transaction/receive/purchase/noreqnonexisting`, subs)
      .then(({ data }) => {

        if (this._isMounted) {
          this.setState({
            new_name: null,
            new_size: null,
            unit_id: null,
            cat_id: "1",
            brand_id: "1",
            sup_id: "1",
            original_price: null,
            quantity: null,

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





  render() {
    const { selectedItems, brand, itemcat, supplier, unit } = this.state;

    const sup = supplier.map((sups) => ({ key: sups.id, value: sups.id, text: sups.name }));
    const brd = brand.map((br) => ({ key: br.id, value: br.id, text: br.name }));
    const itc = itemcat.map((un) => ({ key: un.id, value: un.id, text: un.name }));
    const units = unit.map((un) => ({ key: un.id, value: un.abv, text: un.name }));
    return (
      <div>
        <ToastContainer />
        <div class="resContainer">
          {/* {this.state.new_name}
       {this.state.new_size}
       {this.state.unit_id}
       {this.state.cat_id}
       {this.state.brand_id}
       {this.state.sup_id}
        {this.state.original_price}
        {this.state.quantity}
        {this.state.date_received} */}
          <div class="inline_block leftForm">
            For payment: {this.state.for_payment}<br />
            Category: {this.state.cat_name}<br />
            Brand: {this.state.brand_name}<br />
            Supplier: {this.state.sup_name}<br />
            <hr />
            <input  class="form-check-input" onClick={this.optPay} type="checkbox" name="for_payment" id="exampleRadios1" value="yes" />
            <label class="form-check-label" for="exampleRadios1">
              This transaction is for payment to supplier
                                </label><br />
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


              {/* {this.state.for_payment}<br/> */}


              <label> Name of Item &nbsp; {this.state.new_name}</label>
              <input  required type="text" name="new_name" class="form-control mb-2 mr-sm-2" onChange={this.handleChange} />

              <label> Measurement  &nbsp; {this.state.new_size}</label>
              <input type="text" name="new_size" class="form-control mb-2 mr-sm-2" onChange={this.handleChange} />

              <label> Unit  &nbsp; {this.state.unit_id} </label>
              <Dropdown
                type="select"
                placeholder='Select item'
                fluid
                search
                selection
                // style={req_inpt}
                onChange={this.myChangeHandlerUnit}
                options={units}
                id="addItem"
                name="unit_id"
                required
              />
              <br />
              <label> Category  &nbsp; {this.state.cat_id}</label>
              <Dropdown
                type="select"
                placeholder='Select item'
                fluid
                search
                selection
                // style={req_inpt}
                onChange={this.myChangeHandlerCat}
                options={itc}
                id="addItem"
                name="cat_id"
                required
              />
              <label> Brand  &nbsp; {this.state.brand_id}</label>
              <Dropdown
                type="select"
                placeholder='Select item'
                fluid
                search
                selection
                // style={req_inpt}
                onChange={this.myChangeHandlerBrand}
                options={brd}
                id="addItem"
                name="brand_id"
                required
              />
              <label> Supplier  &nbsp; {this.state.sup_id}</label>
              <Dropdown
                type="select"
                placeholder='Select item'
                fluid
                search
                selection
                // style={req_inpt}
                onChange={this.myChangeHandlerSup}
                options={sup}
                id="addItem"
                name="sup_id"
                required
              />


              <label> Original Price  &nbsp; {this.state.original_price}</label>
              <input required type="number" step="0.001" name="original_price" class="form-control mb-2 mr-sm-2" onChange={this.handleChange} />

              <label> Quantity  &nbsp; {this.state.quantity}</label>
              <input required type="number" name="quantity" class="form-control mb-2 mr-sm-2" onChange={this.handleChange} />


              <button type="submit" class="btn btn-primary btn-lg"  >Add</button>
            </form>
            <label> Date Received</label>
            <input type="date" name="date_received" class="form-control mb-2 mr-sm-2" onChange={this.handleChange} />
            <button type="button" class="btn btn-primary btn-lg" onClick={this.SubmitAll}  >Receive All Items</button>
          </div>
          <div class="inline_block rightTable">
            <BootstrapTable
              ref='table'
              data={selectedItems}
              pagination={true}
              search={true}
            // style={itemTabs}

            // options={options} exportCSV
            >

              <TableHeaderColumn tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} dataField='new_name' >Name</TableHeaderColumn>
              <TableHeaderColumn dataField='sup_name'>Supplier</TableHeaderColumn>
              <TableHeaderColumn dataField='original_price'>Price</TableHeaderColumn>
              <TableHeaderColumn dataField="quantity">Quantity</TableHeaderColumn>
              <TableHeaderColumn dataField="total">Total</TableHeaderColumn>
              <TableHeaderColumn dataField="item_id" isKey={true} dataFormat={this.buttonFormatter}>Action</TableHeaderColumn>
            </BootstrapTable>
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

export default connect(mapStateToProps)(RNRNewItem);
