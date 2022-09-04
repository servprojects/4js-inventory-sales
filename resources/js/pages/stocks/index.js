import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../Http';
import classNames from 'classnames';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import update from 'immutability-helper';
import { Dropdown, Button, Icon, Loader } from 'semantic-ui-react';
import ReactTooltip from "react-tooltip";
import { Link } from 'react-router-dom';
class Stocks extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);

    // Initial state.
    this.state = {
      timeout: 0,
      loading: false,
      loadInv: false,
      load: false,
      brand: null,
      name: null,
      threshold: null,
      error: false,
      upId: null,
      role: null,
      upbeg: false,
      branch_id: null,
      branch_name: null,
      show_stocks: { display: "block" },
      show_branchfilt: { display: "none" },
      show_def: { display: "none" },
      edit_qty: { display: "none" },
      isedit_qty: "no",
      data: JSON.parse(localStorage.getItem("stocks") || "[]"),
      dataTemp: JSON.parse(localStorage.getItem("stocks") || "[]"),
      //  data: [],
      // dataTemp: [],
      units: [],
      defective: [],
      categories: [],
      branches: [],
      brands: [],
      // dataAll: [],
      dataAll: JSON.parse(localStorage.getItem("stocks") || "[]"),
    };

    // API endpoint.
    this.api = '/api/v1/stocksMod';
  }
  componentDidMount() {
    this._isMounted = true
    if (this._isMounted) { this.setState({ load: true }); };
    // if (this._isMounted) { this.setState({ loadInv: true }); };
    this.getOrgData()

    // units

    Http.get('/api/v1/unit')
      .then((response) => {
        // const { data } = response.data;
        if (this._isMounted) {
          this.setState({
            units: response.data.units,
            error: false,
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

    Http.get('/api/v1/brand')
      .then((response) => {
        // const { data } = response.data;
        if (this._isMounted) {
          this.setState({
            brands: response.data.data,
            error: false,
          });

          console.log("response.data")
          console.log(response.data)
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


  getOrgData(){
    this._isMounted = true
    Http.post(`${this.api}`)
    .then((response) => {
      // const { data } = response.data;
      localStorage.setItem('stocks', JSON.stringify(response.data.stocks))
      var localTerminal = JSON.parse(localStorage.getItem("stocks") || "[]");

      if (this._isMounted) {
        this.setState({
          role: response.data.role,
          // data: response.data.stocks,
          // dataAll: response.data.stocks,
          // dataTemp: response.data.stocks,
          data: localTerminal,
          dataAll: localTerminal,
          dataTemp: localTerminal,
          categories: response.data.categories,
          branches: response.data.branches,
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

  handleChange = (e) => {
    const { key } = e.target.dataset;
    const { name, value } = e.target;
    if (this._isMounted) {
      this.setState({ [name]: value });
    }

    if (name == "threshold") {
      const { data } = this.state;
      Http.post(`/api/v1/upThreshold`, { threshold: value, item_id: key })
        .then(({ response }) => {
          var commentIndex = data.findIndex(function (c) {
            return c.id == key;
          });

          var updatedComment = update(data[commentIndex], { threshold: { $set: value } });

          var newData = update(data, {
            $splice: [[commentIndex, 1, updatedComment]]
          });
          if (this._isMounted) {
            this.setState({ data: newData });
          }
          // toast("Item successfully updated", {
          //   position: toast.POSITION.BOTTOM_RIGHT,
          //   className: 'foo-bar'
          // });
        })
        .catch(() => {
          if (this._isMounted) {
            toast("Error updating threshold")
          }
        });
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

  // handleSubmitUpdate = (e) => {
  //   this._isMounted = true
  //   e.preventDefault();
  //   const subs = {
  //     name: this.state.name
  //   }
  //   if (this._isMounted) {
  //     this.setState({ loading: true });
  //   }
  //   this.updateProperty(subs);
  // };

  // updateProperty = (property) => {
  //   Http.patch(`${this.api}/${this.state.upId}`, property)//last stop here no API YET
  //     .then(({ data }) => {

  //       if (this._isMounted) {
  //         this.setState({
  //           data: data.updated.data,
  //           error: false,
  //         });
  //         this.setState({ loading: false });
  //       }
  //       toast("Brand Updated successfully!")
  //       this.updateForm.reset();
  //     })
  //     .catch(() => {
  //       if (this._isMounted) {
  //         this.setState({
  //           loading: false
  //         });
  //       }
  //       toast("Error updating brand!")
  //     });
  // };

  reset = (e) => {
    this._isMounted = true
    if (this._isMounted) {
      this.setState({ name: null });
    }

  };

  updabegbal = (e) => {
    this._isMounted = true
    if (this._isMounted) {
      { this.state.upbeg === false ? this.setState({ upbeg: { validator: this.jobStatusValidator } }) : this.setState({ upbeg: false }) };
    }

  };

  handleExportCSVButtonClick = (onClick) => {
    onClick();
  }
  disItems = (e) => {
    this._isMounted = true
    const { name } = e.target.dataset;
    if (this._isMounted) {
      if (name == "defs") {
        Http.get(`/api/v1/defectives`)
          .then((response) => {
            // const { data } = response.data;
            if (this._isMounted) {
              this.setState({
                defective: response.data.stocks,

              });

            }
          })
          .catch(() => {
            if (this._isMounted) {
              toast("Errorgetting defectives")
            }
          });
        this.setState({
          show_stocks: { display: "none" },
          show_def: { display: "block" },
        });

      } else {
        this.setState({
          show_stocks: { display: "block" },
          show_def: { display: "none" },
        });

      }

    }

  }
  createCustomExportCSVButton = (onClick) => {
    return (
      <ExportCSVButton
        btnText='Down CSV'
        onClick={() => this.handleExportCSVButtonClick(onClick)} />
    );
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
  myChangeHandlerCats = (e, { value }) => {
    const { dataTemp } = this.state;
    var result = dataTemp.filter(function (v) {
      return v.category_id == value;
    })
    if (this._isMounted) {
      this.setState({ data: result })
    }

  };
  resetFilter = (e) => {
    const { dataTemp } = this.state;

    if (this._isMounted) {
      this.setState({ data: dataTemp })
    }

  };
  buttonFormatter = (cell, row) => {
    const dis = this.state.edit_qty;
    return (
      <div>
        { row.threshold}
        <i data-key={row.id} onClick={this.displayQty} class="pencil alternate icon float_right"></i>
        <div>
          <input type="number" style={dis} data-key={row.id}
            onChange={this.handleChange}
            class="form-control form-control-lg qtyInpt" name="threshold" />
        </div>
      </div>
    );
  }
 buttonFormatterDel = (cell, row) => {
 
    return (
      <div>
      
      <i style={{cursor: 'pointer'}} onClick={this.deleteItem} data-key={row.id} class="trash icon"></i>


          {/* <i class='fas icons' 
          // onClick={this.deleteItem}
          style={{color: 'black'}}
            data-key={row.id}>
              <Icon 
              // onClick={this.deleteItem}
              data-key={row.id} 
              size='medium' name='trash' />
            </i>

          {/* <i class='fas icons' onClick={this.deleteItem}
            data-key={row.id}>&#xf1f8;</i> */} 
       
        
      </div>
    );
  }


  deleteItem = (e) => {
    this._isMounted = true
    const { key } = e.target.dataset;
    console.log("key")
    console.log(key)

    if (confirm("Confirm to remove this item. This will no longer be part on future transactions but records can still be accessed.")) {
     
      Http.delete(`/api/v1/item/${key}`)
        .then((response) => {
          if(response.data.status == 0){
            toast("Item has existing balances")
          }else if(response.data.status == 2){
            toast("Item successfully removed")
          }else if(response.data.status == 204){
            toast("Item successfully deleted with no transactions")
          }

          if(this.state.branch_id == 'all'){
            this.getOrgData()
          }else{
            this.getBranchItemData(this.state.branch_id)
          }
         
        })
        .catch((error) => {
          this.setState({ loading: false });
          console.log(error);
          toast("Error removing item!")
        });

    }
  };





  balanceFormat = (cell, row) => {
    //  const content = () =>{
    //    return(<>
    //     HEllooooo
    //    </>);
    //  }
    const content = "Date counted: " + row.begbal_created_at;
    const { loadInv } = this.state;
    return (
      <div>
        {/* <p data-tip={content} data-for={"bal" + row.code}> */}
        <p data-tip={content} data-for={"bal" + row.code}>
          {/* <div className={classNames('ui  inverted dimmer loads', {
            'active': loadInv,
          })} >
            <center>
              <div class="ui text loader">Loading</div>
              
            </center>
          </div> */}
          {loadInv ? <center> <Loader size='mini' active inline /> </center> : row.balance}




        </p>
        {/* <ReactTooltip
          id={"bal" + row.code}
          effect="float"
        >
          <span>
            Date counted: {row.begbal_created_at} <br />
                         Date updated: {row.begbal_updated_at} <br />
          </span>
        </ReactTooltip> */}
      </div>
    );
  }
  myChangeHandlerbranch = (e, { value }) => {
    const { branches } = this.state;
    var result = branches.filter(function (v) {
      return v.id == value;
    })

    if (this._isMounted) {
      this.setState({ branch_id: value, branch_name: result[0].name });
    }

    if (value == "all") {
      if (this._isMounted) {
        this.setState({
          data: this.state.dataAll,
          dataTemp: this.state.dataAll,

        });
      }
    } else {

      if (this._isMounted) { this.setState({ load: true }); };
      this.getBranchItemData(value)
    }

  };


  getBranchItemData(value){
    Http.post(this.api, { branch_id: value })
    .then((response) => {
      // const { data } = response.data.header;
      if (this._isMounted) {
        this.setState({
          data: response.data.stocks,
          dataTemp: response.data.stocks,
          load: false
        });
      }
    })
    .catch(() => {
      this.setState({
        error: 'Unable to fetch data.',
        load: false
      });
    });
  }

  jobStatusValidator = (value, row) => {
    this._isMounted = true
    // const nan = isNaN(parseInt(value, 10));
    const nan = isNaN(parseFloat(value));
    if (nan) {
      return 'Quantity must be a integer!';
    }






    if (confirm("Confirm balance update. This update will affect item's collectible but the transaction will be recorded.")) {
      const subs = {
        item_id: row.id,
        branch: row.branch_id,
        newbal: value
      }
      console.log(subs)
      console.log(row.balance)
      if (this._isMounted) { this.setState({ loadInv: true }); };
      Http.post('/api/v1/stocks/upbal', subs)
        .then((response) => {
          // const { data } = response.data.header;
          if (this._isMounted) {
            // this.setState({
            //   data: response.data.stocks,
            //   dataTemp: response.data.stocks,

            // });
            // console.log(response.data.stat)
            // console.log(response.data.message)
            const { data, dataAll } = this.state;
            var commentIndex = data.findIndex(function (c) {
              return c.id == row.id;
            });
            // var result = dataAll.filter(function (v) {
            //   return v.id == row.id;
            // })

            var updatedComment;
            var newData;

            // updatedComment = update(data[commentIndex], { balance: { $set: row.balance } });

            // newData = update(data, {
            //   $splice: [[commentIndex, 1, updatedComment]]
            // });

            // if (this._isMounted) {
            //   this.setState({ data: newData });
            // }



            if (response.data.stat !== 105) {

              updatedComment = update(data[commentIndex], { collectible_amount: { $set: value * row.unit_price }, balance: { $set: value } });

              newData = update(data, {
                $splice: [[commentIndex, 1, updatedComment]]
              });

              // if (this._isMounted) {
              //   this.setState({ data: newData });
              // }
              if (this._isMounted) {
                this.setState({ data: newData, loadInv: false });
              }
              toast(response.data.message)
              // return true;


              response.isValid = true;
              // response.notification.type = 'error';
              // response.notification.msg = 'Value must be inserted';
              // response.notification.title = 'Requested Value';

            }
            else {
              updatedComment = update(data[commentIndex], { balance: { $set: row.balance } });

              newData = update(data, {
                $splice: [[commentIndex, 1, updatedComment]]
              });
              //  if (this._isMounted) {
              //    this.setState({ data: newData });
              //  }

              response.isValid = true;
              // response.notification.type = 'error';
              // response.notification.msg = 'Value must be inserted';
              // response.notification.title = 'Requested Value';

              toast(response.data.message)
              // return (row.balance);
              if (this._isMounted) {
                this.setState({ loadInv: false });
              }
            }



            // this.setState({ upbeg: { validator: this.jobStatusValidator } }) : 
            // if (this._isMounted) {
            //   this.setState({ upbeg: false });
            // }
            // if (this.state.timeout) clearTimeout(this.state.timeout);
            // this.state.timeout = setTimeout(() => {
            //   this.setState({ upbeg: { validator: this.jobStatusValidator , blur: false} })
            // }, 300);






            // toast(response.data.message)
          }
        })
        .catch(() => {
          this.setState({
            error: 'Unable to fetch data.', loadInv: false
          });
        });
    }
    // console.log(newData)

    // if (this._isMounted) {
    //     this.setState({ dataPrint: newData });
    // }
    // console.log(newData)

    return response;
  }
  redirectPrint = () => {
    // console.log("doing something");
    const win = window.open("/report/print/allitems", "_blank");
    win.focus();
  }



  onAfterSaveCell = (row, cellName, cellValue) => {
    this._isMounted = true
    const { brands } = this.state;
    var subs;


    if (cellName == "item") {
      subs = {
        name: cellValue,
      }
    } else if (cellName == "brand") {

      var result = brands.filter(function (v) {
        return v.name === cellValue;
      })

      subs = {
        brand_id: result[0].id,
      }
    } else {
      subs = {
        [cellName]: cellValue,
      }
    }


    const rows = {
      balance: row.balance,
      unit_price: cellValue,

    }
    this.updateProperty(subs, row.id, cellName, rows);








  }

  onBeforeSaveCell(row, cellName, cellValue) {
    // You can do any validation on here for editing value,
    if (confirm("Are you sure you want to update details?")) {
      return true;
    } else {
      return false;
    }
    // return false for reject the editing
    // if (confirm(`Are you sure you want to update ${row.name}?`)) {
    //   if (cellName == "original_price" || cellName == "srp") {
    //     if (Number(cellValue)) {
    //       return true;
    //     } else {
    //       toast("Invalid amount!")
    //       return false;
    //     }
    //   } else {
    //     return true;
    //   }

    // } else {
    //   return false;
    // }
  }




  updateProperty = (property, id, cellName, row) => {

    console.log("row")
    console.log(row)
    console.log(cellName)
    this._isMounted = true
    Http.patch(`/api/v1/item/${id}`, property)//last stop here no API YET
      .then(({ data }) => {

        if (this._isMounted) {
          this.setState({ loading: false });
        }

        if (cellName == "unit_price") {

          var updatedComment;
          var newData;
          const { data } = this.state;
          var commentIndex = data.findIndex(function (c) {
            return c.id == id;
          });

          updatedComment = update(data[commentIndex], { collectible_amount: { $set: row.balance * parseFloat(row.unit_price) } });

          newData = update(data, {
            $splice: [[commentIndex, 1, updatedComment]]
          });


          if (this._isMounted) {
            this.setState({ data: newData });
          }

          // // dataAll
          //           var updatedCommentT;
          //           var newDataT;
          //           const { dataAll } = this.state;
          //           var commentIndexT = dataAll.findIndex(function (c) {
          //             return c.id == id;
          //           });

          //           updatedCommentT = update(dataAll[commentIndexT], { 
          //             collectible_amount: { $set: row.balance * parseFloat(row.unit_price)  },
          //             unit_price: { $set: parseFloat(row.unit_price)  }
          //           });

          //           newDataT = update(dataAll, {
          //             $splice: [[commentIndexT, 1, updatedCommentT]]
          //           });


          //           if (this._isMounted) {
          //             this.setState({ dataAll: newDataT });
          //           }



        }





        toast("Item Updated successfully!")
        // this.updateForm.reset();
      })
      .catch(() => {
        if (this._isMounted) {
          this.setState({
            loading: false
          });
        }
        toast("Error updating item!")
      });
  };


  myChangeHandlerZero = (e, { value }) => {
    const { data } = this.state;
    var result = data.filter(function (v) {
      return v.balance != 0;
    })
    if (this._isMounted) {
      // this.setState({ data: result, dataSubTemp: result })
      this.setState({ data: result })
    }

  };



  render() {
    const { data, defective, categories, brands, branches, show_branchfilt, role, load, upbeg, loadInv, units } = this.state;


    const options = {
      exportCSVBtn: this.createCustomExportCSVButton
    };

    const stocks = this.state.show_stocks;
    const def = this.state.show_def;
    const cats = categories.map((index) => ({ key: index.id, value: index.id, text: index.name }));

    var dptemp = branches;

    var exist = "no";
    dptemp.map((itemex) => {
      if (itemex.id == "all") {
        exist = "yes";
      }
    })

    if (exist == "no") {
      const subs = {
        id: "all",
        name: "All Enabled Branch",
      }
      dptemp.push(subs);
    }

    const branch = dptemp.map((brnch) => ({ key: brnch.id, value: brnch.id, text: brnch.name }));
    var sbfilt = show_branchfilt;

    if (role == "Superadmin") {
      sbfilt = { display: "block" };
    }
    const cellEditPropMain = {
      // mode: 'click',
      mode: 'dbclick',
      blurToSave: true,
      beforeSaveCell: this.onBeforeSaveCell, // a hook for before saving cell
      afterSaveCell: this.onAfterSaveCell
      // blurToSave: false,
    };

    // const jobTypes = [ 'USD', 'GBP', 'EUR' ];
    var unt = [];
    units.map((u) => {
      unt.push(u.abv)
    });

    var brnd = [];
    brands.map((u) => {
      brnd.push(u.name)
    });


    const unitSelect = unt;

    var sorted = data.sort(function (a, b) {
      return a.name.localeCompare(b.name);
    });

    console.log(sorted)
    return (
      <div>
        {/* <div className={classNames('ui  inverted dimmer loads', {
          'active': load,
        })} >
          <center>
            <div class="ui text loader">Loading</div>
          </center>
        </div> */}

        <div className="contentTransactSales">
          <div className={classNames('ui  inverted dimmer loads', {
            'active': load,
          })} >
            <center>
              <div class="ui text loader">Loading</div>
            </center>
          </div>
          <ToastContainer />
          <div style={stocks}>



            {
              this.state.role === "Cashier" ? <></> :
                <>
                  {
                    this.state.branch_id != null && this.state.branch_id !== "all" && this.state.role === "Superadmin" || this.state.role === "Admin" ?
                      <>
                        <div style={{ width: "100%" }}>

                          <div class="inline_block">
                            <button class="ui button" tabindex="0" data-name="defs" onClick={this.disItems}>
                              Defectives
                       </button>
                          </div>
                          <div style={{ right: "0", position: "absolute" }} class="inline_block">
                            <button class="ui button" tabindex="0" data-name="defs" onClick={this.updabegbal}>
                              {this.state.upbeg === false ? "Update Beg. Balances" : "Exit Update"}
                            </button>

                          </div>
                        </div>
                        <br />
                        <div style={{ position: "absolute", right: "0" }}>
                          <p style={{ textAlign: "right", width: "100%" }}> <i style={{ right: "0" }}><i style={{ color: "red" }} >*</i>Note: You can only update beginning balances for those<br /> items that does not have any transaction yet. Click the<br /> balance to update.</i></p>
                        </div>
                      </>
                      : <></>
                  }
                </>
            }
            <h1>STOCKS</h1>


            <div class="slcItemCat" style={{ width: "100%" }}>
              {/* <div class="inline_block">
                <i class="undo icon" onClick={this.resetFilter}></i>
              </div> */}
              <div class="inline_block">
                <Button onClick={this.resetFilter} content='Reset Filter' icon='undo' labelPosition='left' />
                {/* <i class="undo icon" onClick={this.resetFilter}></i> */}
              </div>
              <div class="inline_block">
                <Dropdown type="select" placeholder='Select Category' fluid search selection balance
                  onChange={this.myChangeHandlerCats}
                  options={cats}
                  class="form-control form-control-lg "
                  required
                  clearable
                />

              </div>
            &nbsp;&nbsp;&nbsp;
              {/* <div style={{ width: "50%" }}> */}
              <div class="inline_block"  >
                <div style={sbfilt}>
                  <Dropdown
                    type="select"
                    placeholder='Select branch'
                    fluid
                    search
                    selection
                    // style={req_inpt}
                    onChange={this.myChangeHandlerbranch}
                    options={branch}
                    id="addItem"
                    name="brand_id"
                    required
                    clearable
                  />
                </div>
              </div>
              <div class="inline_block" style={{ float: "right" }}>
                {/* <Link to={{ pathname: '/report/print/allitems', state: { data: data, branch: this.state.branch_name } }}> */}
                <Link to={{ pathname: '/report/print/allitems', state: { data: data, branch: this.state.branch_name } }} >
                  <Button > Print Items </Button>
                </Link>
              </div>
              &nbsp;&nbsp;&nbsp;
                            <div class="inline_block">
                <Button onClick={this.myChangeHandlerZero} >Exclude Zero (0) Balance</Button>
              </div>
              {/* </div> */}
            </div>


            <br />
            <br />
            {/* {this.state.branch_id} */}

            <i><span style={{ color: "red" }}>*</span>Double click balance to update when enabled</i><br />
            {/* <i><span style={{ color: "red" }}>*</span>Double click <b>ID No.</b>, <b>Measure</b>, <b>Unit</b>, <b>Org. Price</b>, and <b>SRP</b>  to update</i> */}
            <i><span style={{ color: "red" }}>*</span>Double click <b>Name</b>,  <b>Brand</b>, <b>Measure</b>, <b>Unit</b>, <b>Org. Price</b>, and <b>SRP</b>  to update</i>
            <br />
            <i><span style={{ color: "red" }}>*</span>When updating SRP, refresh if you want to get the current accumulated data off all branches</i><br />
            <br />
            <br />
            <b>  {this.state.branch_name ?  this.state.branch_name  : 'All Enabled Branch' }</b>

            
            <BootstrapTable
              ref='table'
              // data={data}
              data={sorted}
              pagination={true}
              search={true}
              options={options}
              // exportCSV
              cellEdit={role == "Cashier" ? {} : cellEditPropMain}
            >
              <TableHeaderColumn dataField='code' width="150" editable={false} isKey={true} >Code</TableHeaderColumn>
              {/* <TableHeaderColumn dataField='id' width="80"  >ID No</TableHeaderColumn> */}
              <TableHeaderColumn dataField='id_no' hidden width="80"  >ID No</TableHeaderColumn>
              <TableHeaderColumn dataField='category' editable={false} width="100"  >Category</TableHeaderColumn>
              <TableHeaderColumn dataField='item'width="180" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Item</TableHeaderColumn>
              <TableHeaderColumn dataField='brand' tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} editable={{ type: 'select', options: { values: brnd } }} width="100" >Brand</TableHeaderColumn>
              <TableHeaderColumn dataField='size'
                //  editable={false} 
                //  editable={{validator: this.infoValidator}} 
                width="100" >Measure</TableHeaderColumn>
              <TableHeaderColumn dataField='unit' editable={{ type: 'select', options: { values: unitSelect } }} width="100" >Unit</TableHeaderColumn>
              <TableHeaderColumn dataField='original_price' width="100" hidden={role == 'Cashier' ? true : false} >Org price</TableHeaderColumn>
              <TableHeaderColumn dataField='unit_price' width="100"   >SRP</TableHeaderColumn>
              {/* <TableHeaderColumn dataField='balance' editable={{ validator: this.jobStatusValidator }}>Balance</TableHeaderColumn> */}
              <TableHeaderColumn dataField='balance' width="100" dataFormat={this.balanceFormat} editable={loadInv ? false : upbeg}>Balance</TableHeaderColumn>
              <TableHeaderColumn dataField='collectible_amount' width="100" editable={false} >Collectible</TableHeaderColumn>
              <TableHeaderColumn dataField='id' hidden={true}></TableHeaderColumn>
              <TableHeaderColumn dataField='branch_id' hidden={true} ></TableHeaderColumn>
              <TableHeaderColumn dataField='begbal_created_at' hidden={true} ></TableHeaderColumn>
              <TableHeaderColumn dataField='begbal_updated_at' hidden={true} ></TableHeaderColumn>
              <TableHeaderColumn dataField='threshold' width="100" editable={true}>Threshold</TableHeaderColumn>
              <TableHeaderColumn dataField='id_no' width="50" dataFormat={this.buttonFormatterDel}  editable={false} >Opt</TableHeaderColumn>
              {/* <TableHeaderColumn dataField='threshold' width="100" editable={false} dataFormat={this.buttonFormatter}>Threshold</TableHeaderColumn> */}
              {/* <TableHeaderColumn dataField="id" dataFormat={this.buttonFormatter}>Buttons</TableHeaderColumn> */}
            </BootstrapTable>
          </div>
          <div style={def}>
            <button class="ui button" tabindex="0" data-name="stocks" onClick={this.disItems}>
              Stocks
          </button>
            <h1>Defectives</h1>
            <BootstrapTable
              ref='table'
              data={defective}
              pagination={true}
              search={true}
              options={options} exportCSV
            >
              <TableHeaderColumn dataField='code' isKey={true} >Code</TableHeaderColumn>
              <TableHeaderColumn dataField='item' >Item</TableHeaderColumn>
              {/* <TableHeaderColumn dataField='size' >Measure</TableHeaderColumn> */}
              {/* <TableHeaderColumn dataField='unit' >Unit</TableHeaderColumn> */}
              {/* <TableHeaderColumn dataField='unit_price' >SRP</TableHeaderColumn> */}
              <TableHeaderColumn dataField='balance'>Balance</TableHeaderColumn>
              {/* <TableHeaderColumn dataField='collectible_amount'>Collectible</TableHeaderColumn> */}
              {/* <TableHeaderColumn dataField="id" dataFormat={this.buttonFormatter}>Buttons</TableHeaderColumn> */}
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

export default connect(mapStateToProps)(Stocks);
