import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../Http';
import classNames from 'classnames';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Dropdown } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';

class Purchase extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);

    // Initial state.
    this.state = {
      loading: false,
      brand: null,
      name: null,
      code: null,
      error: false,
      upId: null,
      // priceOption: null,
      unit_price: null,
      quantity: null,
      sup: "1",
      unit_id: null,
      category_id: "1",
      brand_id: "1",
      nameOption: null,
      new_name: null,
      new_unit_price: null,
      new_quantity: null,
      new_size: null,
      sizeOption: null,
      unitOption: null,
      priceOption: "no",
      for_payment: "no",
      modal: null,
      display_orgpr: { display: "block" },
      dis_new_name: { display: "block" },
      dis_new_size: { display: "block" },
      dis_new_unit: { display: "block" },
      cat_name: "Miscellaneous",
      brand_name: "No Brand",
      sup_name: "Not Specified",

      data: [],
      reqDetails: [],
      supplier: [],
      reqTo: [],
      newItem: [],
      Brand: [],
      Item_category: [],
      units: [],
    };

    // API endpoint.
    this.api = '/api/v1/brand';
  }
  componentDidMount() {
    this._isMounted = true;
    if (this._isMounted) {
      this.setState({
        data: this.state.data,
        reqDetails: this.state.reqDetails,
        supplier: this.state.supplier,
        reqTo: this.state.reqTo,
        newItem: this.state.newItem,
        Brand: this.state.Brand,
        Item_category: this.state.Item_category,
        units: this.state.units,


      });
    }
    //     Http.get(`/api/v1/transaction/receive/transfer`)
    //       .then((response) => {

    //       if(this._isMounted){
    //         this.setState({
    //           data: response.data.reqitems,
    //           error: false,
    //         });
    //          }
    //       })

    //       .catch(() => {
    //  if(this._isMounted){
    //         this.setState({
    //           error: 'Unable to fetch data.',
    //         });
    //       }  
    //       });
  }

  handleChange = (e) => {
    const { name, value } = e.target;
    if (this._isMounted) {
      this.setState({ [name]: value });
    }
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { brand } = this.state;
    if (this._isMounted) {
      this.setState({ loading: true });
    }
    this.addBrand(brand);
  };

  addBrand = (brand) => {
    this._isMounted = true
    Http.post(this.api, { name: brand })
      .then(({ data }) => {
        const newItem = {
          id: data.id,
          name: brand,
        };
        const allBrands = [newItem, ...this.state.data];
        if (this._isMounted) {
          this.setState({ data: allBrands, brand: null });
        }
        this.brandForm.reset();
        if (this._isMounted) {
          this.setState({ loading: false });
        }
        toast("Brand added successfully!")
      })
      .catch(() => {
        if (this._isMounted) {
          toast("Error adding brand!")
        }
      });
  };
  deleteBrand = (e) => {
    this._isMounted = true
    const { key } = e.target.dataset;
    const { data: brd } = this.state;
    if (this._isMounted) {
      this.setState({ loading: true });
    }
    Http.delete(`${this.api}/${key}`)
      .then((response) => {
        if (response.status === 204) {
          const index = brd.findIndex(
            (brand) => parseInt(brand.id, 10) === parseInt(key, 10),
          );
          const update = [...brd.slice(0, index), ...brd.slice(index + 1)];
          if (this._isMounted) {
            this.setState({ data: update });
            this.setState({ loading: false });
          }
        }
        toast("Brand deleted successfully!")
      })
      .catch((error) => {
        console.log(error);
        toast("Error deleting brand!")
      });
  };



  setUpId = (e) => {
    this._isMounted = true
    const { key } = e.target.dataset;
    if (this._isMounted) {
      this.setState({ upId: key })
    }
  };

  // getCode = (e) => {
  //     this._isMounted = true
  //     const { key } = e.target.dataset;
  //     if(this._isMounted){
  //       this.setState({code: key})
  //     }
  // };

  handleSubmitCode = (e) => {
    this._isMounted = true
    e.preventDefault();
    const subs = {
      code: this.state.code
    }
    if (this._isMounted) {
      this.setState({ loading: true });
    }
    this.getRequisition(subs);
  };

  // getRequisition = (subs) => {
  //     this._isMounted = true
  //     Http.post('/api/v1/transaction/receive/transfer', subs)
  //       .then(({ response }) => {
  //         if(this._isMounted){
  //           this.setState({ data: response.data.reqitems, });
  //           }
  //           this.checkForm.reset();
  //            toast("Request Exist!")
  //       })
  //       .catch(() => {
  //         if(this._isMounted){
  //        toast("Error getting request!")
  //         }
  //       });
  //   };

  getRequisition = (subs) => {
    this._isMounted = true
    Http.post('/api/v1/transaction/receive/purchase', subs)
      .then(({ data }) => {
        if (data.type == 'Transfer') {
          this.setState({ loading: false });
          toast("Request not for purchase")
        } else {

          // if (data.reqTo[0].branch_id != data.branch_id) {
          //   toast("This is not your request");
          //   if (this._isMounted) {
          //     this.setState({
          //       loading: false,
          //     });
          //   }
          // } else {

            if (data.status == 'Disapproved') {
              this.setState({ loading: false });
              toast("Request is not approved")
            } else if (data.status == 'Pending') {
              this.setState({ loading: false });
              toast("Request is still pending")
            } else {
              if (this._isMounted) {
                this.setState({
                  data: data.reqitems,
                  newItem: data.reqnewitems,
                  loading: false,
                  reqDetails: data.requests,
                  supplier: data.supplier,
                  reqTo: data.reqTo,
                  Brand: data.Brand,
                  Item_category: data.Item_category,
                  units: data.units,
                });
              }
              toast("Request Exist")
            }

          // }

          // if(data.status == 'Approved')
        }

        this.checkForm.reset();
        if (this._isMounted) {
          this.setState({
            loading: false,
          });
        }

      })
      .catch(() => {
        if (this._isMounted) {
          toast("Error getting request!")
          this.setState({ loading: false });
        }
      });
  };




  handleSubmitUpdate = (e) => {
    this._isMounted = true
    e.preventDefault();
    const subs = {
      name: this.state.name
    }
    if (this._isMounted) {
      this.setState({ loading: true });
    }
    this.updateProperty(subs);
  };

  updateProperty = (property) => {
    Http.patch(`${this.api}/${this.state.upId}`, property)//last stop here no API YET
      .then(({ data }) => {

        if (this._isMounted) {
          this.setState({
            data: data.updated.data,
            error: false,
          });
          this.setState({ loading: false });
        }
        toast("Brand Updated successfully!")
        this.updateForm.reset();
      })
      .catch(() => {
        if (this._isMounted) {
          this.setState({
            loading: false
          });
        }
        toast("Error updating brand!")
      });
  };

  reset = (e) => {
    this._isMounted = true
    if (this._isMounted) {
      this.setState({
        unit_price: null,
        quantity: null,
        // sup: "1",
        unit_id: null,
        // category_id: "1",
        // brand_id: "1",
        nameOption: null,
        new_name: null,
        new_unit_price: null,
        new_quantity: null,
        new_size: null,
        priceOption: "no",
        for_payment: "no",
        unitOption: null,
        checked: "uncheked ",
        display_orgpr: { display: "block" },
        dis_new_name: { display: "block" },
        dis_new_size: { display: "block" },
        dis_new_unit: { display: "block" },
        nameOption: "different",
        dis_new_name: { display: "block" },
        sizeOption: "different", dis_new_size: { display: "block" },
        unitOption: "different", dis_new_unit: { display: "block" }
      });
    }
    this.recForm.reset();
    document.getElementById("myform").reset();


  };
  setUpId = (e) => {
    this._isMounted = true
    const { key } = e.target.dataset;
    if (this._isMounted) {
      this.setState({ upId: key })
    }
  };
  myChangeHandlerUnit = (e, { value }) => {
    const { supplier } = this.state;
    var resultSup = supplier.filter(function (v) {
      return v.id == value;
    })
    if (this._isMounted) {
      this.setState({ sup: value, sup_name: resultSup[0].name })
    }
  };
  myChangeHandlerUnitOrg = (e, { value }) => {
    if (this._isMounted) {
      this.setState({ unit_id: value })
    }
  };
  myChangeHandlerCat = (e, { value }) => {
    const { Item_category } = this.state;
    var result = Item_category.filter(function (v) {
      return v.id == value;
    })
    if (this._isMounted) {
      this.setState({ category_id: value, cat_name: result[0].name })
    }
  };
  myChangeHandlerBrand = (e, { value }) => {
    const { Brand } = this.state;
    var result = Brand.filter(function (v) {
      return v.id == value;
    })
    if (this._isMounted) {
      this.setState({ brand_id: value, brand_name: result[0].name })
    }
  };

  formsub = (e) => {

    e.preventDefault();

  };

  handleReceive = (e) => {
    this._isMounted = true
    e.preventDefault();
    const subs = {
      code: this.state.code,
      priceOption: this.state.priceOption,
      unit_price: this.state.unit_price,
      quantity: this.state.quantity,
      supplier_id: this.state.sup,
      id: this.state.upId,
      for_payment: this.state.for_payment,
    }
    if (this._isMounted) {
      this.setState({ loading: true });
    }

    if (this.state.for_payment === "yes" && this.state.sup == "1") {

      toast("Please select proper supplier")
    } else if (this.state.priceOption === "no" && !this.state.unit_price) {
      toast("Please enter price")
    } else {

      this.receiveItem(subs);
    }

    this.recForm.reset();
    if (this._isMounted) {
      this.setState({ loading: false });
    }
  };


  receiveItem = (property) => {
    Http.post(`/api/v1/transaction/receive/purchaseitem`, {
      code: this.state.code,
      priceOption: this.state.priceOption,
      unit_price: this.state.unit_price,
      quantity: this.state.quantity,
      supplier_id: this.state.sup,
      id: this.state.upId,
      for_payment: this.state.for_payment,
    })//last stop here no API YET
      .then(({ data }) => {

        if (this._isMounted) {
          this.setState({
            data: data.updated,
            error: false,
          });
          this.setState({ loading: false });
        }
        toast("Item received successfully!")
        if (this._isMounted) {
          this.setState({
            unit_price: null,
            quantity: null,
            for_payment: "no",
            // sup: null
          });
        }
        document.getElementById("myform").reset();
      })
      .catch(() => {
        if (this._isMounted) {
          this.setState({
            loading: false
          });
        }
        toast("Error receiving item!")
      });
  };


  // New Item

  handleReceiveNew = (e) => {
    this._isMounted = true
    e.preventDefault();

    const subs = {
      code: this.state.code,
      id: this.state.upId,
      sup: this.state.sup,
      new_size: this.state.new_size,
      unit: this.state.unit_id,
      category_id: this.state.category_id,
      brand_id: this.state.brand_id,
      nameOption: this.state.nameOption,
      new_name: this.state.new_name,
      new_unit_price: this.state.new_unit_price,
      new_quantity: this.state.new_quantity,
      sizeOption: this.state.sizeOption,
      unitOption: this.state.unitOption,
      for_payment: this.state.for_payment,
    }
    if (this._isMounted) {
      this.setState({ loading: true });
    }

    const { unit_id, new_name } = this.state;


    if (this.state.for_payment === "yes" && this.state.sup == "1") {

      toast("Please select proper supplier")
    } else if (this.state.nameOption === "different" && !new_name) {
      toast("Please enter item new")
    } else {

      this.receiveItemNew(subs);



    }

  };
  receiveItemNew = (property) => {
    Http.post(`/api/v1/transaction/receive/purchaseitemnew`, property)//last stop here no API YET
      .then(({ data }) => {

        if (this._isMounted) {
          this.setState({
            newItem: data.updated,
            error: false,
          });
          this.setState({ loading: false });
        }
        toast("Item received successfully!")
        if (this._isMounted) {
          this.setState({
            unit_price: null,
            quantity: null,
            sup: null,
            unit_id: null,
            category_id: null,
            brand_id: null,
            nameOption: null,
            new_name: null,
            new_unit_price: null,
            new_quantity: null,
            new_size: null,
            for_payment: "no",
            nameOption: "different",
            dis_new_name: { display: "block" },
            sizeOption: "different", dis_new_size: { display: "block" },
            unitOption: "different", dis_new_unit: { display: "block" }
          });
          document.getElementById("myform").reset();
        }
      })
      .catch(() => {
        if (this._isMounted) {
          this.setState({
            loading: false
          });
        }
        toast("Error receiving item!")
      });
  };
  optPay = (item) => {
    this._isMounted = true
    if (this._isMounted) {

      if (this.state.for_payment == "no") {
        this.setState({
          for_payment: "yes",
          // checked: props.checked || true
        });
      } else {
        this.setState({
          for_payment: "no",
          // checked: props.checked || false
        });
      }
    }
  }
  optName = (item) => {
    this._isMounted = true
    if (this._isMounted) {

      if (this.state.nameOption == "pertain") {
        this.setState({
          nameOption: "different",
          dis_new_name: { display: "block" }
        });
      } else {
        this.setState({
          nameOption: "pertain", dis_new_name: { display: "none" }
        });
      }
    }
  }

  optPrice = (item) => {
    this._isMounted = true
    if (this._isMounted) {

      if (this.state.priceOption == "yes") {
        this.setState({ priceOption: "no", display_orgpr: { display: "block" } });
      } else {
        this.setState({ priceOption: "yes", display_orgpr: { display: "none" } });
      }
    }
  }

  optSize = (item) => {
    this._isMounted = true
    if (this._isMounted) {

      if (this.state.sizeOption == "pertain") {
        this.setState({ sizeOption: "different", dis_new_size: { display: "block" } });
      } else {
        this.setState({ sizeOption: "pertain", dis_new_size: { display: "none" } });
      }
    }
  }
  opTunit = (item) => {
    this._isMounted = true
    if (this._isMounted) {

      if (this.state.unitOption == "pertain") {
        this.setState({ unitOption: "different", dis_new_unit: { display: "block" } });
      } else {
        this.setState({ unitOption: "pertain", dis_new_unit: { display: "none" } });
      }
    }
  }

  buttonFormatter = (cell, row) => {
    const { supplier } = this.state;
    const unt = supplier.map((un) => ({ key: un.id, value: un.id, text: un.name }));
    var mod_idh = "#itm" + row.id;
    var mod_id = "itm" + row.id;
    const dis_org = this.state.display_orgpr;
    const formatter = new Intl.NumberFormat('fil', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    })

    return (
      //  <button
      //  type="button"
      //  className="btn btn-primary"
      //  data-key={row.id}
      //  >
      //  Receive
      //  </button>
      <div>

        <a href="#popup1"><button class="ui button yellow create_btn" data-key={row.id} onClick={this.setUpId} type="button">Receive</button> </a>
        <div id="popup1" class="overlay">
          <div class="purmodal">
            <form
              id="myform"
              onSubmit={this.handleReceive}
              ref={(el) => {
                this.recForm = el;
              }}
            >
              {/* <a class="close" onClick={this.reset} href="#">&times;</a> */}
              <a onClick={this.reset} href="#" class="close">&times;</a>
              {/* <a class="close" onClick={this.reset} href="#">&times;</a> */}
              <div class="AllItems">


                Item: {row.item}<br />
                Old Price: {formatter.format(row.original_price)}<br />
                For payment: {this.state.for_payment}<br />
                Supplier: {this.state.sup_name}<br />

                <hr />
                {/* <i  onClick={this.reset} data-dismiss="modal"  class="close icon"></i> */}
                <center>   Your are about to receive items.k<br />
                                          Please do have Physical counts before you confirm that you receive the items.<br />
                  <hr />
                                        The quantity of the items and prices will be<br /> reflected to your branch once you click confirm.<br /> </center>
                <hr />
                {/* -price:
                                          {this.state.priceOption}
                                          -payment:
                                          {this.state.for_payment} */}
                <div class="form-check">
                  <input class="form-check-input" onClick={this.optPay} type="checkbox" name="for_payment" id="fp" value="yes" />
                  <label class="form-check-label" for="fp">
                    This transaction is for payment to supplier
                                                            </label>
                </div>
                <div class="form-check">
                  <input class="form-check-input" onClick={this.optPrice} type="checkbox" name="priceOption" id="op" value="yes" />
                  <label class="form-check-label" for="op">
                    Pertain Item's original price
                                                            </label>
                </div>
                {/*               
                                          <div class="form-check">
                                            <input class="form-check-input" type="radio" name="priceOption" id="exampleRadios1" value="yes" onChange={this.handleChange}  />
                                            <label class="form-check-label" for="exampleRadios1">
                                              Pertain Item's original price
                                            </label>
                                          </div>
                                          
                                          <div class="form-check">
                                            <input class="form-check-input" type="radio" name="priceOption" id="exampleRadios2" value="no" onChange={this.handleChange} />
                                            <label class="form-check-label" for="exampleRadios2">
                                              Replace Item's original price 
                                            </label>
                                          </div> */}
                <br />

                <label> Supplier &nbsp;( {this.state.sup} )</label>
                <Dropdown
                  type="select"
                  placeholder='Select item'
                  fluid
                  search
                  selection
                  // style={req_inpt}
                  onChange={this.myChangeHandlerUnit}
                  options={unt}
                  id="addItem"
                  name="unit_id"
                  required
                />
                {/* data-dismiss="modal" */}
                <div style={dis_org}>
                  <label> Original Price  &nbsp; ( {this.state.unit_price} )</label>
                  <input type="number" step="0.001" name="unit_price" class="form-control mb-2 mr-sm-2" onChange={this.handleChange} />
                </div>

                <label> Quantity &nbsp; ( {this.state.quantity} )</label>
                <input type="number" required name="quantity" class="form-control mb-2 mr-sm-2" onChange={this.handleChange} />

                <button type="reset" class="btn btn-secondary" onClick={this.reset}>Reset</button> &nbsp;
                                          <button type="submit" class="btn btn-primary"   >Confirm</button>
                {/* onClick={this.receiveItem}  */}



              </div>
            </form>
          </div>
        </div>



        {/* <button type="button" class="btn btn-primary" data-toggle="modal" data-target={mod_idh} data-backdrop="static" data-keyboard="false"  data-key={row.id} onClick={this.setUpId}>
      Receive
    </button> */}

        <form class="modal fade" id={mod_id} tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div class="modal-dialog" role="document">
            <div class="modal-content">

              <div class="modal-body">

                <form

                  onSubmit={this.handleReceive}
                  ref={(el) => {
                    this.recForm = el;
                  }}
                >

                  {row.item}
                  <i type="reset" onClick={this.reset} data-dismiss="modal" class="close icon"></i>
                  <center>   Your are about to receive items.fdgfd<br />
              Please do have Physical counts before you confirm that you receive the items.<br />
                    <hr />
             The quantity of the items and prices will be<br /> reflected to your branch once you click confirm.<br /> </center>
                  <hr />
                  {/* -price:
              {this.state.priceOption}
              -payment:
              {this.state.for_payment} */}
                  <div class="form-check">
                    <input class="form-check-input" onClick={this.optPay} type="checkbox" name="for_payment" id="fp" value="yes" />
                    <label class="form-check-label" for="fp">
                      This transaction is for payment to supplier
                                </label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" onClick={this.optPrice} type="checkbox" name="priceOption" id="op" value="yes" />
                    <label class="form-check-label" for="op">
                      Pertain Item's original price
                                </label>
                  </div>
                  {/*               
               <div class="form-check">
                <input class="form-check-input" type="radio" name="priceOption" id="exampleRadios1" value="yes" onChange={this.handleChange}  />
                <label class="form-check-label" for="exampleRadios1">
                  Pertain Item's original price
                </label>
              </div>
              
              <div class="form-check">
                <input class="form-check-input" type="radio" name="priceOption" id="exampleRadios2" value="no" onChange={this.handleChange} />
                <label class="form-check-label" for="exampleRadios2">
                  Replace Item's original price 
                </label>
              </div> */}
                  <br />

                  <label> Supplier &nbsp;( {this.state.sup} )</label>
                  <Dropdown
                    type="select"
                    placeholder='Select item'
                    fluid
                    search
                    selection
                    // style={req_inpt}
                    onChange={this.myChangeHandlerUnit}
                    options={unt}
                    id="addItem"
                    name="unit_id"
                    required
                  />
                  {/* data-dismiss="modal" */}
                  <div style={dis_org}>
                    <label> Original Price  &nbsp;( {this.state.unit_price} )</label>
                    <input type="number" step="0.001" name="unit_price" class="form-control mb-2 mr-sm-2" onChange={this.handleChange} />
                  </div>

                  <label> Quantity &nbsp; ( {this.state.quantity} )</label>
                  <input type="quantity" required name="quantity" class="form-control mb-2 mr-sm-2" onChange={this.handleChange} />

                  <button type="reset" class="btn btn-secondary" onClick={this.reset}>Reset</button> &nbsp;
              <button type="submit" data-dismiss={this.state.modal} class="btn btn-primary"   >Confirm</button>
                  {/* onClick={this.receiveItem}  */}
                </form>
              </div>
              <div class="modal-footer">

              </div>
            </div>
          </div>
        </form>

      </div>
    )
  }
  buttonFormatterNew = (cell, row) => {
    const { supplier, Brand, Item_category, units } = this.state;
    const unt = supplier.map((sups) => ({ key: sups.id, value: sups.id, text: sups.name }));
    const brd = Brand.map((br) => ({ key: br.id, value: br.id, text: br.name }));
    const ict = Item_category.map((it) => ({ key: it.id, value: it.id, text: it.name }));
    const unitsm = units.map((un) => ({ key: un.id, value: un.abv, text: un.name }));
    const dis_name = this.state.dis_new_name;
    const dis_size = this.state.dis_new_size;
    const dis_unit = this.state.dis_new_unit;
    return (
      //  <button
      //  type="button"
      //  className="btn btn-primary"
      //  data-key={row.id}
      //  >
      //  Receive
      //  </button>
      <div>

        <a href="#popup2"><button class="ui button yellow create_btn" data-key={row.id} onClick={this.setUpId} type="button">Receive</button> </a>
        <div id="popup2" class="overlay2">
          <div class="purmodal1">
            <a class="close" onClick={this.reset} href="#">&times;</a>
            <div class="purch_new">

              {/* {this.state.unitOption}
                {this.state.sizeOption}
                {this.state.unit_id} */}
              <div class="inline_block">
                For Payable: {this.state.for_payment}<br />
                Name: {this.state.nameOption}<br />
                Size: {this.state.sizeOption}<br />
                unit: {this.state.unitOption}<br />
              </div>
              <div class="inline_block recDet">
                For payment: {this.state.for_payment}<br />
                Category: {this.state.cat_name}<br />
                Brand: {this.state.brand_name}<br />
                Supplier: {this.state.sup_name}<br />
              </div>
              <hr />
              <center>   Your are about to receive items.<br />
                Please do have Physical counts before you confirm that you receive the items.<br />
                <hr />
               The quantity of the items and prices will be<br /> reflected to your branch once you click confirm.<br /> </center>
              <hr />

              <form
                id="myform"
                onSubmit={this.handleReceiveNew}
                ref={(el) => {
                  this.recForm = el;
                }}
              >
                <div class="form-check">
                  <input class="form-check-input" onClick={this.optPay} type="checkbox" name="for_payment" id="fp" value="yes" />
                  <label class="form-check-label" for="fp">
                    This transaction is for payment to supplier
                                    </label>
                </div>

                <div class="form-check">
                  <input class="form-check-input" onClick={this.optName} type="checkbox" name="nameOption" value="pertain" />
                  <label class="form-check-label" for="fp">
                    Pertain requisition name
                                      </label>
                </div>


                <div class="form-check">
                  <input class="form-check-input" onClick={this.optSize} type="checkbox" name="sizeOption" value="pertain" />
                  <label class="form-check-label" for="fp">
                    Pertain measurement
                                    </label>
                </div>


                <div class="form-check">
                  <input class="form-check-input" onClick={this.opTunit} type="checkbox" name="unitOption" value="pertain" />
                  <label class="form-check-label" for="fp">
                    Pertain unit
                                    </label>
                </div>

                <hr />
                <div style={dis_name}>
                  <label> Name of Item ({this.state.new_name}) </label>
                  <input type="text" name="new_name" class="form-control mb-2 mr-sm-2" onChange={this.handleChange} />
                </div>
                <div style={dis_size}>
                  <label> Measurement  ({this.state.new_size})</label>
                  <input type="text" name="new_size" class="form-control mb-2 mr-sm-2" onChange={this.handleChange} />
                </div>
                <div style={dis_unit}>
                  <label> Unit ({this.state.unit_id})</label>
                  <Dropdown
                    type="select"
                    placeholder='Select item'
                    fluid
                    search
                    selection
                    // style={req_inpt}
                    onChange={this.myChangeHandlerUnitOrg}
                    options={unitsm}
                    id="addItem"
                    name="unit_id"
                    required
                  />
                </div>
                <br />
                <label> Category ({this.state.category_id})</label>
                <Dropdown
                  type="select"
                  placeholder='Select item'
                  fluid
                  search
                  selection
                  // style={req_inpt}
                  onChange={this.myChangeHandlerCat}
                  options={ict}
                  id="addItem"
                  name="unit_id"
                  required
                />
                <label> Brand ({this.state.brand_id})</label>
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
                  name="unit_id"
                  required
                />
                <label> Supplier ({this.state.sup})</label>
                <Dropdown
                  type="select"
                  placeholder='Select supplier'
                  fluid
                  search
                  selection
                  // style={req_inpt}
                  onChange={this.myChangeHandlerUnit}
                  options={unt}
                  id="addItem"
                  name="unit_id"
                  required
                />
                <label> Original Price ({this.state.new_unit_price})</label>
                <input type="number" required step="0.001" name="new_unit_price" class="form-control mb-2 mr-sm-2" onChange={this.handleChange} />

                <label> Quantity ({this.state.new_quantity})</label>
                <input type="number" required name="new_quantity" class="form-control mb-2 mr-sm-2" onChange={this.handleChange} />

                <button type="reset" class="btn btn-secondary" onClick={this.reset}>Reset</button> &nbsp;
                <button type="submit" class="btn btn-primary" >Confirm</button>
                {/* onClick={this.handleReceiveNew}               */}
              </form>

            </div>
          </div>
        </div>





        {/* <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#newit" data-backdrop="static" data-keyboard="false"  data-key={row.id} onClick={this.setUpId}>
        Receive
      </button> */}





        <div class="modal fade" id="newit" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div class="modal-dialog" role="document">
            <div class="modal-content">

              <div class="modal-body">
                {/* {this.state.unitOption}
                {this.state.sizeOption}
                {this.state.unit_id} */}
              For Payable: {this.state.for_payment}<br />
              Name: {this.state.nameOption}<br />
              Size: {this.state.sizeOption}<br />
              unit: {this.state.unitOption}<br />
                <center>   Your are about to receive items.<br />
                Please do have Physical counts before you confirm that you receive the items.<br />
                  <hr />
               The quantity of the items and prices will be<br /> reflected to your branch once you click confirm.<br /> </center>
                <hr />

                <form

                  onSubmit={this.handleReceiveNew}
                  ref={(el) => {
                    this.recForm = el;
                  }}
                >
                  <div class="form-check">
                    <input class="form-check-input" onClick={this.optPay} type="checkbox" name="for_payment" id="fp" value="yes" />
                    <label class="form-check-label" for="fp">
                      This transaction is for payment to supplier
                                    </label>
                  </div>

                  <div class="form-check">
                    <input class="form-check-input" onClick={this.optName} type="checkbox" name="nameOption" value="pertain" />
                    <label class="form-check-label" for="fp">
                      Pertain requisition name
                                      </label>
                  </div>


                  <div class="form-check">
                    <input class="form-check-input" onClick={this.optSize} type="checkbox" name="sizeOption" value="pertain" />
                    <label class="form-check-label" for="fp">
                      Pertain measurement
                                    </label>
                  </div>


                  <div class="form-check">
                    <input class="form-check-input" onClick={this.opTunit} type="checkbox" name="unitOption" value="pertain" />
                    <label class="form-check-label" for="fp">
                      Pertain unit
                                    </label>
                  </div>

                  <hr />
                  <div style={dis_name}>
                    <label> Name of Item </label>
                    <input type="text" name="new_name" class="form-control mb-2 mr-sm-2" onChange={this.handleChange} />
                  </div>
                  <div style={dis_size}>
                    <label> Measurement </label>
                    <input type="text" name="new_size" class="form-control mb-2 mr-sm-2" onChange={this.handleChange} />
                  </div>
                  <div style={dis_unit}>
                    <label> Unit </label>
                    <Dropdown
                      type="select"
                      placeholder='Select item'
                      fluid
                      search
                      selection
                      // style={req_inpt}
                      onChange={this.myChangeHandlerUnitOrg}
                      options={unitsm}
                      id="addItem"
                      name="unit_id"
                      required
                    />
                  </div>
                  <br />
                  <label> Category </label>
                  <Dropdown
                    type="select"
                    placeholder='Select item'
                    fluid
                    search
                    selection
                    // style={req_inpt}
                    onChange={this.myChangeHandlerCat}
                    options={ict}
                    id="addItem"
                    name="unit_id"
                    required
                  />
                  <label> Brand </label>
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
                    name="unit_id"
                    required
                  />
                  <label> Supplier </label>
                  <Dropdown
                    type="select"
                    placeholder='Select item'
                    fluid
                    search
                    selection
                    // style={req_inpt}
                    onChange={this.myChangeHandlerUnit}
                    options={unt}
                    id="addItem"
                    name="unit_id"
                    required
                  />
                  <label> Original Price </label>
                  <input type="number" required step="0.001" name="new_unit_price" class="form-control mb-2 mr-sm-2" onChange={this.handleChange} />

                  <label> Quantity</label>
                  <input type="number" required name="new_quantity" class="form-control mb-2 mr-sm-2" onChange={this.handleChange} />

                  <button type="button" class="btn btn-secondary" data-dismiss="modal" onClick={this.reset}>Cancel</button>
                  <button type="submit" class="btn btn-primary" >Confirm</button>
                  {/* onClick={this.handleReceiveNew}               */}
                </form>

              </div>

            </div>
          </div>
        </div>
      </div>
    )
  }
  render() {
    const { supplier, reqTo, reqDetails, newItem, data, error, loading } = this.state;
    const pill_form = {
      textAlign: "center",
      paddingLeft: "30%",
    };
    const up_form = {
      paddingLeft: "28%",
      width: "100%",
    };
    const up_input = {
      width: "100%",
    };
    const det_cont = { paddingLeft: "30px", };
    const unt = supplier.map((un) => ({ key: un.id, value: un.name, text: un.name }));
    return (
      <div>
        <ToastContainer />
        {/* <br /> */}
        <div class="transContN">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb-item active" aria-current="page">Receiving</li>
            <li class="breadcrumb-item active" aria-current="page">With Request</li>
            <li class="breadcrumb-item active" aria-current="page">Purchase</li>
          </ol>
        </nav>
        <center>
          {/* {this.state.upId} */}
          <div class="input-group mb-3">
            <form class="form-inline"
              method="post"
              onSubmit={this.handleSubmitCode}
              ref={(el) => {
                this.checkForm = el;
              }}
            >

              <input type="text" class="form-control" placeholder="Requisition Code" name="code" onChange={this.handleChange} />
              <div class="input-group-append">
                <button className={classNames('input-group-text', {
                  'btn-loading': loading,
                })} type="submit">Check Code</button>

              </div>
            </form>
          </div>
        </center>
        {/* {this.state.code} */}

        {/* <div class="transCont"> */}
        {
          this.state.code?
          <>
          <h2>  <b>PURCHASE</b> </h2>
          {reqDetails.map((request) => (<center><hr /> <h3>Request Details</h3> <br />{request.code}</center>))}
          {reqDetails.map((request) => (<tr><td><b>Urgency</b></td> <td style={det_cont}>{request.urgency_status}</td></tr>))}
          {reqDetails.map((request) => (<tr><td><b>Estimated Receiving Date</b></td> <td style={det_cont}>{request.estimated_receiving_date}</td></tr>))}
          {reqDetails.map((request) => (<tr><td><b>Request Type</b></td> <td style={det_cont}>{request.type}</td></tr>))}
          {reqDetails.map((request) => (<tr><td><b>Name of Requestor</b></td> <td style={det_cont}>{request.first_name}  {request.last_name}</td></tr>))}
          {reqDetails.map((request) => (<tr><td><b>Position</b></td> <td style={det_cont}>{request.position}</td></tr>))}
          {reqDetails.map((request) => (<tr><td><b>Branch Requester</b></td> <td style={det_cont}>{request.branch}</td></tr>))}
          {reqTo.map((request) => (<tr><td><b>Requesting To  </b></td> <td style={det_cont}>{request.branch}</td></tr>))}
          <hr />
              Existing Items
            <BootstrapTable
            ref='table'
            data={data}
            pagination={true}
            search={true}
          >
            <TableHeaderColumn tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} dataField='item' isKey={true}>Item</TableHeaderColumn>
            <TableHeaderColumn dataField='item_size' width="130">Measurement</TableHeaderColumn>
            <TableHeaderColumn dataField='item_unit' width="130">Unit</TableHeaderColumn>
            <TableHeaderColumn dataField='unit_price' width="130">Est. Price</TableHeaderColumn>
            <TableHeaderColumn dataField='quantity' width="130">Quantity</TableHeaderColumn>
            <TableHeaderColumn dataField='id' width="130" hidden={true}>id</TableHeaderColumn>
            <TableHeaderColumn dataField="id" width="130" dataFormat={this.buttonFormatter}>Action</TableHeaderColumn>
            <TableHeaderColumn dataField="original_price" width="130" dataSort hidden={true}>Name</TableHeaderColumn>
          </BootstrapTable>
          <hr />
            New Items
            <BootstrapTable
            ref='table'
            data={newItem}
            pagination={true}
            search={true}
          >
            <TableHeaderColumn tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} dataField='new_item' isKey={true}>Item</TableHeaderColumn>
            <TableHeaderColumn dataField='size' width="130">Measurement</TableHeaderColumn>
            <TableHeaderColumn dataField='unit' width="130">Unit</TableHeaderColumn>
            <TableHeaderColumn dataField='unit_price' width="130">Est. Price</TableHeaderColumn>
            <TableHeaderColumn dataField='quantity' width="130">Quantity</TableHeaderColumn>
            <TableHeaderColumn dataField="id" width="130" dataFormat={this.buttonFormatterNew} >Action</TableHeaderColumn>
          </BootstrapTable>
          </>
          :
          <></>
}

        </div>
        {/* {this.state.upId}
    {this.state.priceOption}
    {this.state.unit_price}
    {this.state.quantity}
    {this.state.sup}
     */}
        {/* {this.state.sup}
        {this.state.new_size}
        {this.state.unit_id}
        {this.state.category_id}
        {this.state.brand_id}
        {this.state.nameOption}
        {this.state.new_name}
        {this.state.new_unit_price}
        {this.state.new_quantity} */}

      </div>

    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: state.Auth.isAuthenticated,
  user: state.Auth.user,
});

export default connect(mapStateToProps)(Purchase);
