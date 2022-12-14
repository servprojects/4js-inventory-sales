import React, { Component, useRef } from 'react';
import { connect } from 'react-redux';
import Http from '../../Http';
import classNames from 'classnames';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NewWindow from 'react-new-window';
import { Dropdown, Menu, Icon, Dimmer, Loader, Confirm } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import update from 'immutability-helper';
import ReactToPrint, { PrintContextConsumer } from "react-to-print";
import { useReactToPrint } from 'react-to-print';
import PrintReturn from '../prints/printItemReturn';
import PrintHeader from '../prints/printHeader';
import PrintSalesHeader from '../prints/printSalesHeader';
import PrintPayCharge from '../prints/printPayCharge';
import PrintSalesFooter from '../prints/printSalesFooter';
import QrReader from 'react-qr-reader'
// import ComponentToPrint from "../toPrint";


class Sales extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);

    // Initial state.
    this.state = {
      loading: false,
      load: false,
      loadstocks: false,
      active: false,
      printdate: false,

      qty: null,
      item_id: null,
      amountRes: null,
      change: null,
      discount: null,
      cust_name: null,
      dev_add: null,
      dev_cont: null,
      set_max: null,
      delivery_fee: null,
      itm_qty: null,
      trans_code: null,
      trans_code_par: null,
      trans_code_parPc: null,
      date_printed: null,
      live_date: null,
      pay_type: "Sale",
      accountability: "Customer",
      hours: null,
      minutes: null,
      seconds: null,
      date_transac: null,
      uId: null,
      curBranch: null,
      project_id: null,
      customer_id: null,
      office_id: null,
      receipt_code: null,
      return_type: null,
      ret_id: null,

      first_name: null,
      last_name: null,
      middle_name: null,
      contact_no: null,
      address: null,

      late_date: null,

      edit_qty: { display: "none" },
      isedit_qty: "no",
      dis_deliver: { display: "none" },
      isDis_deliver: "no",
      dis_proj: { display: "none" },
      isDis_proj: "no",
      dis_cust: { display: "none" },
      isDis_cust: "no",
      dis_branch: { display: "none" },
      isDis_branch: "no",
      dis_resetDir: { display: "none" },
      btn_back_to_sales: { display: "none" },
      hide_if_payCharge: { display: "block" },
      isHide_if_payCharge: "no",
      show_payCharge_customer: { display: "none" },
      show_payCharge_charge: { display: "none" },
      show_payCharge_button: { display: "none" },
      isShow_pc_customer: "no",
      show_payCharge_project: { display: "none" },
      show_payCharge_office: { display: "none" },
      dis_devfee: { display: "none" },
      dis_discount: { display: "none" },
      isShow_pc_project: "no",
      show_itemreturn: { display: "none" },
      show_selectItem: { display: "none" },
      show_genDetails: { display: "block" },
      show_returnDetails: { display: "none" },
      show_partial: { display: "none" },
      show_partialSales: { display: "none" },


      make_debit: "no",
      debit_code: null,
      return_code: null,
      replace_code: null,
      has_replacement: "no",

      gen_code: null,
      message: null,
      chargeBalance: null,
      partialAmount: null,
      partialAmountCharge: null,
      pc_code: null,
      excess_code: null,

      cashier: null,
      branchName: null,

      allitems: [],
      itemList: [],
      selectedItems: [],
      projects: [],
      customers: [],
      branches: [],
      customerCharges: [],
      projectCharges: [],
      officeCharges: [],
      AllCustomerCharge: [],
      AllProjectCharge: [],
      AllOfficeCharge: [],
      allItemTrans: [],
      selectedCharge: [],
      transDetails: [],
      transItems: [],
      returnedItems: [],
      genItems: [],
      categories: [],
      allitemsTemp: [],
      allpaycharge: [],

      open: false,

      opensales: true
    };
    this.api = '/api/v1/transaction/sales';
  }
  // setTime() {

  //   var currentdate = new Date();
  //   // var hours = currentdate.getUTCHours() + parseInt(this.props.UTCOffset);    
  //   var hours = currentdate.getHours();
  //   var seconds;
  //   // correct for number over 24, and negatives
  //   if (hours >= 24) { hours -= 24; }
  //   if (hours < 0) { hours += 12; }

  //   // add leading zero, first convert hours to string
  //   hours = hours + "";
  //   if (hours.length == 1) { hours = "0" + hours; }

  //   // minutes are the same on every time zone
  //   var minutes = currentdate.getUTCMinutes();

  //   // add leading zero, first convert hours to string
  //   minutes = minutes + "";
  //   if (minutes.length == 1) { minutes = "0" + minutes; }

  //   var dd = String(currentdate.getDate()).padStart(2, '0');
  //   var mm = String(currentdate.getMonth() + 1).padStart(2, '0'); //January is 0!
  //   var yyyyf = String(currentdate.getFullYear());

  //   seconds = currentdate.getUTCSeconds();
  //   //   console.log(hours, minutes, seconds)
  //   this.setState({
  //     live_date: mm + "/" + dd + "/" + yyyyf + " " + hours + ":" + minutes + ":" + seconds,
  //     hours: hours,
  //     // minutes: minutes,
  //     // seconds: seconds
  //   });
  // }
  // componentWillMount() {
  //   this.setTime();
  // }
  componentDidMount() {
    this._isMounted = true
    if (this._isMounted) { this.setState({ load: true }); }
    Http.get(`${this.api}`)
      .then((response) => {
        // Code
        var userID = response.data.userId;
        if (userID.length > 2) { userID = userID.substr(2); }
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyyf = String(today.getFullYear());
        var yyyy = String(today.getFullYear());
        // var time = today.getTime();
        // var nTime = time.substr(11);
        yyyy = yyyy.substr(2);
        var nTime = String(today.getTime());
        var time = nTime.substr(0, nTime.length - 11);

        var min = 100;
        var max = 999;
        var random = Math.floor(Math.random() * (+max - +min)) + +min;
        // Code

        var hours = today.getHours();
        if (hours >= 24) { hours -= 24; }
        if (hours < 0) { hours += 12; }
        hours = hours + "";
        if (hours.length == 1) { hours = "0" + hours; }


        if (this._isMounted) {
          this.setState({

            cashier: response.data.cashier,
            branchName: response.data.branchName,
            curBranch: response.data.branch,
            // genItems: response.data.genItems,
            // allitems: response.data.items,
            allitemsTemp: response.data.items,
            // itemList: response.data.itemList,
            // itemListTemp: response.data.itemList,

            // itemList: response.data.genItems,
            // itemListTemp: response.data.genItems,

            // projects: response.data.project,
            // customers: response.data.customer,
            // AllCustomerCharge: response.data.AllCustomerCharge,
            // AllProjectCharge: response.data.AllProjectCharge,
            // AllOfficeCharge: response.data.AllOfficeCharge,
            branches: response.data.branches,
            categories: response.data.categories,
            uId: response.data.userId,
            date_transac: yyyyf + "-" + mm + "-" + dd,
            trans_code: "TR" + userID + response.data.branch + mm + dd + yyyy + hours + random,
            trans_code_par: "TR" + userID + response.data.branch + mm + dd + yyyy,
            trans_code_parPc: "PC" + userID + response.data.branch + mm + dd + yyyy,
            pc_code: "PC" + userID + response.data.branch + mm + dd + yyyy + hours + random,
            excess_code: "EC" + userID + response.data.branch + mm + dd + yyyy + hours + random,
            gen_code: userID + response.data.branch + mm + dd + yyyy,
            load: false
          });

        }
      })

      .catch(() => {
        if (this._isMounted) {
          this.setState({
            error: 'Unable to fetch data.',
            load: false
          });
        }
      });
    // this.startTime(); 
    // window.setInterval(function () {
    //   this.setTime();
    // }.bind(this), 1000);

  }
  // checkTime = (i) => {
  //   if (i < 10) {
  //     i = "0" + i;
  //   }
  //   return i;
  // }

  handleSubmitCustomer = (e) => {
    this._isMounted = true
    e.preventDefault();
    const subs = {
      first_name: this.state.first_name,
      last_name: this.state.last_name,
      middle_name: this.state.middle_name,
      contact_no: this.state.contact_no,
      address: this.state.address,
    }
    if (this._isMounted) {
      this.setState({ loading: true });
    }
    this.addCust(subs);
  };
  //  first_name: data.brand[0].brand,
  addCust = (cust) => {
    this._isMounted = true
    Http.post(`/api/v1/customer`, cust)
      .then(({ data }) => {
        toast("Customer added successfully!")
        if (this._isMounted) {
          this.setState({
            customers: data.customer,
          });

        }

        this.customerForm.reset();


      })
      .catch(() => {
        if (this._isMounted) {
          this.setState({
            error: 'Sorry, there was an error saving customer.',
          });
        }
      });
    if (this._isMounted) {
      this.setState({ loading: false });
    }
  };

  handleAddItem = (e) => {
    this._isMounted = true
    e.preventDefault();
    const subs = {
      id: this.state.item_id,
      name: "hello",
      unit_price: "89",
      Quantity: this.state.qty
    }

    this.addItem(subs);
  };

  addItem = (item) => {
    this._isMounted = true
    const { allitems, selectedItems } = this.state;
    var result = allitems.filter(function (v) {
      return v.id == item.id;
    })
    var exist = "no";
    selectedItems.map((itemex) => {
      if (itemex.id == item.id) {
        exist = "yes";
      }
    })
    var message = "Item Added successfully!";
    if (exist == "no") {
      if (result[0].unit_price == 0) {
        message = "Item not ready for release!";
      } else {
        if (this.state.qty) {
          const newItem = {
            id: this.state.item_id,
            name: result[0].name,
            unit_price: result[0].unit_price,
            Quantity: this.state.qty,
            total: this.state.qty * result[0].unit_price
          };
          const allItems = [newItem, ...this.state.selectedItems];
          if (this._isMounted) {
            this.setState({ selectedItems: allItems, item_id: null, qty: null });
          }
          this.addForm.reset();
        }
      }
    } else {
      message = "Item already exist!";
    }

    if (this.state.receipt_code) {
      var min = 10000;
      var max = 99999;
      var random = Math.floor(Math.random() * (+max - +min)) + +min;
      this.setState({ replace_code: "RP" + this.state.gen_code + random, has_replacement: "yes" });
    }

    toast(message, {
      position: toast.POSITION.BOTTOM_RIGHT,
      className: 'foo-bar'
    });

  };

  myChangeHandlerProject = (e, { value }) => {
    const { projects } = this.state;
    var result = projects.filter(function (v) {
      return v.id == value;
    })
    if (this._isMounted) {
      this.setState({ project_id: value, cust_name: result[0].name, })
    }
  };
  myChangeHandlerCustomer = (e, { value }) => {
    const { customers } = this.state;
    var result = customers.filter(function (v) {
      return v.id == value;
    })
    if (this._isMounted) {
      this.setState({ customer_id: value, cust_name: result[0].first_name + " " + result[0].last_name, })
    }
  };

  myChangeHandlerOffice = (e, { value }) => {
    const { branches } = this.state;
    var result = branches.filter(function (v) {
      return v.id == value;
    })
    if (this._isMounted) {
      this.setState({ office_id: value, cust_name: result[0].name, })
    }
  };

  myChangeHandlerCats = (e, { value }) => {
    const { allitemsTemp } = this.state;
    var result = allitemsTemp.filter(function (v) {
      return v.category_id == value;
    })
    if (this._isMounted) {
      this.setState({ allitems: result })
    }

  };

  myChangeHandlerCatStocks = (e, { value }) => {
    const { itemListTemp } = this.state;
    var result = itemListTemp.filter(function (v) {
      return v.category_id == value;
    })
    if (this._isMounted) {
      this.setState({ itemList: result })
    }

  };

  resetFilter = (e) => {
    const { allitemsTemp, itemListTemp } = this.state;

    if (this._isMounted) {
      this.setState({ allitems: allitemsTemp, itemList: itemListTemp })
    }

  };

  handlePartial = (e) => {
    const { key, trnid } = e.target.dataset;
    const { name, value } = e.target;
    const { returnedItems } = this.state;

    if (this._isMounted) {
      if (name == "partialAmount") {
        if (value > this.state.chargeBalance) {
          toast("Charge balance is only " + this.state.chargeBalance)
        } else {
          this.setState({ [name]: value });
        }
      }

      if (name == "partialAmountCharge") {

        this.setState({ [name]: value });

      }
    }
  }

  handleChange = (e) => {
    const { name, value } = e.target;

    if (this._isMounted) {

      this.setState({ [name]: value });


      if (name == "delivery_fee") {
        if (value <= 0) {
          this.setState({ dis_devfee: { display: "none" } });
        } else {
          this.setState({ dis_devfee: { display: "block" } });
        }

      }

      if (name == "discount") {
        if (value <= 0) {
          this.setState({ dis_discount: { display: "none" } });
        } else {
          this.setState({ dis_discount: { display: "block" } });
        }

      }




    }
  };
  handleReturnType = (e) => {
    const { key, trnid, itmname, uprice } = e.target.dataset;
    const { name, value } = e.target;

    if (this._isMounted) {
      this.setState({ [name]: value });
      if (name == "return_type") {

        var min = 10000;
        var max = 99999;
        var random = Math.floor(Math.random() * (+max - +min)) + +min;




        if (value != "Select") {
          const {
            // genItems, 
            returnedItems } = this.state;
          // var result = genItems.filter(function (v) {
          //   return v.id == key;
          // })
          var exist = "no";
          returnedItems.map((itemex) => {
            if (itemex.item_id == key) {
              exist = "yes";
            }
          })
          var message = "Item Added to returns";
          if (exist == "no") {
            const newItem = {
              item_id: key,
              trnItm_id: trnid,
              quantity: 1,
              unit_price: uprice,
              total: uprice * 1,
              name: itmname,
              item_debit: "no",
              status: value,
            };
            const allItems = [newItem, ...this.state.returnedItems];
            if (this._isMounted) {
              this.setState({ returnedItems: allItems, return_type: null });
            }



          } else {
            // message = "Item already exist!";
            var commentIndex = returnedItems.findIndex(function (c) {
              return c.item_id == key;
            });

            var updatedComment = update(returnedItems[commentIndex], { status: { $set: value } });

            var newData = update(returnedItems, {
              $splice: [[commentIndex, 1, updatedComment]]
            });
            if (this._isMounted) {
              this.setState({ returnedItems: newData });
            }



          }

          this.setState({ return_code: "RN" + this.state.gen_code + random, });


          toast(message, {
            position: toast.POSITION.BOTTOM_RIGHT,
            className: 'foo-bar'
          });
        }
      }
    }
  }

  handleAmountRes = (e) => {
    const { name, value } = e.target;
    if (this._isMounted) {
      this.setState({ [name]: value });
    }
  };
  myChangeHandlerItem = (e, { value }) => {
    if (this._isMounted) {
      this.setState({ item_id: value })
    }
    const { allitems } = this.state;
    var result = allitems.filter(function (v) {
      return v.id == value;
    })
    if (this._isMounted) {
      this.setState({ set_max: result[0].balance })
    }
  };

  deleteItem = (e) => {
    this._isMounted = true
    const { key, name } = e.target.dataset;
    const { selectedItems: itm, returnedItems: itmri } = this.state;


    // const index = itm.findIndex(
    //   (item) => parseInt(item.id, 10) === parseInt(key, 10),
    // );
    // const update = [...itm.slice(0, index), ...itm.slice(index + 1)];
    // if (this._isMounted) {
    //   this.setState({ selectedItems: update });

    // }

    if (name == "returned") {
      const index = itmri.findIndex(
        (item) => parseInt(item.item_id, 10) === parseInt(key, 10),
      );
      const update = [...itmri.slice(0, index), ...itmri.slice(index + 1)];
      if (this._isMounted) {
        this.setState({ returnedItems: update });

      }
      if (update === undefined || update.length == 0) {

        this.setState({ return_code: null, });
      }
    } else {
      const index = itm.findIndex(
        (item) => parseInt(item.id, 10) === parseInt(key, 10),
      );
      const update = [...itm.slice(0, index), ...itm.slice(index + 1)];
      if (this._isMounted) {
        this.setState({ selectedItems: update });

      }

      if (this.state.receipt_code) {
        if (update === undefined || update.length == 0) {
          this.setState({ replace_code: null, has_replacement: "no" });
        }
      }

    }

    toast("Item successfully deleted", {
      position: toast.POSITION.BOTTOM_RIGHT,
      className: 'foo-bar'
    });


  };
  reset = (e) => {
    this._isMounted = true
    if (this._isMounted) {
      this.setState({
        selectedItems: [],
        qty: null,
        item_id: null,
        amountRes: null,
        change: null,
        discount: null,
        set_max: null,
        cust_name: null,
        delivery_fee: null,
      });
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
  displayDeliver = (e) => {
    this._isMounted = true
    if (this._isMounted) {

      if (this.state.isDis_deliver == "yes") {
        this.setState({
          dis_deliver: { display: "none" }, isDis_deliver: "no"
        });
      } else {
        this.setState({
          dis_deliver: { display: "block" }, isDis_deliver: "yes",
          dis_proj: { display: "none" }, isDis_proj: "no",
          dis_cust: { display: "none" }, isDis_cust: "no",
          dis_branch: { display: "none" }, isDis_branch: "no"
        });
      }
    }
  };
  displayProj = (e) => {
    this._isMounted = true
    if (this._isMounted) {

      if (this.state.isDis_proj == "yes") {
        this.setState({
          dis_proj: { display: "none" }, isDis_proj: "no"
        });
      } else {
        this.setState({
          show_partialSales: { display: "block" },
          dis_proj: { display: "block" }, isDis_proj: "yes",
          dis_deliver: { display: "none" }, isDis_deliver: "no",
          dis_cust: { display: "none" }, isDis_cust: "no",
          dis_branch: { display: "none" }, isDis_branch: "no"
        });
      }

      this.setState({
        projects: [],
        customers: [],
        pay_type: "Charge",
        accountability: "Project",
        dis_resetDir: { display: "block" }
      });
      Http.post(`/api/v1/transaction/sales/projects`)
        .then((response) => {
          this.setState({
            projects: response.data.project,
          });
        })

        .catch(() => {
          if (this._isMounted) {
            this.setState({
              error: 'Unable to fetch data.',
              // loadstocks: false
            });
          }
        });


    }
  };
  getCustPayCharge = (e) => {
    this._isMounted = true
    if (this._isMounted) {


      Http.post(`/api/v1/transaction/sales/customer/charges`)
        .then((response) => {
          this.setState({
            AllCustomerCharge: response.data.AllCustomerCharge,
          });
        })
        .catch(() => {
          if (this._isMounted) {
            this.setState({
              error: 'Unable to fetch data.',
              // loadstocks: false
            });
          }
        });


    }
  };
  getProjPayCharge = (e) => {
    this._isMounted = true
    if (this._isMounted) {


      Http.post(`/api/v1/transaction/sales/project/charges`)
        .then((response) => {
          this.setState({
            AllProjectCharge: response.data.AllProjectCharge,
          });
        })
        .catch(() => {
          if (this._isMounted) {
            this.setState({
              error: 'Unable to fetch data.',
              // loadstocks: false
            });
          }
        });


    }
  };
  getOffPayCharge = (e) => {
    this._isMounted = true
    if (this._isMounted) {


      Http.post(`/api/v1/transaction/sales/office/charges`)
        .then((response) => {
          this.setState({
            AllOfficeCharge: response.data.AllOfficeCharge,
          });
        })
        .catch(() => {
          if (this._isMounted) {
            this.setState({
              error: 'Unable to fetch data.',
              // loadstocks: false
            });
          }
        });


    }
  };
  displayCust = (e) => {
    this._isMounted = true
    if (this._isMounted) {

      if (this.state.isDis_cust == "yes") {
        this.setState({
          dis_cust: { display: "none" }, isDis_cust: "no"
        });
      } else {
        this.setState({
          show_partialSales: { display: "block" },
          dis_cust: { display: "block" }, isDis_cust: "yes",
          dis_deliver: { display: "none" }, isDis_deliver: "no",
          dis_proj: { display: "none" }, isDis_proj: "no",
          dis_branch: { display: "none" }, isDis_branch: "no"
        });
      }
      this.setState({
        projects: [],
        pay_type: "Charge",
        accountability: "Customer",
        dis_resetDir: { display: "block" }
      });

      Http.post(`/api/v1/transaction/sales/customers`)
        .then((response) => {
          this.setState({
            customers: response.data.customer,
          });
        })

        .catch(() => {
          if (this._isMounted) {
            this.setState({
              error: 'Unable to fetch data.',
              // loadstocks: false
            });
          }
        });


    }
  };

  display_pay_chargeF = (e) => {
    const { key } = e.target.dataset;
    this._isMounted = true
    if (this._isMounted) {
      var min = 10000;
      var max = 99999;
      var random = Math.floor(Math.random() * (+max - +min)) + +min;
      this.setState({
        AllOfficeCharge: [],
        AllProjectCharge: [],
        AllCustomerCharge: [],
        projects: [],
        customers: [],
        selectedCharge: [],
        allCharges: [],
        chargeBalance: null,
        show_itemreturn: { display: "none" },
        show_genDetails: { display: "block" },
        // show_genDetails: { display: "none" },
        show_returnDetails: { display: "none" },
        show_partial: { display: "none" },
        show_partialSales: { display: "none" },
      });
      // if (this.state.isHide_if_payCharge == "yes") {
      if (key == "sales") {
        this.setState({
          hide_if_payCharge: { display: "block" },
          isHide_if_payCharge: "no",
          show_payCharge_customer: { display: "none" },
          show_payCharge_project: { display: "none" },
          show_payCharge_office: { display: "none" },
          show_payCharge_button: { display: "none" },
          show_payCharge_charge: { display: "none" },
          selectedCharge: [],
          accountability: "Customer",
          pay_type: "Sale",
          trans_code: this.state.trans_code_par + random,
          cust_name: null,
          customer_id: null,
          btn_back_to_sales: { display: "none" },
          show_itemreturn: { display: "none" },
          show_partial: { display: "none" },
          // customerCharges: []
        });

      } else {
        this.setState({
          btn_back_to_sales: { display: "block" },
          show_payCharge_button: { display: "block" },
          show_payCharge_charge: { display: "block" },
          show_genDetails: { display: "none" },

        });

        if (key == "customer") {
          this.getCustPayCharge();
          this.setState({
            show_payCharge_customer: { display: "block" },
            show_payCharge_project: { display: "none" },
            show_payCharge_office: { display: "none" },
            // isHide_if_payCharge: "yes",
            accountability: "Customer",
          });
        }
        if (key == "project") {
          this.getProjPayCharge();
          this.setState({
            show_payCharge_customer: { display: "none" },
            show_payCharge_project: { display: "block" },
            show_payCharge_office: { display: "none" },
            accountability: "Project",
          });
        }
        if (key == "office") {
          this.getOffPayCharge();
          this.setState({
            show_payCharge_customer: { display: "none" },
            show_payCharge_project: { display: "none" },
            show_payCharge_office: { display: "block" },
            accountability: "Maintenance",
          });
        }

        this.setState({
          hide_if_payCharge: { display: "none" },
          pay_type: "Payment Charge",
          trans_code: this.state.trans_code_parPc + random,
          // customerCharges: [],
          // officeCharges: [],
          // projectCharges: [],
        });



      }

    }
  };
  displayBranch = (e) => {
    this._isMounted = true
    if (this._isMounted) {

      if (this.state.isDis_branch == "yes") {
        this.setState({
          dis_branch: { display: "none" }, isDis_branch: "no"
        });
      } else {
        this.setState({
          show_partialSales: { display: "block" },
          dis_branch: { display: "block" }, isDis_branch: "yes",
          dis_deliver: { display: "none" }, isDis_deliver: "no",
          dis_proj: { display: "none" }, isDis_proj: "no",
          dis_cust: { display: "none" }, isDis_cust: "no"
        });
      }
      this.setState({
        projects: [],
        customers: [],
        pay_type: "Charge",
        accountability: "Maintenance",
        dis_resetDir: { display: "block" }
      });
    }
  };

  getAllstocks = (e) => {
    this._isMounted = true
    if (this._isMounted) {
      if (this._isMounted) { this.setState({ loadstocks: true }); }
      Http.post(`/api/v1/transaction/sales/stocks`)
        .then((response) => {
          this.setState({
            // genItems: response.data.genItems,
            itemList: response.data.genItems,
            itemListTemp: response.data.genItems,
            loadstocks: false,
            // projects: [],
            // customers: [],
            // AllCustomerCharge: [],
          });
        })

        .catch(() => {
          if (this._isMounted) {
            this.setState({
              error: 'Unable to fetch data.',
              loadstocks: false
            });
          }
        });

    }
  };

  //  getAllstocks = (e) => {
  //     this._isMounted = true
  //     if (this._isMounted) {
  //       // if (this._isMounted) { this.setState({ loadstocks: true }); }
  //       Http.post(`/api/v1/transaction/sales/stocks`)
  //         .then((response) => {
  //           this.setState({

  //              customers: response.data.customer,
  //             // loadstocks: false
  //           });
  //         })

  //         .catch(() => {
  //           if (this._isMounted) {
  //             this.setState({
  //               error: 'Unable to fetch data.',
  //               // loadstocks: false
  //             });
  //           }
  //         });

  //     }
  //   };

  // getAllcust = (e) => {
  //     this._isMounted = true
  //     if (this._isMounted) {
  //       if (this._isMounted) { this.setState({ loadstocks: true }); }
  //       Http.post(`/api/v1/transaction/sales/customers`)
  //         .then((response) => {
  //           this.setState({
  //             // genItems: response.data.genItems,
  //             itemList: response.data.genItems,
  //             itemListTemp: response.data.genItems,
  //             loadstocks: false
  //           });
  //         })

  //         .catch(() => {
  //           if (this._isMounted) {
  //             this.setState({
  //               error: 'Unable to fetch data.',
  //               loadstocks: false
  //             });
  //           }
  //         });

  //     }
  //   };

  resetDirectSales = (e) => {
    this._isMounted = true
    if (this._isMounted) {

      this.setState({
        projects: [],
        customers: [],
        pay_type: "Sale",
        accountability: "Customer",
        cust_name: null,
        project_id: null,
        edit_qty: { display: "none" },
        isedit_qty: "no",
        // dis_deliver: {display: "none"},
        // isDis_deliver: "no",
        dis_proj: { display: "none" },
        isDis_proj: "no",
        dis_cust: { display: "none" },
        isDis_cust: "no",
        dis_branch: { display: "none" },
        isDis_branch: "no",
        show_partialSales: { display: "none" },
        dis_resetDir: { display: "none" },
      });
      this.fcustname.reset();
    }
  };
  display_itemreturn = (e) => {
    const { key } = e.target.dataset;
    this._isMounted = true
    if (this._isMounted) {
      this.setState({
        projects: [],
        customers: [],
        AllCustomerCharge: [],
        AllProjectCharge: [],
        AllOfficeCharge: [],
        show_partialSales: { display: "none" },
        hide_if_payCharge: { display: "none" },
        btn_back_to_sales: { display: "block" },
        isHide_if_payCharge: "yes",
        show_payCharge_customer: { display: "none" },
        show_payCharge_charge: { display: "none" },
        show_payCharge_project: { display: "none" },
        show_payCharge_office: { display: "none" },
        show_payCharge_button: { display: "none" },
        show_itemreturn: { display: "block" },
        show_genDetails: { display: "none" },
        show_returnDetails: { display: "block" },
        show_partial: { display: "none" },
      });
    }
  }
  getReceipt = (e) => {
    this._isMounted = true
    e.preventDefault();

    // this.setState({ active: true });

    // transItems: [],
    Http.post('/api/v1/transaction/return/getcode', { code: this.state.receipt_code })
      .then((response) => {


        // if (response.status === 100) {
        if (response.data.transaction === undefined || response.data.transaction.length == 0) {
          toast("No existing transaction")
          if (this._isMounted) {
            this.setState({
              show_selectItem: { display: "none" },
              transDetails: [],
              transItems: [],
              selectedItems: [],
              receipt_code: null,
              return_type: null,
            });
          }
          // } else if (response.status === 200) {
        } else {
          if (this._isMounted) {
            this.setState({
              show_selectItem: { display: "block" },
              transDetails: response.data.transaction, transItems: response.data.items
            });
          }
          toast("Receipt Exist")
        }

      })
      .catch(() => {

        toast("Error getting request!")


      });

  };

  SubmitAll = (e) => {
    this._isMounted = true
    const { selectedItems } = this.state;
    // e.preventDefault();
    const { key } = e.target.dataset;
    var trans_date = this.state.date_transac;
    if (this.state.late_date) {
      trans_date = this.state.late_date;
    }
    const subs = {
      transaction_type: this.state.pay_type,
      accountability: this.state.accountability,
      discount: this.state.discount,
      customer_name: this.state.cust_name,
      amount_received: this.state.amountRes,
      trasaction_code: this.state.trans_code,
      // date_printed: this.state.live_date,
      date_transac: trans_date,
      payable: key,
      partial: this.state.partialAmountCharge,
      pc_code: this.state.pc_code,
      delivery_fee: parseInt(this.state.delivery_fee),
      address: this.state.dev_add,
      contact: this.state.dev_cont,
      uId: this.state.uId,
      project_id: this.state.project_id,
      customer_id: this.state.customer_id,
      office_id: this.state.office_id,
      items: JSON.stringify(selectedItems)

    }
    if (this._isMounted) { this.setState({ loading: true }); }
    if (selectedItems === undefined || selectedItems.length == 0) {
      if (this._isMounted) { this.setState({ loading: false }); }
      toast("TRANSACTION EMPTY")
    } else {
      if (this._isMounted) { this.setState({ loading: true }); }
      if (this.state.pay_type == "Charge") {
        this.addSales(subs);
      } else {
        if (this.state.cust_name && this.state.amountRes) {
          this.addSales(subs);

        } else {
          if (this._isMounted) { this.setState({ loading: false }); }
          toast("Make sure your amount received or customer name is not empty")
        }
      }


    }

  };

  addSales = (subs) => {
    this._isMounted = true
    // Http.post(`/api/v1/transaction/pos`, subs)
    Http.post(`/api/v1/transaction/addsales`, subs)
      .then(({ data }) => {



        if (data.validation == 90) {
          toast("Transaction already recorded");
          if (this._isMounted) { this.setState({ loading: false }); }
        } else if (data.validation == 100) {
          toast("TRANSACTION FAILED");
          this.setState({
            message: data.message,
            allitems: data.items,
            loading: false
          });
        } else {

          var min = 100;
          var max = 999;
          var random = Math.floor(Math.random() * (+max - +min)) + +min;

          if (this._isMounted) { this.setState({ printdate: data.printdate }); }
          this.ref.handlePrint();//PRINT

          if (this._isMounted) {
            this.setState({
              allitems: data.items,
              // itemList: data.itemList,
              // AllCustomerCharge: data.AllCustomerCharge,
              // AllProjectCharge: data.AllProjectCharge,
              // AllOfficeCharge: data.AllOfficeCharge,
              selectedItems: [],
              qty: null,
              printdate: null,
              item_id: null,
              amountRes: null,
              change: null,
              discount: null,
              set_max: null,
              cust_name: null,
              delivery_fee: null,
              dev_add: null,
              dev_cont: null,
              message: null,
              pay_type: "Sale",
              accountability: "Customer",
              trans_code: this.state.trans_code_par + this.state.hours + random,
              loading: false
              // message: data.message,
              // message: "whhhaaaat",
            });

          }
          this.addForm.reset(); this.fdiscount.reset(); this.fdevs.reset(); this.famres.reset(); this.fchange.reset(); this.fcustname.reset();
          toast("TRANSACTION COMPLETE");


        }
      })
      .catch(() => {

        toast("TRANSACTION FAILED")
        if (this._isMounted) { this.setState({ loading: false }); }
      });
  };

  submitCharge = (e) => {
    this._isMounted = true
    const { selectedCharge } = this.state;
    const { key } = e.target.dataset;
    var trans_date = this.state.date_transac;
    if (this.state.late_date) {
      trans_date = this.state.late_date;
    }
    const subs = {
      transaction_type: this.state.pay_type,
      accountability: this.state.accountability,
      discount: this.state.discount,
      customer_name: this.state.cust_name,
      amount_received: this.state.amountRes,
      trasaction_code: this.state.trans_code,
      // date_printed: this.state.live_date,
      date_transac: trans_date,
      payable: key,
      uId: this.state.uId,
      project_id: this.state.project_id,
      customer_id: this.state.customer_id,
      office_id: this.state.office_id,
      items: JSON.stringify(selectedCharge)

    }
    if (this._isMounted) { this.setState({ loading: true }); }
    // if (selectedCharge === undefined || selectedCharge.length == 0) {
    if (this.state.amountRes) {
      if (this.state.amountRes) {

        Http.post(`/api/v1/transaction/sales/paycharge/pos`, subs)
          .then(({ data }) => {
            if (data.validation == 90) {
              if (this._isMounted) { this.setState({ loading: false }); }
              toast("Transaction already recorded");

            } else {
              var min = 10000;
              var max = 99999;
              var random = Math.floor(Math.random() * (+max - +min)) + +min;
              if (this._isMounted) { this.setState({ printdate: data.printdate }); }
              this.payprt.handlePrint();//PRINT
              if (this._isMounted) {
                this.setState({
                  // AllProjectCharge: data.AllProjectCharge,
                  // AllCustomerCharge: data.AllCustomerCharge,
                  // AllOfficeCharge: data.AllOfficeCharge,
                  // customerCharges: data.customerCharges,
                  // projectCharges: data.projectCharges,
                  // officeCharges: data.officeCharges,
                  printdate: null,
                  allpaycharge: data.allpaycharge,
                  selectedCharge: [],
                  cust_name: null,
                  delivery_fee: null,
                  loading: false,
                  trans_code: this.state.trans_code_parPc + random,
                  chargeBalance: data.balance,
                });

              }
              this.addForm.reset(); this.fdiscount.reset(); this.fdevs.reset(); this.famres.reset(); this.fchange.reset(); this.fcustname.reset();
              toast("TRANSACTION COMPLETE");

            }


          })
          .catch(() => {
            if (this._isMounted) { this.setState({ loading: false }); }
            toast("TRANSACTION FAILED")

          });

      } else {
        if (this._isMounted) { this.setState({ loading: false }); }
        toast("Make sure your amount received is not empty")
      }
    } else {
      if (this._isMounted) { this.setState({ loading: false }); }
      toast("AMOUNT RECEIVED EMPTY")
    }




  };

  submitReturn = (e) => {
    this._isMounted = true
    const { selectedItems, returnedItems } = this.state;
    const { key } = e.target.dataset;
    var trans_date = this.state.date_transac;
    if (this.state.late_date) {
      trans_date = this.state.late_date;
    }
    const subs = {

      uId: this.state.uId,
      original_code: this.state.receipt_code,
      debit_code: this.state.debit_code,
      return_code: this.state.return_code,
      excess_code: this.state.excess_code,
      replace_code: this.state.replace_code,
      // date_printed: this.state.live_date,
      date_transac: trans_date,
      make_debit: this.state.make_debit,
      has_replacement: this.state.has_replacement,
      returned_items: JSON.stringify(returnedItems),
      replaced_items: JSON.stringify(selectedItems),
      payable: key,


    }
    if (this._isMounted) { this.setState({ loading: true }); }
    if (returnedItems === undefined || returnedItems.length == 0) {
      if (this._isMounted) { this.setState({ loading: false }); }
      toast("TRANSACTION EMPTY")
    } else {
      // if (this.state.amountRes) {

      // Http.post(`/api/v1/transaction/returnItem`, subs)
      Http.post(`/api/v1/return`, subs)
        .then(({ data }) => {

          if (data.validation == 90) {
            if (this._isMounted) { this.setState({ loading: false }); }
            toast("Transaction already recorded");

          } else if (data.validation == 100) {
            if (this._isMounted) { this.setState({ loading: false }); }
            toast("TRANSACTION FAILED");
            this.setState({
              message: data.message,
              allitems: data.items,
            });
          } else {
            // var min = 100;
            // var max = 999;
            // var random = Math.floor(Math.random() * (+max - +min)) + +min;
            if (this._isMounted) { this.setState({ printdate: data.printdate }); }
            this.returnprt.handlePrint();//PRINT
            if (this._isMounted) {
              this.setState({
                // AllProjectCharge: data.AllProjectCharge,
                // AllCustomerCharge: data.AllCustomerCharge,
                // AllOfficeCharge: data.AllCustomerCharge,
                // customerCharges: data.customerCharges,
                // projectCharges: data.projectCharges,
                // officeCharges: data.officeCharges,
                printdate: null,
                allitems: data.items,
                transItems: [],
                returnedItems: [],
                selectedItems: [],
                make_debit: "no",
                debit_code: null,
                return_code: null,
                replace_code: null,
                loading: false,
                has_replacement: "no",
              });

            }
            // this.addForm.reset(); this.fdiscount.reset(); this.fdevs.reset(); this.famres.reset(); this.fchange.reset(); this.fcustname.reset();
            toast("TRANSACTION COMPLETE");
          }

        })
        .catch(() => {
          if (this._isMounted) { this.setState({ loading: false }); }
          toast("TRANSACTION FAILED")

        });

      // } else {
      //   toast("Make sure your amount received is not empty")
      // }

    }




  };

  updateQty = (e) => {
    this._isMounted = true

    const { key, name } = e.target.dataset;
    const { value } = e.target;
    const { allitems, transItems, returnedItems } = this.state;

    if (name == "returned") {
      var result = transItems.filter(function (v) {
        return v.id == key;
      })


      if (value == 0) {
        toast("Item quantity must greater than 0", {
          position: toast.POSITION.BOTTOM_RIGHT,
          className: 'foo-bar'
        });
      } else if (value > result[0].quantity) {
        toast("Enter quantiy below or equal to previous quantity", {
          position: toast.POSITION.BOTTOM_RIGHT,
          className: 'foo-bar'
        });
      } else {
        var commentIndex = returnedItems.findIndex(function (c) {
          return c.item_id == key;
        });

        var resultret = returnedItems.filter(function (v) {
          return v.item_id == key;
        })

        var updatedComment = update(returnedItems[commentIndex], { quantity: { $set: value }, total: { $set: value * resultret[0].unit_price } });

        var newData = update(returnedItems, {
          $splice: [[commentIndex, 1, updatedComment]]
        });
        if (this._isMounted) {
          this.setState({ returnedItems: newData });
        }
        toast("Item successfully updated", {
          position: toast.POSITION.BOTTOM_RIGHT,
          className: 'foo-bar'
        });

      }
    } else {


      var result = allitems.filter(function (v) {
        return v.id == key;
      })
      var selectedItems = this.state.selectedItems;

      if (value == 0) {
        toast("Item quantity must greater than 0", {
          position: toast.POSITION.BOTTOM_RIGHT,
          className: 'foo-bar'
        });
      } else if (value > result[0].balance) {
        toast("Item balance is not enough", {
          position: toast.POSITION.BOTTOM_RIGHT,
          className: 'foo-bar'
        });
      } else {
        var commentIndex = selectedItems.findIndex(function (c) {
          return c.id == key;
        });

        var updatedComment = update(selectedItems[commentIndex], { Quantity: { $set: value }, total: { $set: value * result[0].unit_price } });

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

    }

  };

  updateDebit = (e) => {
    this._isMounted = true

    const { key } = e.target.dataset;
    const { value, name } = e.target;
    const { returnedItems } = this.state;

    var min = 10000;
    var max = 99999;
    var random = Math.floor(Math.random() * (+max - +min)) + +min;


    if (value != "Select") {
      var commentIndex = returnedItems.findIndex(function (c) {
        return c.item_id == key;
      });

      var updatedComment = update(returnedItems[commentIndex], { item_debit: { $set: value } });

      var newData = update(returnedItems, {
        $splice: [[commentIndex, 1, updatedComment]]
      });
      if (this._isMounted) {
        this.setState({ returnedItems: newData });
      }

      var exist = "no";
      newData.map((itemex) => {
        if (itemex.item_debit == "yes") {
          exist = "yes";
        }
      })

      if (exist == "no") {
        this.setState({ make_debit: "no", debit_code: null });
      } else {
        this.setState({
          make_debit: "yes",
          debit_code: "DB" + this.state.gen_code + random,
        });
      }

      toast("Item successfully updated", {
        position: toast.POSITION.BOTTOM_RIGHT,
        className: 'foo-bar'
      });
    }


  };
  // get charge data

  getCustomerCharge = (e, { value }) => {
    this._isMounted = true
    // const { customers } = this.state;
    // var result = customers.filter(function (v) {
    //   return v.id == value;
    // })
    if (this._isMounted) {
      this.setState({ customer_id: value })
      // this.setState({ customer_id: value, cust_name: result[0].first_name + " " + result[0].last_name, })
    }
    Http.post(`/api/v1/transaction/sales/charge/customer`, { customer_id: value })
      .then(({ data }) => {
        if (this._isMounted) {
          this.setState({
            selectedCharge: [],
            customerCharges: data.transaction,
            allCharges: data.transaction,
            allpaycharge: data.allpaycharge,
            chargeBalance: data.balance,
            cust_name: data.name,
            show_partial: { display: "block" },
          });
          // console.log(data.name)
          // console.log(value)
        }
      })
      .catch(() => {
        toast("Failed to get data")
      });


  };

  getOffCharge = (e, { value }) => {
    this._isMounted = true
    const { branches } = this.state;
    var result = branches.filter(function (v) {
      return v.id == value;
    })
    if (this._isMounted) {
      this.setState({ office_id: value, cust_name: result[0].name, })
    }
    Http.post(`/api/v1/transaction/sales/charge/office`, { office_id: value })
      .then(({ data }) => {
        if (this._isMounted) {
          this.setState({
            selectedCharge: [],
            officeCharges: data.transaction,
            allCharges: data.transaction,
            allpaycharge: data.allpaycharge,
            chargeBalance: data.balance,
            show_partial: { display: "block" },
          });
        }
      })
      .catch(() => {
        toast("Failed to get data")
      });


  };
  getProjCharge = (e, { value }) => {
    this._isMounted = true
    const { projects } = this.state;
    var result = projects.filter(function (v) {
      return v.id == value;
    })
    if (this._isMounted) {
      // this.setState({ project_id: value, cust_name: result[0].name, })
      this.setState({ project_id: value })
    }
    Http.post(`/api/v1/transaction/sales/charge/project`, { project_id: value })
      .then(({ data }) => {
        if (this._isMounted) {
          this.setState({
            selectedCharge: [],
            projectCharges: data.transaction,
            allCharges: data.transaction,
            allpaycharge: data.allpaycharge,
            chargeBalance: data.balance,
            show_partial: { display: "block" },
          });
        }
      })
      .catch(() => {
        toast("Failed to get data")
      });


  };


  buttonFormatter = (cell, row) => {
    const dis = this.state.edit_qty;
    return (

      <div>
        {/* <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#exampleModal"  data-key={row.id}> */}
        <i onClick={this.deleteItem} data-key={row.id} class="minus square icon"></i>
        <i data-key={row.id} onClick={this.displayQty} class="pencil alternate icon"></i>
        <div>
          <input type="text" style={dis} data-key={row.id} onChange={this.updateQty} class="form-control form-control-lg qtyInpt" name="itm_qty" required placeholder="Qty" />
        </div>
        {/* </button> */}

      </div>
    )
  }
  buttonFormatter_upret = (cell, row) => {
    const dis = this.state.edit_qty;
    return (

      <div>
        {/* <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#exampleModal"  data-key={row.id}> */}
        {/* <i onClick={this.deleteItem} data-key={row.id} class="minus square icon"></i> */}
        <i data-key={row.id} onClick={this.displayQty} class="pencil alternate icon"></i>
        <div>
          <input type="number" style={dis} data-key={row.item_id} data-name="returned" onChange={this.updateQty} class="form-control form-control-lg qtyInpt" name="itm_qty" required placeholder="Qty" />
        </div>
        {/* </button> */}

      </div>
    )
  }
  buttonFormatter_upDebit = (cell, row) => {
    const dis = this.state.edit_qty;
    return (

      <div>

        <div>
          {row.item_debit}
          <select class="form-control" style={dis} name="item_debit " data-key={row.item_id} data-trnid={row.trnItm_id} onChange={this.updateDebit}>
            <option >Select</option>
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
          {/* <input type="number" style={dis} data-key={row.item_id} data-name="returned" onChange={this.updateQty} class="form-control form-control-lg qtyInpt" name="itm_qty" required placeholder="Qty" /> */}
        </div>


      </div>
    )
  }
  buttonFormatterReturn = (cell, row) => {
    const dis = this.state.edit_qty;
    return (

      <div>


        <select class="form-control" name="return_type" data-itmname={row.item} data-uprice={row.unit_price} data-key={row.id} data-trnid={row.trnItm_id} onChange={this.handleReturnType}>
          <option >Select</option>
          <option value="Defective">Defective</option>
          <option value="Good Condition">Good Condition</option>
        </select>

      </div>
    )
  }
  buttonFormatterRturned = (cell, row) => {

    return (

      <div>

        <i onClick={this.deleteItem} data-key={row.item_id} data-name="returned" class="minus square icon"></i>

      </div>
    )
  }
  buttonChargeItemsBox = (cell, row) => {
    const dis = this.state.edit_qty;
    return (

      <div>

        <i data-key={row.t_id} data-acc={row.accountability} data-payable={row.payable} onClick={this.addCharge} class={row.icon}></i>
      </div>
    )
  }
  addCharge = (e) => {
    this._isMounted = true
    const { key, payable, acc } = e.target.dataset;
    const { customerCharges, officeCharges, projectCharges, selectedCharge } = this.state;

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
        payable: payable
      };
      const allItems = [newItem, ...this.state.selectedCharge];
      if (this._isMounted) {
        this.setState({ selectedCharge: allItems });
      }


      if (acc == "Customer") {
        // update icon
        var commentIndex = customerCharges.findIndex(function (c) {
          return c.t_id == key;
        });

        var updatedComment = update(customerCharges[commentIndex], { icon: { $set: "minus icon" } });

        var newData = update(customerCharges, {
          $splice: [[commentIndex, 1, updatedComment]]
        });
        if (this._isMounted) {
          this.setState({ customerCharges: newData });
        }

      } else if (acc == "Project") {
        // update icon
        var commentIndex = projectCharges.findIndex(function (c) {
          return c.t_id == key;
        });

        var updatedComment = update(projectCharges[commentIndex], { icon: { $set: "minus icon" } });

        var newData = update(projectCharges, {
          $splice: [[commentIndex, 1, updatedComment]]
        });
        if (this._isMounted) {
          this.setState({ projectCharges: newData });
        }

      } else if (acc == "Maintenance") {
        // update icon
        var commentIndex = officeCharges.findIndex(function (c) {
          return c.t_id == key;
        });

        var updatedComment = update(officeCharges[commentIndex], { icon: { $set: "minus icon" } });

        var newData = update(officeCharges, {
          $splice: [[commentIndex, 1, updatedComment]]
        });
        if (this._isMounted) {
          this.setState({ officeCharges: newData });
        }
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

      if (acc == "Customer") {
        // update icon
        var commentIndex = customerCharges.findIndex(function (c) {
          return c.t_id == key;
        });

        var updatedComment = update(customerCharges[commentIndex], { icon: { $set: "plus icon" } });

        var newData = update(customerCharges, {
          $splice: [[commentIndex, 1, updatedComment]]
        });
        if (this._isMounted) {
          this.setState({ customerCharges: newData });
        }

      } else if (acc == "Project") {
        // update icon
        var commentIndex = projectCharges.findIndex(function (c) {
          return c.t_id == key;
        });

        var updatedComment = update(projectCharges[commentIndex], { icon: { $set: "plus icon" } });

        var newData = update(projectCharges, {
          $splice: [[commentIndex, 1, updatedComment]]
        });
        if (this._isMounted) {
          this.setState({ projectCharges: newData });
        }

      } else if (acc == "Maintenance") {
        // update icon
        var commentIndex = officeCharges.findIndex(function (c) {
          return c.t_id == key;
        });

        var updatedComment = update(officeCharges[commentIndex], { icon: { $set: "plus icon" } });

        var newData = update(officeCharges, {
          $splice: [[commentIndex, 1, updatedComment]]
        });
        if (this._isMounted) {
          this.setState({ officeCharges: newData });
        }
      }

    }
    // addCharge = (e) => {
    //   this._isMounted = true
    //   const { key, payable } = e.target.dataset;
    //   const { customerCharges, selectedCharge } = this.state;

    //   var exist = "no";
    //   selectedCharge.map((itemex) => {
    //     if (itemex.id == key) {
    //       exist = "yes";
    //     }
    //   })
    //   // var message = "Charge Added successfully!";
    //   if (exist == "no") {
    //     const newItem = {
    //       id: key,
    //       payable: payable
    //     };
    //     const allItems = [newItem, ...this.state.selectedCharge];
    //     if (this._isMounted) {
    //       this.setState({ selectedCharge: allItems });
    //     }
    //     // update icon
    //     var commentIndex = customerCharges.findIndex(function (c) {
    //       return c.t_id == key;
    //     });

    //     var updatedComment = update(customerCharges[commentIndex], { icon: { $set: "minus icon" } });

    //     var newData = update(customerCharges, {
    //       $splice: [[commentIndex, 1, updatedComment]]
    //     });
    //     if (this._isMounted) {
    //       this.setState({ customerCharges: newData });
    //     }


    //   } else {


    //     const { selectedCharge: itm } = this.state;
    //     const index = itm.findIndex(
    //       (item) => parseInt(item.id, 10) === parseInt(key, 10),
    //     );
    //     const remove = [...itm.slice(0, index), ...itm.slice(index + 1)];
    //     if (this._isMounted) {
    //       this.setState({ selectedCharge: remove });
    //     }

    //     // update icon
    //     var commentIndex = customerCharges.findIndex(function (c) {
    //       return c.t_id == key;
    //     });

    //     var updatedComment = update(customerCharges[commentIndex], { icon: { $set: "plus icon" } });

    //     var newData = update(customerCharges, {
    //       $splice: [[commentIndex, 1, updatedComment]]
    //     });
    //     if (this._isMounted) {
    //       this.setState({ customerCharges: newData });
    //     }

    //   }
    // toast(message, {
    //   position: toast.POSITION.BOTTOM_RIGHT,
    //   className: 'foo-bar'
    // });

  };
  setUpId = (e) => {
    this._isMounted = true
    const { key } = e.target.dataset;
    // if (this._isMounted) {
    //   this.setState({ upIdItem: key })
    // }

    Http.post(`/api/v1/reports/receiveditems`, { id: key })
      .then((response) => {
        // const { data } = response.data.transaction.data;
        if (this._isMounted) {

          this.setState({

            allItemTrans: response.data.allItemTrans,

          });
        }
      })

      .catch(() => {
        toast("Failed to get data")
      });
  };
  // heres
  refreshStocks = (e) => {
    this._isMounted = true

    if (this._isMounted) { this.setState({ loadstocks: true }); }
    Http.post(`/api/v1/transaction/refreshstocks`)
      .then((response) => {

        if (this._isMounted) {

          this.setState({

            // genItems: response.data.allitems,
            itemList: response.data.allitems,
            itemListTemp: response.data.allitems,
            loadstocks: false

          });
          toast("Stocks updated")
        }
      })

      .catch(() => {
        if (this._isMounted) { this.setState({ loadstocks: false }); }
        toast("Failed to get data")
      });
  };
  clearStocks = (e) => {
    this._isMounted = true
    this.setState({
      itemList: [],
      itemListTemp: [],

    });
    toast("Stocks cleared")
  }
  buttonChargeItems = (cell, row) => {
    const { allItemTrans } = this.state;
    const dis = this.state.edit_qty;
    const iditH = "#cItems" + row.t_id;
    const idit = "cItems" + row.t_id;
    return (

      <div>
        <a href={iditH} data-key={row.t_id} onClick={this.setUpId}><i data-key={row.t_id} onClick={this.setUpId} class="list icon"></i></a>
        <div id={idit} class="overlay">
          <div class="popup">
            <h2>All Items</h2><br />{row.code}
            <a class="close" href="#">&times;</a>
            <div class="AllItemsCharge">
              <BootstrapTable
                ref='table'
                data={allItemTrans}
                pagination={false}
                search={true}
                maxHeight="500px"
              // options={options} exportCSV
              >
                <TableHeaderColumn tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} dataField='item_name' isKey={true}>Item Name</TableHeaderColumn>
                <TableHeaderColumn dataField='quantity'>Quantity</TableHeaderColumn>
                <TableHeaderColumn dataField='original_price'>Price</TableHeaderColumn>
              </BootstrapTable>
            </div>
          </div>
        </div>

      </div>
    )
  }
  onSearchChange = (e, value) => {
    const { allitemsTemp } = this.state;
    this._isMounted = true
    // if (this._isMounted) {
    //   this.setState({ loading: true })
    // }
    // console.log(value.searchQuery)
    var n = value.searchQuery
    var val = n.toString();
    const result = allitemsTemp.filter(function (data) {
      if (val == null) {
        return []
      }
      else
        if (data.code.toLowerCase().includes(val.toLowerCase()) || data.name.toLowerCase().includes(val.toLowerCase())) {
          return data
        }
    }
    )

    // console.log(result)

    if (this._isMounted) {
      this.setState({ allitems: result, loading: false })
    }

  }
  origPriceCode = (cell, row) => {
    const origCode = [{ let: "P", num: 1 }, { let: "I", num: 2 }, { let: "N", num: 3 }, { let: "K", num: 4 }, { let: "F", num: 5 },
    { let: "L", num: 6 }, { let: "O", num: 7 }, { let: "W", num: 8 }, { let: "E", num: 9 }, { let: "R", num: 0 }, { let: ".", num: "." }
    ]


    //   var number = row.original_price,
    //     output = [],
    //     sNumber = number.toString();

    // for (var i = 0, len = sNumber.length; i < len; i += 1) {
    //   var result = origCode.filter(function (v) {
    //     return v.num == parseInt(sNumber.charAt(i));
    //   })
    //     output.push(+result[0].let);
    // }

    var result = origCode.filter(function (v) {
      return v.num == "4";
    });
    var name = result[0].let;


    var out = '';
    var num = row.original_price;
    var ccNmbr = num.toString();
    // var result = [];
    for (var y = 0; y < ccNmbr.length; y++) { //loop through each digit in ccNmbr 
      var result = origCode.filter(function (v) {
        return v.num == ccNmbr.charAt(y);
        // return v.num == 1;
      })
      // sum += parseInt(ccNmbr.charAt(y), 10); //add each digit to the sum
      out += result[0].let;

    } //close adding digits loop

    return (

      <div>
        {out}
        {/* {name} */}

      </div>
    )
  }
  open = () => this.setState({ open: true })
  close = () => this.setState({ open: false })

  handleScan = data => {
    if (data) {
      // this.setState({
      //   result: data
      // })
      console.error(data)
    }
  }
  handleError = err => {
    console.error(err)
  }


  render() {
    const { itemList, allitems, selectedItems, projects, customers,
      branches, loading, load, loadstocks, customerCharges, projectCharges, AllCustomerCharge,
      allCharges, allpaycharge,
      selectedCharge, AllProjectCharge, AllOfficeCharge, officeCharges,
      transDetails, transItems, returnedItems, categories } = this.state;
    const formatter = new Intl.NumberFormat('fil', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 3
    })

    // const itms = allitems.map((items) => ({ key: items.id, value: items.id,text: items.code , text: String(items.balance).concat('\xa0\xa0\xa0\xa0\xa0\xa0\xa0', items.name, ' (', items.size, items.unit, ')  ')}));
    const itms = allitems.map((items) => ({ key: items.id, value: items.id, text: items.code.concat('\xa0\xa0\xa0(', String(items.balance), ')\xa0\xa0\xa0\xa0', items.name,) }));

    var totalReturned = 0;
    var overtotal = 0;
    var payable = 0;
    var change = 0;
    var itempayable = 0;
    const ctr = selectedItems.filter(items => items.id)
    const numRows = ctr.length

    // count customer transaction charges
    const ctrCustCharge = customerCharges.filter(items => items.t_id)
    const numRowsChCust = ctrCustCharge.length

    // count office transaction charges
    const ctrOffCharge = officeCharges.filter(items => items.t_id)
    const numRowsChOff = ctrOffCharge.length

    // count project transaction charges
    const ctrProjCharge = projectCharges.filter(items => items.t_id)
    const numRowsChProj = ctrProjCharge.length

    if (selectedItems.length != 0) {
      selectedItems.map((itemex) => (overtotal += itemex.total))
      payable = overtotal;
      itempayable = overtotal;

      if (this.state.delivery_fee) {
        payable = payable + parseInt(this.state.delivery_fee);
      }
      if (this.state.discount) {
        payable = payable - this.state.discount;
      }
    }

    if (selectedCharge.length != 0) {
      selectedCharge.map((itemex) => (overtotal += parseInt(itemex.payable)))
      payable = overtotal;

    }



    if (this.state.partialAmount) {

      payable = this.state.partialAmount;

    }

    returnedItems.map((itemex) => (totalReturned += parseInt(itemex.total)))

    if (returnedItems.length != 0 && selectedItems.length != 0) {
      // selectedCharge.map((itemex) => (overtotal += parseInt(itemex.payable)))
      payable = itempayable - totalReturned;

    }

    var tot = 0;
    transDetails.map((itemex) => (tot += parseInt(itemex.payable)))


    change = this.state.amountRes - payable;

    const disDel = this.state.dis_deliver;
    const disProj = this.state.dis_proj;
    const disCust = this.state.dis_cust;
    const disBranch = this.state.dis_branch;
    const disResetDir = this.state.dis_resetDir;
    const hide_if_pc = this.state.hide_if_payCharge;
    const show_pc_customer = this.state.show_payCharge_customer;
    const show_if_charge = this.state.show_payCharge_charge;
    const show_pc_project = this.state.show_payCharge_project;
    const show_pc_office = this.state.show_payCharge_office;
    const show_itreturn = this.state.show_itemreturn;
    const show_gendet = this.state.show_genDetails;
    const show_retdet = this.state.show_returnDetails;
    const show_selectit = this.state.show_selectItem;
    const show_partial = this.state.show_partial;
    const show_partialsales = this.state.show_partialSales;
    const b2sales = this.state.btn_back_to_sales;
    const payChargeBtn = this.state.show_payCharge_button;

    // dropdowns
    const proj = projects.map((index) => ({ key: index.id, value: index.id, text: index.name }));
    const cust = customers.map((index) => ({ key: index.id, value: index.id, text: index.first_name.concat('\xa0\xa0\xa0', index.last_name) }));
    const AllCustCharge = AllCustomerCharge.map((index) => ({ key: index.id, value: index.id, text: index.first_name.concat('\xa0\xa0\xa0', index.last_name) }));
    const AllProjCharge = AllProjectCharge.map((index) => ({ key: index.id, value: index.id, text: index.name }));
    const AllOffCharge = AllOfficeCharge.map((index) => ({ key: index.id, value: index.id, text: index.name }));
    const brnch = branches.map((index) => ({ key: index.id, value: index.id, text: index.name }));
    const cats = categories.map((index) => ({ key: index.id, value: index.id, text: index.name }));

    const { open } = this.state;
    const returnBtn = { paddingTop: "5px" }

    // live time
    // var today = new Date();
    // var h = today.getHours();
    // var m = today.getMinutes();
    // var s = today.getSeconds();
    // add a zero in front of numbers<10
    // m = this.checkTime(m);
    // s = this.checkTime(s);

    const dis_devfee = this.state.dis_devfee;
    const dis_discount = this.state.dis_discount;


    return (
      <div class="salesCont">

        <NewWindow title="SIPS Sales" features={{ width: 1600, height: 1000 }} copyStyles>
          <div >
            <div className={classNames('ui  inverted dimmer loads', {
              'active': load,
            })} >
              <center>
                <div class="ui text loader">Loading</div>
              </center>
            </div>

            <ToastContainer />
            {/* <Confirm
              open={this.state.open}
              onCancel={this.close}
              onConfirm={this.close}
            /> */}
            <div class="maintCont">


              {this.state.message}
              <table class="mainTable">

                <tr>
                  <td class="tdPayable">
                    {/* {this.state.dev_add}
                    {this.state.dev_cont}
                   {this.state.uId}
                  {this.state.live_date} */}
                    {/* {this.state.office_id} */}
                    {/* {this.state.customer_id} */}
                    {/* {this.state.customer_id}
                   {this.state.project_id}
                   {this.state.curBranch}
                   {this.state.live_date} */}
                    {/* {this.state.accountability} */}
                    {/* {this.state.hours}:{this.state.minutes}:{this.state.seconds} */}


                    {/* uId: {this.state.uId}<br/> */}
                    {/* original_code: {this.state.receipt_code}<br/>  */}
                    {/* debit_code: {this.state.debit_code}<br/> */}
                    {/* return_code:   {this.state.return_code}<br/> */}
                    {/* replace_code: {this.state.replace_code}<br/> */}
                    {/* date_printed: {this.state.live_date}<br/> */}
                    {/* date_transac: {this.state.date_transac}<br/> */}
                    {/* make_debit : {this.state.make_debit}<br /> */}
                    {/* has_replacement  : {this.state.has_replacement}<br /> */}
                    {/* <QrReader
                      delay={300}
                      onError={this.handleError}
                      onScan={this.handleScan}
                      style={{ width: '20%' }}
                    /> */}
                    <center> <b><p class="payable">{formatter.format(payable)}</p></b> </center>
                    <hr />
                  </td>
                </tr>

                <tr class="trAmnt" >
                  <td>
                    <div class="amtlbl">Amount Received</div>
                    <div class="amtcnt">
                      <form ref={(el) => { this.famres = el; }}   >
                        <input type="text" name="amountRes" onChange={this.handleAmountRes} class="form-control amtFstyle" />
                      </form>
                    </div>
                    <div class="chnglbl">Change</div>
                    <div class="chngcnt">
                      <form ref={(el) => { this.fchange = el; }}   >
                        <input type="text" class="form-control amtFstyle" value={formatter.format(change)} disabled />
                      </form>
                    </div>
                    <hr />
                  </td>
                </tr>

                <tr>
                  <td>
                    <div style={hide_if_pc}>
                      <form class="form-inline"
                        method="post"
                        onSubmit={this.handleAddItem}
                        ref={(el) => {
                          this.addForm = el;
                        }}
                      >
                        <div class="slctItmSecSales">
                          <div class="inline_block">
                            <i class="undo icon" onClick={this.resetFilter}></i>
                          </div>
                          <div class="slcItemCat">
                            <Dropdown type="select" placeholder='Select Category' fluid search selection balance
                              onChange={this.myChangeHandlerCats}
                              options={cats}
                              class="form-control form-control-lg "
                              required
                              clearable={true}
                            />
                          </div>
                        &nbsp;
                        <div class="slcItem">
                            <Dropdown type="select" placeholder='Select item' fluid search selection balance
                              onChange={this.myChangeHandlerItem}
                              options={itms}
                              onSearchChange={this.onSearchChange}
                              class="form-control form-control-lg "
                              required
                              clearable={true}
                            />
                          </div>
                          <div class="qty">
                            <input type="number" min="1" max={this.state.set_max} class="form-control form-control-lg qtyInpt" name="qty" required onChange={this.handleChange} placeholder="Qty" />
                          </div>
                          <div class="addbtn">
                            <button type="submit" class="btn btn-primary btn-lg"  >Add</button>
                          </div>
                        </div>
                        <hr />
                      </form>
                    </div>

                    <div class="inline_block" style={{ width: "100%" }}>
                      <div style={show_pc_customer}>
                        <form class="form-inline"
                          method="post"
                          // onSubmit={this.handleAddItem}
                          ref={(el) => {
                            this.addForm = el;
                          }}
                        >
                          <div class="slctItmSec">
                            <div class="slcItem">
                              <Dropdown type="select" placeholder='Select customer' fluid search selection balance
                                onChange={this.getCustomerCharge}
                                options={AllCustCharge}
                                class="form-control form-control-lg "
                                required
                                clearable={true}
                              />
                            </div>
                          </div>
                          <hr />
                        </form>
                      </div>
                      <div style={show_pc_project}>
                        <form class="form-inline"
                          method="post"
                          // onSubmit={this.handleAddItem}
                          ref={(el) => {
                            this.addForm = el;
                          }}
                        >
                          <div class="slctItmSec">
                            <div class="slcItem">
                              <Dropdown type="select" placeholder='Select project' fluid search selection balance
                                onChange={this.getProjCharge}
                                options={AllProjCharge}
                                class="form-control form-control-lg "
                                required
                                clearable={true}
                              />
                            </div>
                          </div>
                          <hr />
                        </form>
                      </div>
                      <div style={show_pc_office}>
                        <form class="form-inline"
                          method="post"
                          // onSubmit={this.handleAddItem}
                          ref={(el) => {
                            this.addForm = el;
                          }}
                        >
                          <div class="slctItmSec">
                            <div class="slcItem">
                              <Dropdown type="select" placeholder='Select office' fluid search selection balance
                                onChange={this.getOffCharge}
                                options={AllOffCharge}
                                class="form-control form-control-lg "
                                required
                                clearable={true}
                              />
                            </div>
                          </div>
                          <hr />
                        </form>
                      </div>
                    </div>
                    <div class="inline_block" style={show_partial}>
                      <div style={{ width: "57%", paddingLeft: "14%" }} >
                        <input type="number" placeholder="Partial Payment" max={this.state.chargeBalance} class="form-control form-control-lg " name="partialAmount" onChange={this.handlePartial} />

                      </div>
                    </div>

                    {/* style={{width: "30%"}} */}


                    <div style={show_itreturn}>
                      <form class="form-inline"
                        method="post"
                        onSubmit={this.getReceipt}
                      // ref={(el) => {
                      //   this.addForm = el;
                      // }}
                      >
                        <div class="slctItmSec">
                          <div class="slcItem">
                            {/* {this.state.receipt_code} */}
                            <input type="text" class="form-control form-control-md " name="receipt_code" required onChange={this.handleChange} placeholder="Receipt code" />
                               &nbsp;
                             <button type="submit" class="btn btn-primary btn-md"  >Search</button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div style={hide_if_pc}>
                      <div class="disc" style={{ width: "100%" }}>
                        <div class="inline_block">
                          <form ref={(el) => { this.fdiscount = el; }}   >
                            <input type="number" class="form-control form-control-lg " name="discount" onChange={this.handleChange} placeholder="Discount" />
                          </form>
                        </div>
                        <div class="inline_block">
                          <div style={show_partialsales}>
                            <div style={{ width: "100%", paddingLeft: "14%" }} >
                              <input type="number" placeholder="Partial Payment" max={this.state.chargeBalance} class="form-control form-control-lg " name="partialAmountCharge" onChange={this.handlePartial} />
                            </div>
                          </div>
                        </div>



                      </div>
                    </div>
                    <div style={show_itreturn}>
                      <div style={show_selectit}>
                        <form class="form-inline"
                          method="post"
                          onSubmit={this.handleAddItem}
                          ref={(el) => {
                            this.addForm = el;
                          }}
                        >
                          <div class="slctItmSecSales">
                            <div class="inline_block">
                              <i class="undo icon" onClick={this.resetFilter}></i>
                            </div>
                            <div class="slcItemCat">
                              <Dropdown type="select" placeholder='Select Category' fluid search selection balance
                                onChange={this.myChangeHandlerCats}
                                options={cats}
                                class="form-control form-control-lg "
                                required
                                clearable={true}
                              />
                            </div>
                        &nbsp;
                        <div class="slcItem">
                              <Dropdown type="select" placeholder='Select item' fluid search selection balance
                                onChange={this.myChangeHandlerItem}
                                onSearchChange={this.onSearchChange}
                                options={itms}
                                class="form-control form-control-lg "
                                required
                                clearable={true}
                              />
                            </div>
                            <div class="qty">
                              <input type="number" min="1" max={this.state.set_max} class="form-control form-control-lg qtyInpt" name="qty" required onChange={this.handleChange} placeholder="Qty" />
                            </div>
                            <div class="addbtn">
                              <button type="submit" class="btn btn-primary btn-lg"  >Add</button>
                            </div>
                          </div>
                          {/* <hr /> */}
                        </form>
                        {/* <br />
                      <hr /> */}

                      </div>
                    </div>
                    <div class="inline_block" style={{ paddingLeft: "85%" }}>

                      <div style={{ width: "100%" }} >
                        <input type="date" title="For late transactions" placeholder="Late transaction" class="form-control form-control-sm " name="late_date" onChange={this.handleChange} />
                      </div>
                      {this.state.late_date}
                    </div>
                  </td>

                  <hr />
                </tr>


                <tr>
                  <td>
                    <hr />


                    <div class="transac_form">
                      <div style={b2sales} >
                        <button data-key="sales" onClick={this.display_pay_chargeF} class="ui button">Back to sales</button>
                      </div>
                      <div style={hide_if_pc}>
                        <form ref={(el) => { this.fcustname = el; }}  >
                          <input type="text" class="form-control" name="cust_name" value={this.state.cust_name} placeholder="Customer Name" onChange={this.handleChange} /><br />
                        </form>
                        <form ref={(el) => { this.fdevs = el; }}  >
                          <div style={disDel}>

                            Delivery <br /><br />

                            <input type="text" class="form-control" name="dev_add" placeholder="Address" onChange={this.handleChange} /><br />
                            <input type="text" class="form-control" name="dev_cont" placeholder="Contact No." onChange={this.handleChange} /><br />
                            <input type="number" class="form-control" name="delivery_fee" placeholder="Delivery Fee" onChange={this.handleChange} /><br />
                          </div>
                        </form>

                        <div style={disProj}>
                          Charge to Project <br /><br />
                          <Dropdown type="select" placeholder='Select Project' fluid search selection
                            options={proj} onChange={this.myChangeHandlerProject} clearable={true} />
                        </div>
                        <div style={disCust}>
                          Charge to Customer <br /><br />
                          <Dropdown type="select" placeholder='Select Customer' fluid search selection
                            options={cust} onChange={this.myChangeHandlerCustomer} clearable={true} />
                          <a href="#newcust">Add new customer</a>
                        </div>
                        <div style={disBranch}>
                          Charge to Branch <br /><br />
                          <Dropdown type="select" placeholder='Select Branch' fluid search selection
                            options={brnch} onChange={this.myChangeHandlerOffice} clearable={true} />
                        </div>
                        {/* here */}
                        <Menu>
                          <Menu.Item onClick={this.displayDeliver}>Deliver</Menu.Item>
                          <Dropdown text='Charge' pointing className='link item'>
                            <Dropdown.Menu>
                              <Dropdown.Item onClick={this.displayProj}>Project</Dropdown.Item>
                              <Dropdown.Item onClick={this.displayCust}>Customer</Dropdown.Item>
                              <Dropdown.Item onClick={this.displayBranch}>Office</Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </Menu>
                        <div style={disResetDir}>
                          <button onClick={this.resetDirectSales} class="btn btn-primary btn-sm "> Reset to Direct sales </button>
                        </div>

                      </div>
                    </div>


                    <div class="details">
                      <div style={show_gendet}>
                        <center> <b> Details </b> </center>
                        <hr />
                        <table>
                          <tr><td>Code</td><td> : </td><td>{this.state.trans_code}</td></tr>
                          <tr><td>Name</td><td> : </td><td>{this.state.cust_name}</td></tr>
                          <tr><td>Type</td><td> : </td>{this.state.pay_type}<td></td></tr>
                          <tr><td>Accountability</td><td> : </td>{this.state.accountability}<td></td></tr>
                          <tr><td>Item Payable</td><td> : </td>{formatter.format(itempayable)}<td></td></tr>
                          <tr><td ><div style={dis_devfee}>Delivery fee</div></td><td><div style={dis_devfee}> : </div></td><td><div style={dis_devfee}>{formatter.format(this.state.delivery_fee)}</div></td></tr>
                          <tr><td ><div style={dis_discount}>Discount</div></td><td><div style={dis_discount}> : </div></td><td><div style={dis_discount}>{formatter.format(this.state.discount)}</div></td></tr>
                          <tr><td>Payable</td><td> : </td><td>{formatter.format(payable)}</td></tr>
                          <tr><td>Amount Received</td><td> : </td><td>{formatter.format(this.state.amountRes)}</td></tr>
                        </table>
                      </div>
                      <div style={show_retdet}>
                        {/* {tot} */}
                        {transDetails.map((tr) => (
                          <div>
                            <center> <b>Transaction Details </b> </center>
                            <hr />
                            <table>
                              <tr><td>Code</td><td> : </td><td>{tr.code}</td></tr>
                              <tr><td>Name</td><td> : </td><td>{tr.customer_name}</td></tr>
                              <tr><td>Type</td><td> : </td>{tr.transaction_type}<td></td></tr>
                              {/* <tr><td>Accountability</td><td> : </td>{this.state.accountability}<td></td></tr>
                            <tr><td>Item Payable</td><td> : </td>{formatter.format(itempayable)}<td></td></tr>
                            <tr><td ><div style={dis_devfee}>Delivery fee</div></td><td><div style={dis_devfee}> : </div></td><td><div style={dis_devfee}>{formatter.format(this.state.delivery_fee)}</div></td></tr>
                            <tr><td ><div style={dis_discount}>Discount</div></td><td><div style={dis_discount}> : </div></td><td><div style={dis_discount}>{formatter.format(this.state.discount)}</div></td></tr> */}


                              {/* <tr><td>Payable</td><td> : </td><td>{formatter.format(tr.payable)}</td></tr> */}

                              {/* <tr><td>Amount Received</td><td> : </td><td>{formatter.format(this.state.amountRes)}</td></tr> */}
                            </table>
                          </div>
                        ))}
                      </div>
                    </div>


                    <div class="opts">
                      <div class="ui modal">
                        <i class="close icon"></i>
                        <div class="header">
                          Modal Title
                                    </div>
                        <div class="image content">
                          <div class="image">
                            An image can appear on left or an icon
                                        </div>
                          <div class="description">
                            A description can appear on the right
                                        </div>
                        </div>
                        <div class="actions">
                          <div class="ui button">Cancel</div>
                          <div class="ui button">OK</div>
                        </div>
                      </div>
                      <div style={hide_if_pc}>
                        <a href="#confirmsales">
                          <button
                            // onClick={this.SubmitAll}
                            // onClick={handlePrint}
                            data-key={payable}
                            type="button" className={classNames('btn btn-primary btn-lg btnOk', {
                              'btn-loading': loading,
                            })}>OK</button>
                        </a>

                        {/* <ReactToPrint content={() => this.componentRef}>
                        <PrintContextConsumer>
                          {({ handlePrint }) => (
                            <button onClick={handlePrint}>Print this out!</button>
                          )}
                        </PrintContextConsumer>
                      </ReactToPrint> */}
                        <ReactToPrint

                          // trigger={() =>  }
                          ref={ref => this.ref = ref}
                          content={() => this.componentRef}
                        />
                        <ReactToPrint

                          // trigger={() =>  }
                          ref={ref => this.returnprt = ref}
                          content={() => this.retRef}
                        />
                        <ReactToPrint

                          // trigger={() =>  }
                          ref={ref => this.payprt = ref}
                          content={() => this.payRef}
                        />
                        <br />
                        <br />
                        <button type="button" class="btn btn-danger btn-lg btnCnl" onClick={this.reset}>CANCEL</button> <br /><br />
                      </div>
                      <div style={payChargeBtn}>
                        <a href="#confirmcharge">  <button data-key={payable} type="button" className={classNames('btn btn-primary btn-lg btnOk', {
                          'btn-loading': loading,
                        })}>OK</button></a>
                        {/* <ReactToPrint 
                               
                                trigger={() =>  }
                                content={() => this.componentRef}
                                /> */}
                        <br />
                        <br />
                        <button type="button" class="btn btn-danger btn-lg btnCnl" onClick={this.reset}>CANCEL</button>
                        <br />
                        <br />
                        {/* <br /><br /> */}

                      </div>
                      <div style={show_itreturn}>
                        <a href="#confirmreturn"> <button data-key={payable} type="button" className={classNames('btn btn-primary btn-lg btnOk', {
                          'btn-loading': loading,
                        })}>OK</button></a>
                        {/* <ReactToPrint 
                               
                                trigger={() =>  }
                                content={() => this.componentRef}
                                /> */}
                        <br />
                        <br />
                        <button type="button" class="btn btn-danger btn-lg btnCnl" onClick={this.reset}>CANCEL</button>
                        <br />
                        <br />
                        {/* <br /><br /> */}

                      </div>
                      <div id="confirmsales" class="overlay">
                        <div class="confcont">
                          <div class="popupConf">
                            <center>
                              <a href="#">   <button type="button" class="btn btn-danger btn-lg">CANCEL</button></a> &nbsp;&nbsp;&nbsp;
                         <a onClick={this.SubmitAll} data-key={payable} href="#">     <button type="button" data-key={payable} class="btn btn-primary btn-lg ">CONFIRM</button></a>
                            </center>
                          </div>
                        </div>

                      </div>
                      <div id="confirmcharge" class="overlay">
                        <div class="confcont">
                          <div class="popupConf">
                            <center>
                              <a href="#">   <button type="button" class="btn btn-danger btn-lg">CANCEL</button></a> &nbsp;&nbsp;&nbsp;
                         <a onClick={this.submitCharge} data-key={payable} href="#">     <button type="button" data-key={payable} class="btn btn-primary btn-lg ">CONFIRM</button></a>
                            </center>
                          </div>
                        </div>

                      </div>
                      <div id="confirmreturn" class="overlay">
                        <div class="confcont">
                          <div class="popupConf">
                            <center>
                              <a href="#">   <button type="button" class="btn btn-danger btn-lg">CANCEL</button></a> &nbsp;&nbsp;&nbsp;
                         <a onClick={this.submitReturn} data-key={payable} href="#">     <button type="button" data-key={payable} class="btn btn-primary btn-lg ">CONFIRM</button></a>
                            </center>
                          </div>
                        </div>

                      </div>
                      {/* <Link to="/allitems" class="btnAllitm"><button type="button" class="btn btn-primary ">All Items</button></Link>   */}

                      <a href="#popup1"><button class="ui orange button" type="button" onClick={this.getAllstocks}>Stocks</button> </a>
                      <Dropdown text='Payment Charge' floating labeled button className='icon'>
                        <Dropdown.Menu className='right'>
                          <Dropdown.Item data-key="customer" onClick={this.display_pay_chargeF}>
                            <span className='text' data-key="customer">Customer</span>
                          </Dropdown.Item>
                          <Dropdown.Item data-key="project" onClick={this.display_pay_chargeF}>
                            <span className='text' data-key="project">Project</span>
                          </Dropdown.Item>
                          <Dropdown.Item data-key="office" onClick={this.display_pay_chargeF}>
                            <span className='text' data-key="office">Office</span>
                          </Dropdown.Item>

                        </Dropdown.Menu>
                      </Dropdown>

                      <div style={returnBtn}><button class="ui orange button" type="button" onClick={this.display_itemreturn}>Item Return</button></div>

                      <div class="hide">
                        <ComponentToPrint
                          name={this.state.cust_name}
                          discount={this.state.discount}
                          payable={payable}
                          delivery_fee={this.state.delivery_fee}
                          items={this.state.selectedItems}
                          // date={this.state.live_date}
                          code={this.state.trans_code}
                          type={this.state.pay_type}
                          ref={el => (this.componentRef = el)}
                          amountres={this.state.amountRes}
                          cashier={this.state.cashier}
                          branch={this.state.branchName}
                          printdate={this.state.printdate}
                        // ref={componentRef}

                        />

                        <PrintReturn

                          // discount={this.state.discount}
                          // payable={payable}
                          // delivery_fee={this.state.delivery_fee}
                          returned={this.state.returnedItems}
                          items={this.state.selectedItems}
                          // date={this.state.live_date}
                          code={this.state.return_code}
                          orgcode={this.state.receipt_code}
                          type={this.state.pay_type}
                          transdet={transDetails}
                          cashier={this.state.cashier}
                          branch={this.state.branchName}
                          printdate={this.state.printdate}
                          ref={el => (this.retRef = el)}
                        // ref={componentRef}

                        />
                        <PrintPayCharge
                          printdate={this.state.printdate}
                          custname={this.state.cust_name}
                          amountres={this.state.amountRes}
                          paid={payable}
                          code={this.state.trans_code}
                          cashier={this.state.cashier}
                          branch={this.state.branchName}
                          ref={el => (this.payRef = el)}
                        // ref={componentRef}

                        />
                      </div>

                    </div>


                  </td>



                </tr>
              </table>

            </div>
            <div class="leftCont">
              {/* <Button onClick={this.open}>Show</Button> */}
              <table class="leftContTab">
                <tr>
                  <td>
                    <div style={hide_if_pc}>
                      <div class="itemLbl">
                        <b> ITEMS</b>
                        {/* {this.state.item_id}
                            {this.state.qty} */}
                      </div>
                      <div class="tmCount">
                        <div class="tmCountCont">
                          <center>  <b> {numRows} </b> </center>
                        </div>
                      </div>
                      <br />
                    </div>
                    <div style={show_pc_customer}>
                      <div class="itemLbl">
                        <b> CHARGES </b>
                        {/* {this.state.item_id}
                            {this.state.qty} */}
                      </div>
                      <div class="tmCount">
                        <div class="tmCountCont">
                          <center>  <b> {numRowsChCust} </b> </center>
                        </div>
                      </div>
                      <br />
                    </div>
                    <div style={show_pc_project}>
                      <div class="itemLbl">
                        <b> CHARGES </b>
                        {/* {this.state.item_id}
                            {this.state.qty} */}
                      </div>
                      <div class="tmCount">
                        <div class="tmCountCont">
                          <center>  <b> {numRowsChProj} </b> </center>
                        </div>
                      </div>
                      <br />
                    </div>
                    <div style={show_pc_office}>
                      <div class="itemLbl">
                        <b> CHARGES </b>
                        {/* {this.state.item_id}
                            {this.state.qty} */}
                      </div>
                      <div class="tmCount">
                        <div class="tmCountCont">
                          <center>  <b> {numRowsChOff} </b> </center>
                        </div>
                      </div>
                      <br />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="tdAllItems">
                    <div style={hide_if_pc}>
                      <div class="tdAllItemsCont salesTablesCont">

                        <BootstrapTable
                          ref='table'
                          data={selectedItems}
                          pagination={false}
                          search={true}
                          maxHeight="500px"
                        // options={options} exportCSV
                        >
                          {/* <TableHeaderColumn dataField='id' isKey={ true }>ID</TableHeaderColumn> */}
                          <TableHeaderColumn tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} dataField='name'>Name</TableHeaderColumn>
                          <TableHeaderColumn width="70" dataField='unit_price'>Price</TableHeaderColumn>
                          <TableHeaderColumn width="70" dataField="Quantity">Qty</TableHeaderColumn>
                          <TableHeaderColumn width="80" dataField="total" >Total</TableHeaderColumn>
                          <TableHeaderColumn dataField="id" width="60" isKey={true} dataFormat={this.buttonFormatter}></TableHeaderColumn>
                        </BootstrapTable>
                      </div>
                    </div>
                    <div style={show_itreturn} class="returnTables">
                      <div class="tdAllItemsCont ">
                        <div class="returnTablesCont">
                          <h2>Released Items</h2>

                          {this.state.return_type}

                          <BootstrapTable
                            ref='table'
                            data={transItems}
                            pagination={false}
                            search={true}
                            maxHeight="200px"
                          // options={options} exportCSV
                          >
                            {/* hidden={true} */}
                            {/* <TableHeaderColumn dataField='id' isKey={ true }>ID</TableHeaderColumn> */}
                            <TableHeaderColumn dataField='id' hidden={true} >itm</TableHeaderColumn>
                            <TableHeaderColumn dataField='trnItm_id' hidden={true}>tri</TableHeaderColumn>
                            <TableHeaderColumn tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} dataField='item'>Name</TableHeaderColumn>
                            <TableHeaderColumn dataField='unit_price'>Price</TableHeaderColumn>
                            <TableHeaderColumn dataField="quantity">Qty</TableHeaderColumn>
                            {/* <TableHeaderColumn dataField="total" >Total</TableHeaderColumn> */}
                            <TableHeaderColumn dataField="id" isKey={true} dataFormat={this.buttonFormatterReturn} >Action</TableHeaderColumn>
                          </BootstrapTable>
                        </div>
                        <br />
                        <div class="returnTablesCont">
                          <h2>Returned &nbsp;&nbsp; {formatter.format(totalReturned)}</h2>

                          <BootstrapTable
                            ref='table'
                            data={returnedItems}
                            pagination={false}
                            search={true}
                            maxHeight="200px"
                          // options={options} exportCSV
                          >
                            <TableHeaderColumn dataField='item_id' isKey={true} dataFormat={this.buttonFormatterRturned} width="35"></TableHeaderColumn>
                            <TableHeaderColumn dataField='trnItm_id' hidden={true}>tr</TableHeaderColumn>
                            <TableHeaderColumn dataField='item_id' hidden={true}>it</TableHeaderColumn>
                            {/* <TableHeaderColumn dataField='id' isKey={true}>Id</TableHeaderColumn> */}
                            <TableHeaderColumn tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} dataField='name'>Name</TableHeaderColumn>
                            <TableHeaderColumn dataField='status'>Status</TableHeaderColumn>
                            <TableHeaderColumn dataField='item_debit' dataFormat={this.buttonFormatter_upDebit}>Debit</TableHeaderColumn>
                            <TableHeaderColumn dataField='quantity'>Qty</TableHeaderColumn>
                            {/* <TableHeaderColumn dataField='unit_price'>price</TableHeaderColumn> */}
                            <TableHeaderColumn dataField='status' dataFormat={this.buttonFormatter_upret}></TableHeaderColumn>

                          </BootstrapTable>
                        </div>
                        <br />
                        <div class="returnTablesCont">
                          <h2>Replacements &nbsp; &nbsp; {formatter.format(itempayable)}</h2>

                          <BootstrapTable
                            ref='table'
                            data={selectedItems}
                            pagination={false}
                            search={true}
                            maxHeight="200px"
                          // options={options} exportCSV
                          >
                            {/* <TableHeaderColumn dataField='id' isKey={ true }>ID</TableHeaderColumn> */}
                            <TableHeaderColumn tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} dataField='name'>Name</TableHeaderColumn>
                            <TableHeaderColumn dataField='unit_price'>Price</TableHeaderColumn>
                            <TableHeaderColumn dataField="Quantity">Qty</TableHeaderColumn>
                            {/* <TableHeaderColumn dataField="total" >Total</TableHeaderColumn> */}
                            <TableHeaderColumn dataField="id" isKey={true} dataFormat={this.buttonFormatter}>Action</TableHeaderColumn>
                          </BootstrapTable>
                        </div>

                      </div>
                    </div>
                    <div style={show_if_charge}>
                      <div class="tdAllItemsCont">
                        <hr />
                        <table>
                          <tr><td>Unpaid Balance </td>  <td> : </td><td> {formatter.format(this.state.chargeBalance)}</td> </tr>
                          {/* <tr><td>Total amount paid </td><td> : </td><td> {formatter.format("0")}</td> </tr>
                        <tr><td>Percentage paid </td>  <td> : </td><td> 0%</td></tr> */}
                        </table>
                        <a href="#allpayments">All Payments</a>
                        <hr />
                        <BootstrapTable
                          ref='table'
                          data={allCharges}
                          pagination={false}
                          search={true}
                          maxHeight="300px"
                        >

                          {/* <TableHeaderColumn dataField="t_id" width="35" dataFormat={this.buttonChargeItemsBox}></TableHeaderColumn> */}

                          <TableHeaderColumn tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} dataField='date'>Date</TableHeaderColumn>
                          <TableHeaderColumn tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} dataField='date' dataField='name'>Branch</TableHeaderColumn>
                          <TableHeaderColumn width="70" dataField="total_items">Items</TableHeaderColumn>
                          <TableHeaderColumn dataField="payable" >Total</TableHeaderColumn>
                          <TableHeaderColumn dataField="t_id" width="35" isKey={true} dataFormat={this.buttonChargeItems}></TableHeaderColumn>
                          <TableHeaderColumn dataField="code" dataSort hidden={true}>Name</TableHeaderColumn>
                          <TableHeaderColumn dataField="icon" dataSort hidden={true}>Name</TableHeaderColumn>
                          <TableHeaderColumn dataField="accountability" dataSort hidden={true}>Name</TableHeaderColumn>
                        </BootstrapTable>
                      </div>
                    </div>


                  </td>
                </tr>
              </table>
              <div id="popup1" class="overlay">
                <div class="popup">
                  <div class="inline_block"> <h2>All Items</h2></div>  <div class="inline_block"><div style={returnBtn}> <button class="ui orange button" onClick={this.refreshStocks} type="button" >Refresh Stocks</button></div></div>
                  <a class="close" href="#" onClick={this.clearStocks}>&times;</a>
                  <div class="AllItemsSales">
                    <div>
                      <div className={classNames('ui  inverted dimmer loads', {
                        'active': loadstocks,
                      })} >
                        <center>
                          <div class="ui text loader">Loading</div>
                        </center>
                      </div>

                      <div class="inline_block">
                        <i class="undo icon" onClick={this.resetFilter}></i>
                      </div>

                      <div class="slcItemCat">
                        <Dropdown type="select" placeholder='Select Category' fluid search selection balance
                          onChange={this.myChangeHandlerCatStocks}
                          options={cats}
                          class="form-control form-control-lg "
                          required
                          clearable={true}
                        />
                      </div>
                      <BootstrapTable
                        ref='table'
                        data={itemList}
                        pagination={false}
                        search={true}
                        options={{ hideSizePerPage: false }}
                        class="tableStyle"
                        maxHeight="500px"
                      // options={options} exportCSV
                      >
                        <TableHeaderColumn dataField='code' isKey={true}>Code</TableHeaderColumn>
                        <TableHeaderColumn tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} dataField='name'>Name</TableHeaderColumn>

                        <TableHeaderColumn dataField='size' width="100">Measurement</TableHeaderColumn>
                        <TableHeaderColumn dataField='unit' width="100">Unit</TableHeaderColumn>
                        <TableHeaderColumn dataField='original_price' dataFormat={this.origPriceCode}>Original Price</TableHeaderColumn>
                        <TableHeaderColumn dataField='unit_price'>SRP</TableHeaderColumn>
                        <TableHeaderColumn dataField='balance'>Balance</TableHeaderColumn>
                      </BootstrapTable>
                    </div>
                  </div>
                </div>
              </div>
              <div id="allpayments" class="overlay">
                <div class="popup">
                  <h2>All Payments</h2>
                  <a class="close" href="#">&times;</a>
                  <div class="AllItemsSales">
                    {/* <div class="inline_block">
                      <i class="undo icon" onClick={this.resetFilter}></i>
                    </div> */}

                    {/* <div class="slcItemCat">
                      <Dropdown type="select" placeholder='Select Category' fluid search selection balance
                        onChange={this.myChangeHandlerCatStocks}
                        options={cats}
                        class="form-control form-control-lg "
                        required
                        clearable={true}
                      />
                    </div> */}
                    <BootstrapTable
                      ref='table'
                      data={allpaycharge}
                      pagination={false}
                      search={true}
                      options={{ hideSizePerPage: false }}
                      class="tableStyle"
                      maxHeight="500px"
                    // options={options} exportCSV
                    >
                      <TableHeaderColumn dataField="code" isKey={true} >Code</TableHeaderColumn>
                      <TableHeaderColumn dataField="date_transac" dataSort  >Date</TableHeaderColumn>
                      <TableHeaderColumn dataField="transaction_type" dataSort  >Type</TableHeaderColumn>
                      <TableHeaderColumn dataField="payable" dataSort >Payable</TableHeaderColumn>
                      <TableHeaderColumn dataField="beg_charge_bal" dataSort  >Beginning Balance</TableHeaderColumn>
                      <TableHeaderColumn dataField="end_charge_bal" dataSort  >Ending Balance</TableHeaderColumn>
                    </BootstrapTable>
                  </div>
                </div>
              </div>
              <div id="newcust" class="overlay">
                <div class="popup1">
                  <a class="close" href="#">&times;</a>
                  <form class="form-inline"
                    class="custForm"
                    method="post"
                    onSubmit={this.handleSubmitCustomer}
                    ref={(el) => {
                      this.customerForm = el;
                    }}
                  >
                    <div>
                      <br />
                      <br />
                      <label >First Name</label>
                      <input type="text"
                        id="addcust"
                        name="first_name"
                        onChange={this.handleChange}
                        //   style={inpt_style}
                        required
                        class="form-control mb-2 mr-sm-2" placeholder="Enter First Name" />

                      <label >Middle Name</label>
                      <input type="text"
                        id="addcust"
                        name="middle_name"
                        onChange={this.handleChange}
                        //   style={inpt_style}
                        required
                        class="form-control mb-2 mr-sm-2" placeholder="Enter Middle Name" />

                      <label >Last Name</label>
                      <input type="text"
                        id="addcust"
                        name="last_name"
                        onChange={this.handleChange}
                        //   style={inpt_style}
                        required
                        class="form-control mb-2 mr-sm-2" placeholder="Enter Last Name" />

                      <label >Contact Number</label>
                      <input type="text"
                        id="addcust"
                        name="contact_no"
                        onChange={this.handleChange}
                        required
                        //   style={inpt_style}
                        class="form-control mb-2 mr-sm-2" placeholder="Enter Contact Number" />

                      <label >Address</label>
                      <input type="text"
                        id="addcust"
                        name="address"
                        onChange={this.handleChange}
                        required
                        // style={inpt_style}
                        class="form-control mb-2 mr-sm-2" placeholder="Enter Address" />
                      <br />
                      <button type="submit" className={classNames('btn btn-primary mb-2', {
                        'btn-loading': loading,
                      })} >Add</button>
                    </div>
                  </form>
                </div>
              </div>

            </div>
          </div>
        </NewWindow>
      </div>

    );

  }
}
class ComponentToPrint extends React.Component {
  render() {
    const allitems = this.props.items;
    var sub = 0;
    const formatter = new Intl.NumberFormat('fil', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 3
    })
    const tabstyle = { whiteSpace: "nowrap", width: "1%" };
    return (
      <div style={{ width: "400px" }} >
        <table class="p_table">
          {/* <tr>
            <td>
              <div class="p_compDet">
                <br />
                <h1><b>4J's Builders Construction & Supply</b></h1>
                <b>Address Here</b><br />
                <b>Contact Number Here</b>
              </div>
              <div class="p_invDet">
                <br />
                <h1><b>INVOICE</b></h1>
                <b>Date Printed: {this.props.date}</b><br />
                <b>Transaction Code: {this.props.code}</b>
              </div>
            </td>
          </tr> */}
          {/* <PrintHeader
            title="SALES INVOICE"
            code={this.props.code}
          /> */}
          <PrintSalesHeader
            title="SALES INVOICE"
            code={this.props.code}
            printdate={this.props.printdate}
          />


          <tr>
            <td>
              <div class="p_compDet">

                <h3><b>BILL TO</b></h3>
                <b>Name: {this.props.name}</b><br />
                <b>Payment Type: {this.props.type}</b>
              </div>
            </td>
          </tr>
          <tr>
            <td>

              <table class="table p_table" style={tabstyle} >
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {allitems.map((item) => (
                    <tr>
                      <td>{item.name}</td>
                      <td>{item.Quantity}</td>
                      <td>{item.unit_price}</td>
                      <td>{item.total}
                        <div class="hide">  {sub += item.total} </div>
                      </td>
                    </tr>

                  ))}

                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td>
              <table >
                <tr><td>  <b>Subtotal :</b>     </td>   <td>  &nbsp;{formatter.format(sub)} </td></tr>
                <tr><td>  <b>Delivery Fee :</b> </td>   <td>  &nbsp;{formatter.format(this.props.delivery_fee)} </td></tr>
                <tr><td>  <b>Discount :</b>     </td>   <td>  &nbsp;{formatter.format(this.props.discount)} </td></tr>
                <tr><td colspan="2">__________________________</td></tr>
                <tr><td><b>Total:</b></td><td><b>{formatter.format(this.props.payable)}</b></td></tr>
              </table>
            </td>
          </tr>
        </table>

        <PrintSalesFooter
          cashier={this.props.cashier}
          branch={this.props.branch}
        />
      </div>
    );
  }
}
const mapStateToProps = (state) => ({
  isAuthenticated: state.Auth.isAuthenticated,
  user: state.Auth.user,
});

export default connect(mapStateToProps)(Sales);


