import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../Http';
import classNames from 'classnames';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Dropdown, Message } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import update from 'immutability-helper';
import { Button } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import EndSession from '../../pages/endSession';

class RNRExisting extends Component {
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
      options: [],

      endOfSession: "no",
      hashuserId: null

    };

  }
  componentDidMount() {
    this._isMounted = true

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
            hashuserId: response.data.hashuserId,
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

        // this.identifyCurrentUser();
      })

      .catch(() => {
        if (this._isMounted) {
          this.setState({
            error: 'Unable to fetch data.',
          });
        }
      });
  }

  // user/hash

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
  updateItem = (e) => {
    this._isMounted = true

    const { key, price, qty, opt } = e.target.dataset;
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
      }
      // else if (name == "original_price") {
      //   if (opt == "Replace") {
      //     updatedComment = update(selectedItems[commentIndex], { [name]: { $set: value }, total: { $set: value * qty } });
      //   }

      // } 
      else {
        updatedComment = update(selectedItems[commentIndex], { [name]: { $set: value } });
      }


      var newData = update(selectedItems, {
        $splice: [[commentIndex, 1, updatedComment]]
      });

      // if (name == "original_price") {
      //   if (opt == "Pertain") {
      //     newData = selectedItems;
      //     toast("Cannot replace original price", {
      //       position: toast.POSITION.BOTTOM_RIGHT,
      //       className: 'foo-bar'
      //     });
      //   }
      // }

      if (this._isMounted) {
        this.setState({ selectedItems: newData });
      }
      toast("Item successfully updated", {
        position: toast.POSITION.BOTTOM_RIGHT,
        className: 'foo-bar'
      });

    }

  };


  buttonFormatter = (cell, row) => {
    const dis = this.state.edit_qty;
    return (

      <div>
        {/* <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#exampleModal"  data-key={row.id}> */}
        <center>    <i onClick={this.deleteItem} data-key={row.item_id} class="minus square icon"></i></center>



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
      const { supplier, selectedItems } = this.state;
      var resultSup = supplier.filter(function (v) {
        return v.id == value;
      })


      selectedItems.map(function (x) {
        x.sup_id = value;
        x.sup_name = resultSup[0].name;
        return x
      });

      this.setState({ sup_id: value, sup_name: resultSup[0].name, selectedItems: selectedItems, })


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
    if (this.state.priceOption == "pertain") {
      price = result[0].original_price;
    }

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
              original_price: null,
              // quantity: null,
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

      date_transac: this.state.date_received,
      items: JSON.stringify(selectedItems)

    }

    if (selectedItems === undefined || selectedItems.length == 0) {
      toast("TRANSACTION EMPTY")
    } else {

      if (this.state.date_received) {
        if (confirm("Are you sure you want to receive items? Make sure to physically count the items. AMOUNTS AND QUANTITIES WILL AFFECT BALANCES")) {
          if (this._isMounted) { this.setState({ loading: true }); }
          this.addSales(subs);
        }


      } else {
        toast("EMPTY DATE RECEIVED")
      }




    }



  };

  addSales = (subs) => {
    this._isMounted = true
    Http.post(`/api/v1/transaction/receive/purchase/noreqexisting`, subs)
      .then(({ data }) => {

        if (this._isMounted) {
          this.setState({
            priceOption: "pertain",
            item_id: null,
            // sup_id: null,
            original_price: null,
            // quantity: null,
            date_received: null,
            selectedItems: [],
            loading: false,
          });

        }
        this.addForm.reset();
        toast("TRANSACTION COMPLETE");
      })
      .catch(() => {
        if (this._isMounted) { this.setState({ loading: false }); }
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

    const { selectedItems } = this.state;
    var fp;
    if (this._isMounted) {

      if (this.state.for_payment == "no") {
        this.setState({ for_payment: "yes" });
        fp = "yes";
      } else {
        this.setState({ for_payment: "no" });
        fp = "no";
      }

      selectedItems.map(function (x) {
        x.for_payment = fp;
        return x
      });

      this.setState({ selectedItems: selectedItems })

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
  optPriceUpdate = (e) => {
    this._isMounted = true
    const { value } = e.target;
    if (this._isMounted) {

      if (value == "pertain") {
        this.setState({ priceOption: "replace" });
        // toast("Replace")
      } else {
        this.setState({ priceOption: "pertain" });
        // toast("pertain")
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

  onBeforeSaveCell(row, cellName, cellValue) {

    if (confirm("Are you sure you want to update details?")) {

      if (cellName == "original_price") {
        if (row.priceOption == "pertain") {
          toast("Original price cannot be modified. Please shift to replace price option")
          return false;
        } else if (row.priceOption == "replace") {
          return true;
        }
      }
    } else {
      return false;
    }

  }

  onAfterSaveCell = (row, cellName, cellValue) => {
    this._isMounted = true

    const { selectedItems, items } = this.state;



    var commentIndex = selectedItems.findIndex(function (c) {
      return c.item_id == row.item_id;
    });
    console.log("cells")
    console.log(cellName)
    console.log(cellValue)
    var updatedComment;

    if (cellName == "quantity") {
      updatedComment = update(selectedItems[commentIndex], { [cellName]: { $set: cellValue }, total: { $set: parseFloat(cellValue) * row.original_price } });
    } else if (cellName == "original_price") {
      updatedComment = update(selectedItems[commentIndex], { [cellName]: { $set: cellValue }, total: { $set: parseFloat(cellValue) * row.quantity } });
    } else if (cellName == "priceOption" && cellValue == "pertain") {


      var result = items.filter(function (v) {
        return v.id == row.item_id;
      })

      updatedComment = update(selectedItems[commentIndex], {
        [cellName]: { $set: cellValue },
        total: { $set: result[0].original_price * row.quantity },
        original_price: { $set: result[0].original_price }

      });
    } else {
      updatedComment = update(selectedItems[commentIndex], { [cellName]: { $set: cellValue } });
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

  render() {
    const formatter = new Intl.NumberFormat('fil', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    })
    const { items, supplier, selectedItems, brand, itemcat, unit, options, loading } = this.state;
    // const itms = items.map((items) => ({ key: items.id, value: items.id, text: items.name.concat('\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0', ' (', items.size, items.unit, ') -  ', items.brand, '\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0\xa0', items.code ) }));
    // const itms = items.map((items) => ({ key: items.id, value: items.id, text: items.code.concat('\xa0\xa0\xa0\xa0', items.name) }));
    // const opt = options.map((items) => ({ key: items.id, value: items.id, text: items.name }));
    const opt = options.map((items) => ({ key: items.id, value: items.id, text: items.code.concat('\xa0\xa0\xa0\xa0', items.name, "-", items.brand, " : ", items.size || items.unit ? items.size + " " + items.unit : "(No Size Spec.)", 
    '\xa0\xa0\xa0\xa0',' UP:[', formatter.format(items.unit_price), ']', '\xa0\xa0\xa0\xa0',' OP:[', formatter.format(items.original_price), ']') }));
    // const opt = options.map((items) => ({ key: items.id, value: items.id, text: items.code.concat('\xa0\xa0\xa0\xa0', items.name, '-', items.brand) }));
    const sup = supplier.map((un) => ({ key: un.id, value: un.id, text: un.name }));
    const disorg = this.state.dis_orgprice;
    const brd = brand.map((br) => ({ key: br.id, value: br.id, text: br.name }));
    const itc = itemcat.map((un) => ({ key: un.id, value: un.id, text: un.name }));
    const units = unit.map((un) => ({ key: un.id, value: un.abv, text: un.name }));
    console.log("selectedItems")
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
    const cellEditPropMain = {
      // mode: 'click',
      mode: 'dbclick',
      blurToSave: true,
      beforeSaveCell: this.onBeforeSaveCell, // a hook for before saving cell
      afterSaveCell: this.onAfterSaveCell
      // blurToSave: false,
    };

    const priceOpt = ['replace', 'pertain'];

    var amtDue = 0;
    selectedItems.map((un) => { amtDue += parseFloat(un.total) });

    // const formatter = new Intl.NumberFormat('fil', {
    //   style: 'currency',
    //   currency: 'PHP',
    //   minimumFractionDigits: 2
    // })
    return (
      <div onClick={this.identifyCurrentUser}>
        {this.state.hashuserId ?
          <>
            {this.state.endOfSession == "yes" ?
              <EndSession /> : <></>
            }
          </>
          : <></>
        }
        <ToastContainer />
        {/* <div class="resContainer"> */}
        <div class="contentreq">
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
              <li class="breadcrumb-item active" aria-current="page">Receiving</li>
              <li class="breadcrumb-item active" aria-current="page">No Request</li>
              <li class="breadcrumb-item active" aria-current="page">Purchase</li>
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
            {/* {this.state.hashuserId} */}
            <h3><b>Amount Due: {formatter.format(amtDue)}</b></h3>
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

              <input class="form-check-input" type="checkbox" onClick={this.optPrice} name="priceOption" id="exampleRadios2" value="replace" />
              <label class="form-check-label" for="exampleRadios2">
                Replace Item's original price
                                </label>
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
              <label> Supplier &nbsp;
                {/* {this.state.sup_id}  */}
              </label>
              <Dropdown
                type="select"
                placeholder='Select supplier'
                fluid
                search
                selection
                clearable={true}
                // style={req_inpt}
                ref={(el) => {
                  this.supint = el;
                }}
                onChange={this.myChangeHandlerSup}
                options={sup}
                id="addItem"
                name="sup_id"
                required
              />
              <br />
              <a href="#" data-toggle="modal" data-backdrop="static" data-keyboard="false" data-target="#imp">Add new item</a><br />
              <label> Item &nbsp; {this.state.item_id} </label>

              <Dropdown
                type="select"
                placeholder='Select item'
                fluid
                search
                selection
                ref={(el) => {
                  this.itmInt = el;
                }}
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

              <div style={disorg}>
                <label> Original Price &nbsp; {this.state.original_price}</label>
                <input type="number" step="0.001" name="original_price" class="form-control mb-2 mr-sm-2" onChange={this.handleChange} />
              </div>
              <label> Quantity &nbsp; {this.state.quantity}</label>
              <input type="number" name="quantity" class="form-control mb-2 mr-sm-2" onChange={this.handleChange} />


              <button type="submit" class="btn btn-primary btn-lg"  >Add</button>
              <br />
              <br />
            </form>
            <label> Date Received</label>
            <input type="date" name="date_received" max={today} class="form-control mb-2 mr-sm-2" onChange={this.handleChange} />
            <button type="button"
              //  class="btn btn-primary btn-lg" 
              className={classNames('btn btn-primary btn-lg', {
                'btn-loading': loading,
              })}
              onClick={this.SubmitAll}  >Receive All Items</button>
              <br/>
              <br/>
              <br/>
              <br/>
              <br/>
          </div>
          {/* <div class="inline_block rightTable"> */}
          <div class="inline_block rightTableN">
            <div style={{ float: "left" }}>
              <small><i>*This transaction <b>WILL AFFECT BALANCES</b> make sure to double check details and items</i></small>
            </div>

{/* Oct 10, 2021 */}
            {/* <div style={{ float: "right" }}>
              <Link to="/receive/norequest/purchase/historical"><Button color='orange'>Add Hisortical Purchases</Button></Link>
            </div><br /> */}
            <br /><br />

            <Message info>
              <Message.Header>Important reminder!</Message.Header>
              <p>Don't forget to specify if this transaction is for payment or already paid.</p>
            </Message>

            <BootstrapTable
              ref='table'
              data={selectedItems}
              cellEdit={cellEditPropMain}
              pagination={true}
              search={true}
            // style={itemTabs}

            // options={options} exportCSV
            >
              <TableHeaderColumn dataField='for_payment' editable={false} width="70">Credit</TableHeaderColumn>
              <TableHeaderColumn tdStyle={{ whiteSpace: 'normal' }}width="100" thStyle={{ whiteSpace: 'normal' }} editable={false} dataField='name' >Name</TableHeaderColumn>
              <TableHeaderColumn tdStyle={{ whiteSpace: 'normal' }}width="80" thStyle={{ whiteSpace: 'normal' }} editable={false} dataField='sup_name'>Supplier</TableHeaderColumn>
              <TableHeaderColumn dataField='original_price' width="80">Price</TableHeaderColumn>
              <TableHeaderColumn dataField="quantity" width="80">Quantity</TableHeaderColumn>
              <TableHeaderColumn dataField="total" width="100" editable={false}>Total</TableHeaderColumn>
              <TableHeaderColumn dataField="priceOption" editable={{ type: 'select', options: { values: priceOpt } }} width="100">Price Opt.</TableHeaderColumn>
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

export default connect(mapStateToProps)(RNRExisting);
