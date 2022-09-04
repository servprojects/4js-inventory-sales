import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../../Http';
import classNames from 'classnames';
import { Dropdown, Icon } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import CSVReader from 'react-csv-reader'
import update from 'immutability-helper';
import ReactToPrint from "react-to-print";
import PrintItems from '../../prints/printItem';
import SubQty from './item_sub_quantity';
import MatchItem from './item_match_sub_qty';
import { Link } from 'react-router-dom';
class Items_main extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);

    this.state = {
      timeout: 0,
      defCode: null,
      loading: false,
      load: false,
      item_count: null,
      id_no: null,
      name: null,
      brand: null,
      category: null,
      brand_id: null,
      size: null,
      category_id: null,
      original_price: null,
      unit_price: null,
      unit_name: null,
      error: false,
      upId: null,
      branch1: null,
      branch2: null,
      role: null,
      openConversion: false,
      lol: null,
      // data: [],
      data: JSON.parse(localStorage.getItem("utlitem") || "[]"),
      dataPrint: [],
      convDet: null,
      convMatch: null,
      // convDet: [],
      // convMatch: [],
      // dataTemp: [],
      dataTemp: JSON.parse(localStorage.getItem("utlitem") || "[]"),

      // brnd: JSON.parse(localStorage.getItem("utlbrd") || "[]"),
      // itmcat:JSON.parse(localStorage.getItem("utlct") || "[]"),
      // unit:JSON.parse(localStorage.getItem("utlunt") || "[]"),  

      // brnd: [],
      // itmcat: [],
      // unit: [],

      brnd: this.props.brands,
      itmcat: this.props.cats,
      unit: this.props.units,

      imported: [],
      categories: [],
      branches: [],

    };


    // API endpoint.
    this.api = '/api/v1/item';
    // console.log("whattta");


  }




  componentDidMount() {
    this.getOrgData ()

  }


  getOrgData (){
    this._isMounted = true
    // if (this._isMounted) { this.setState({ load: true }); };
    Http.get(`${this.api}`)
      .then((response) => {
        // const { items,brands } = response.data;

        // const { data } = response.data.items;


        // if(this._isMounted){
        //       this.setState({
        //       data

        //       });
        // } 

        localStorage.setItem('utlitem', JSON.stringify(response.data.cols))
        var localTerminal = JSON.parse(localStorage.getItem("utlitem") || "[]");

        if (this._isMounted) {
          this.setState({
            // data: response.data.cols,
            // dataTemp: response.data.cols, 
            item_count: response.data.item_count[0].item_count,
            data: localTerminal,
            dataTemp: localTerminal,
            // brnd: response.data.brands.data,
            // itmcat: response.data.itemcats.data,
            // unit: response.data.units.data,

            // brnd: this.props.brands,
            // itmcat: this.props.cats,
            // unit: this.props.units,

            categories: response.data.categories,
            branches: response.data.branches,
            role: response.data.role,
            load: false,
            lol: this.props.lol
          });
        }
        // console.log("branhds0")
        // console.log(this.props.brands)
      })
      .catch(() => {
        this.setState({
          error: 'Unable to fetch data.',
          load: false,
        });
      });

  }

  getitmConvDet = (id) => {

    this._isMounted = true
    // convDet
    // convMatch
    Http.post('/api/v1/GetConvDet', { id: id })
      .then((response) => {
        var match = response.data.match;
        if (this._isMounted) {

          var it = {};
          it.name = match[0].name;
          it.size = match[0].size;
          it.unit = match[0].unit;
          it.code = match[0].code;
          it.id = match[0].id;

          var det = [it];
          // console.log("det")
          // console.log(det)
          this.setState({
            convMatch: det.length > 0 ? det : []
          });
          // console.log("match")
          // console.log(match)

        }
      })

      .catch((error) => {
        console.log(error)

      });


    Http.post('/api/v1/GetConvDet', { id: id })
      .then((response) => {
        var sub = response.data.subqty;
        // console.log("sub")
        // console.log(sub[0].quantity)
        if (this._isMounted) {

          var its = {};

          its.quantity = sub[0].quantity;
          its.unit = sub[0].unit;
          its.id = sub[0].id;

          var mt = [its];
          // console.log("mt")
          // console.log(mt)
          this.setState({
            convDet: mt.length > 0 ? mt : []

          });
        }
      })

      .catch((error) => {
        console.log(error)
      });
  }




  myChangeHandlerCategory = (e, { value }) => {
    if (this._isMounted) {
      this.setState({ category_id: value })
    }
  };
  myChangeHandlerBrand = (e, { value }) => {
    if (this._isMounted) {
      this.setState({ brand_id: value })
    }
  };
  myChangeHandlerUnit = (e, { value }) => {
    if (this._isMounted) {
      this.setState({ unit_name: value })
    }
  };
  myChangeBranch1 = (e, { value }) => {
    if (this._isMounted) {
      this.setState({ branch1: value })
    }
  };
  myChangeBranch2 = (e, { value }) => {
    if (this._isMounted) {
      this.setState({ branch2: value })
    }
  };

  // myChangeHandlerCategory = (e, { value }) => this.setState({category_id: value });
  // myChangeHandlerBrand = (e, { value }) => this.setState({brand_id: value });

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
    if (confirm("Are you sure you want to add item?")) {
      const subs = {
        id_no: this.state.id_no,
        name: this.state.name,
        brand_id: this.state.brand_id,
        size: this.state.size,
        category_id: this.state.category_id,
        original_price: this.state.original_price,
        unit: this.state.unit_name,
        unit_price: this.state.unit_price
      }

      // console.log(subs)
      if (this._isMounted) {
        this.setState({ loading: true });
      }
      this.addItem(subs);
    }



  };

  addItem = (item) => {
    this._isMounted = true
    // console.log("item")
    // console.log(item.name)
    Http.post(this.api, item)
      .then(({ data }) => {
        // const newItem = {
        //   id: data.id,
        //   brand: data.brand[0].brand,
        //   category: data.category[0].category,
        //   name: item.name,
        //   brand_id: item.brand_id,
        //   size: item.size,
        //   category_id: item.category_id,
        //   original_price: item.original_price,
        //   unit_price: item.unit_price,
        //   unit: item.unit,
        //   code: data.items[0].code
        // };
        // const allItems = [newItem, ...this.state.data];
        if (this._isMounted) {
          this.setState({
            defCode: item.name,
            data: data.items,
            item_count: parseInt(this.state.item_count) + 1,
            name: null,
            //  brand_id: null,
            size: null,
            // category_id: null, 
            // original_price: null,
            unit_price: null,
            brand: null,
            category: null,
            unit_name: null
          });
        }
        this.itemForm.reset();
        if (this._isMounted) {
          this.setState({ loading: false });

        }
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

  deleteItem = (e) => {
    this._isMounted = true
    const { key } = e.target.dataset;
    const { data: pos } = this.state;

    if (confirm("Confirmation to delete.")) {
      if (this._isMounted) {
        this.setState({ loading: true });
      }
      Http.delete(`${this.api}/${key}`)
        .then((response) => {

          if(response.data.status == 0){
            toast("Item has existing balances")
          }else if(response.data.status == 2){
            toast("Item successfully removed")
            this.getOrgData ()
          }else if(response.data.status == 204){
            toast("Item successfully deleted with no transactions")
            this.getOrgData ()
          }

          

          // if (response.status === 204) {
          //   const index = pos.findIndex(
          //     (item) => parseInt(item.id, 10) === parseInt(key, 10),
          //   );
          //   const update = [...pos.slice(0, index), ...pos.slice(index + 1)];
          //   if (this._isMounted) {
          //     this.setState({ data: update });
          //     this.setState({ loading: false, item_count: parseInt(this.state.item_count) - 1, });
          //   }
          // }
          // toast("Item deleted successfully!")


        })
        .catch((error) => {
          this.setState({ loading: false });
          console.log(error);
          toast("Error deleting item!")
        });

    }
  };

  reset = (e) => {
    this._isMounted = true

    if (this._isMounted) {
      this.setState({openConversion: false, convDet: null, convMatch: null, name: null, brand_id: null, size: null, category_id: null, original_price: null, unit_price: null, brand: null, category: null, unit_name: null });
    }

  };

  setUpId = (e) => {
    this._isMounted = true
    const { key } = e.target.dataset;
    if (this._isMounted) {
      this.setState({ upId: key})
    }

    this.getitmConvDet(key);



  };

  openConv = () => {
    this._isMounted = true

    if (this._isMounted) {
      this.setState({ openConversion: this.state.openConversion == true ? false : true })
    }





  };

  handleSubmitUpdate = (e) => {
    this._isMounted = true
    e.preventDefault();
    const subs = {
      id_no: this.state.id_no,
      name: this.state.name,
      brand_id: this.state.brand_id,
      size: this.state.size,
      category_id: this.state.category_id,
      original_price: this.state.original_price,
      unit_price: this.state.unit_price,
      unit: this.state.unit_name
    }
    if (this._isMounted) {
      this.setState({ loading: true });
    }
    this.updateProperty(subs);
  };

  updateProperty = (property) => {
    this._isMounted = true
    Http.patch(`${this.api}/${this.state.upId}`, property)//last stop here no API YET
      .then(({ data }) => {

        if (this._isMounted) {
          this.setState({
            data: data.updated,
            error: false,
          });
          this.setState({ loading: false });
        }
        toast("Item Updated successfully!")
        this.updateForm.reset();
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
  buttonFormatter = (cell, row) => {
    const { unit, itmcat, brnd, loading } = this.state;
    const unt = unit.map((un) => ({ key: un.id, value: un.abv, text: un.name }));
    const bb = brnd.map((brand) => ({ key: brand.id, value: brand.id, flag: brand.id, text: brand.name }));
    const itmc = itmcat.map((itcat) => ({ key: itcat.id, value: itcat.id, flag: itcat.id, text: itcat.name }));
    return (
      <div>
        <i style={{cursor:"pointer"}} class="pencil alternate icon" data-key={row.id} onClick={this.setUpId} data-backdrop="static" data-keyboard="false" data-toggle="modal" data-target={`#item${row.id}`}></i>
        {/* <button type="button" data-key={row.id} onClick={this.setUpId}
          class=" btn btn-secondary" data-backdrop="static" data-keyboard="false" data-toggle="modal" data-target={`#item${row.id}`}>
         
          <i data-key={row.id} onClick={this.setUpId} class='fas icons'><Icon data-key={row.id} onClick={this.setUpId} size='small' name='pencil' /></i>

        </button> */}
 {/* <i data-key={row.id} onClick={this.setUpId} class='fas icons'>&#xf304;</i> */}


        <div class="modal fade" id={`item${row.id}`} tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close" onClick={this.reset}>
                  <span aria-hidden="true" onClick={this.reset}>&times;</span>
                </button>
              </div>

              <div class="modal-body">

                <form
                  method="post"
                  onSubmit={this.handleSubmitUpdate}
                  ref={(el) => {
                    this.updateForm = el;
                  }}
                >

                  Item Name
                  <input type="text"
                    // id="addItem"
                    name="name"
                    // onChange={this.handleChange}
                    onBlur={this.handleChange}
                    //  style={up_input}
                    class="form-control mb-2 mr-sm-2"
                    //  placeholder={row.name}
                    defaultValue={row.name}
                  />
                  ID No
                  <input type="text"
                    // id="addItem"
                    name="id_no"
                    // onChange={this.handleChange}
                    onBlur={this.handleChange}
                    //  style={up_input}
                    class="form-control mb-2 mr-sm-2"
                    //  placeholder={row.name}
                    defaultValue={row.id_no}
                  />
                  {this.state.role === "Superadmin" ?
                    <>
                      Original Price
                  <input type="number"
                        // id="addItem"
                        name="original_price"
                        // onChange={this.handleChange}
                        onBlur={this.handleChange}
                        //  style={up_input}
                        class="form-control mb-2 mr-sm-2"
                        defaultValue={row.original_price}
                        step="0.001"
                      />

                  Unit Price
                  <input type="number"
                        // id="addItem"
                        name="unit_price"
                        // onChange={this.handleChange}
                        onBlur={this.handleChange}
                        //  style={up_input}
                        class="form-control mb-2 mr-sm-2"
                        defaultValue={row.unit_price}
                        step="0.001"
                      />
                    </>
                    : <></>
                  }
                  Measurement
                  <input type="text"
                    // id="addItem"
                    name="size"
                    // onChange={this.handleChange}
                    onBlur={this.handleChange}
                    //  style={up_input}
                    class="form-control mb-2 mr-sm-2"
                    defaultValue={row.size}
                  />


                   Unit Measurement
                   <Dropdown
                    type="select"
                    placeholder='Select unit'
                    fluid
                    search
                    selection
                    //  style={inpt_style}
                    onChange={this.myChangeHandlerUnit}
                    options={unt}
                    id="addItem"
                    name="unit_name"
                    required
                    clearable
                  />


                   Brand
                     <Dropdown
                    type="select"
                    placeholder={row.brand}
                    fluid
                    search
                    selection
                    //  style={up_input}
                    onChange={this.myChangeHandlerBrand}
                    options={bb}
                    id="addItem"
                    name="brand_id"
                    clearable
                  />


                    Category
                    <Dropdown
                    type="select"
                    placeholder={row.category}
                    fluid
                    search
                    selection
                    //  style={up_input}
                    onChange={this.myChangeHandlerCategory}
                    options={itmc}
                    id="addItem"
                    name="category_id"
                    clearable
                  />
                  <br />
                  <button type="submit"
                    className={classNames('btn btn-primary mb-2', {
                      'btn-loading': loading,
                    })}>Update</button>
                </form>

                {/* stop_here_1-30-2021 */}

                <hr />

                {/* {
                  this.state.convDet && this.state.convMatch ?
                    <>
                      <SubQty convDet={this.state.convDet} id={row.id} unit={unt} />
                      <MatchItem convMatch={this.state.convMatch} id={row.id} />

                    </>
                    : <>
                      <button onClick={this.openConv} class="btn btn-primary mb-2"> Open Conversion Details Form </button>
                    </>
                } */}
                 <button onClick={this.openConv} class="btn btn-primary mb-2"> Open Conversion Details Form </button>

                {
                  this.state.openConversion == true?
                    <>
                      <SubQty convDet={this.state.convDet} id={row.id} unit={unt} />
                      <MatchItem convMatch={this.state.convMatch} id={row.id} />
                    </>
                    : <>
                    </>
                }



              </div>


            </div>
          </div>
        </div>



    &nbsp;
        {/* <button
          type="button"
          className="btn btn-secondary"
          onClick={this.deleteItem}
          data-key={row.id}
        >
          <i class='fas icons' onClick={this.deleteItem}
            data-key={row.id}><Icon onClick={this.deleteItem}
              data-key={row.id} size='small' name='trash' /></i>

         
        </button>  */}
        {/* <i class='fas icons' onClick={this.deleteItem}
            data-key={row.id}>&#xf1f8;</i> */}
             <i style={{cursor: 'pointer'}} onClick={this.deleteItem} data-key={row.id} class="trash icon"></i>
      </div>
    )
  }
  submitImport = (e) => {
    this._isMounted = true
    if (confirm(`Are you sure you want to insert data?`)) {
      if (this._isMounted) {
        this.setState({ loading: true });
      }
      const subs = {
        items: JSON.stringify(this.state.imported),
        branch1: this.state.branch1,
        branch2: this.state.branch2
      }
      // console.log("subs")
      // console.log(subs)
      Http.post(`/api/v1/item/import`, subs)
        .then(({ data }) => {

          if (this._isMounted) {
            this.setState({
              // data: data.updated,
              // error: false,
              loading: false,
              imported: []
            });

          }
          toast("Items imported successfully!")

        })
        .catch(() => {
          if (this._isMounted) {
            this.setState({
              loading: false,

            });

          }
          toast("Error importing items")
        });

    }
  }
  enumFormatter(cell, row, enumObject) {
    return enumObject[row.category];
  }

  buttonFormatterCat = (cell, row) => {

    return (<div>{row.size + "-" + row.unit}</div>)
  }
  enumFormatter(cell, row, enumObject) {
    return enumObject[row.category];
  }
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

      toast("Item deleted successfully!")
    }
  };

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

    toast("Item successfully updated", {
      position: toast.POSITION.BOTTOM_RIGHT,
      className: 'foo-bar'
    });

    // alert('Thw whole row :\n' + rowStr);
  }

  upCountDate = (e) => {
    // alert(`Save cell ${cellName} with value ${cellValue} ${row.id} `);
    this._isMounted = true
    e.preventDefault();


    const { name, value } = e.target;
    const { id } = e.target.dataset;
    const { imported } = this.state;
    // let rowStr = '';
    // for (const prop in row) {
    //   rowStr += prop + ': ' + row[prop] + '\n';
    // }

    var commentIndex = imported.findIndex(function (c) {
      return c.id == id;
    });
    var updatedComment = update(imported[commentIndex], { [name]: { $set: value } });
    var newData = update(imported, {
      $splice: [[commentIndex, 1, updatedComment]]
    });
    if (this._isMounted) {
      this.setState({ imported: newData });
    }

    toast("Employee successfully updated", {
      position: toast.POSITION.BOTTOM_RIGHT,
      className: 'foo-bar'
    });

    // alert('Thw whole row :\n' + rowStr);
  }

  onBeforeSaveCell(row, cellName, cellValue) {
    // You can do any validation on here for editing value,
    // return false for reject the editing
    if (confirm(`Are you sure you want to update ${row.name}?`)) {
      if (cellName == "original_price" || cellName == "srp") {
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

  // here
  myChangeHandlerCats = (e, { value }) => {
    const { dataTemp } = this.state;
    var result = dataTemp.filter(function (v) {
      return v.category_id == value;
    })
    if (this._isMounted) {
      this.setState({ data: result })
    }
    //   if (this._isMounted) { this.setState({ load: true }); };
    //   Http.post(`/api/v1/item/category`, { cat_id: value })
    //     .then((response) => {

    //       if (this._isMounted) {
    //         this.setState({
    //           data: response.data.cols,
    //           dataTemp: response.data.cols,

    //           load: false,
    //         });
    //       }

    //     })
    //     .catch(() => {
    //       this.setState({
    //         error: 'Unable to fetch data.',
    //         load: false,
    //       });
    //     });

  };
  resetFilter = (e) => {
    const { dataTemp } = this.state;

    if (this._isMounted) {
      this.setState({ data: dataTemp })
    }

  };
  countdate1 = (cell, row) => {
    var date = row.date_counted1;
    const sd = new Date(date);
    var smo = sd.getMonth() + 1; //months from 1-12
    var sda = sd.getDate();
    var sye = sd.getFullYear();
    var nday = sda;
    if (sda <= 10) {
      nday = "0" + sda;
    }
    //  console.log("length")
    //  console.log(sda)
    var ndate = sye + "-" + smo + "-" + nday;
    // console.log(ndate)
    return (<>
      {row.beg_bal1}&nbsp;&nbsp;&nbsp; <i class="calendar outline icon" data-toggle="modal" data-target={"#mod" + row.id}></i>


      <div class="modal fade" id={"mod" + row.id}>
        <div class="modal-dialog modal-xs  shadow-shorter">
          <div class="modal-content">


            <div class="modal-header">
              <h4 class="modal-title">Modify count date in Balance 1</h4>

            </div>


            <div class="modal-body" >
              <form
                data-tid={row.id}
                // onSubmit={this.upCountDate}
                ref={(el) => {
                  this.modDateForm = el;
                }}

              >
                {/* {ndate} */}

                <center>
                  <input class="form-control mb-2 mr-sm-2 " onChange={this.upCountDate} type="date" data-id={row.id} name="date_counted1" value={ndate} style={{ width: "80%" }} />

                  {/* <button type="submit" class="btn btn-primary" >Submit</button> */}
                </center>
              </form>
            </div>




          </div>
        </div>
      </div>
    </>)
  }
  countdate2 = (cell, row) => {
    var date = row.date_counted2;
    const sd = new Date(date);
    // console.log(date)
    var smo = sd.getMonth() + 1; //months from 1-12
    var sda = sd.getDate();
    var sye = sd.getFullYear();
    var nday = sda;
    if (sda <= 10) {
      nday = "0" + sda;
    }
    //  console.log("length")
    //  console.log(sda)
    var ndate = sye + "-" + smo + "-" + nday;
    // console.log(ndate)
    return (<>
      {row.beg_bal2}&nbsp;&nbsp;&nbsp; <i class="calendar outline icon" data-toggle="modal" data-target={"#mod2" + row.id}></i>


      <div class="modal fade" id={"mod2" + row.id}>
        <div class="modal-dialog modal-xs  shadow-shorter">
          <div class="modal-content">


            <div class="modal-header">
              <h4 class="modal-title">Modify count date in Balance 2</h4>

            </div>


            <div class="modal-body" >
              <form
                data-tid={row.id}
                // onSubmit={this.upCountDate}
                ref={(el) => {
                  this.modDateForm = el;
                }}

              >
                {/* {ndate} */}

                <center>
                  <input class="form-control mb-2 mr-sm-2 " data-id={row.id} onChange={this.upCountDate} type="date" name="date_counted2" value={ndate} style={{ width: "80%" }} />

                  {/* <button type="submit" class="btn btn-primary" >Submit</button> */}
                </center>
              </form>
            </div>




          </div>
        </div>
      </div>
    </>)
  }
  render() {

    // const product = products;
    const { load, unit, itmcat, brnd, data, error, imported, categories, branches, loading, role } = this.state;
    const pill_form = {

    };
    const inpt_style = {
      width: "100%",
    };
    const table_style = {
      width: "100%",
    };

    const label_style = {
      float: "left",
    };
    const up_form = {
      paddingLeft: "28%",
      width: "100%",
    };
    const up_input = {
      width: "100%",
    };
    const icon = {
      fontSize: "24px",
    };
    const mid_form = { margin: "100px", };

    var propBrd = this.props.brands;
    var propunt = this.props.units;
    var propct = this.props.cats;

    const bb = propBrd.map((brand) => ({ key: brand.id, value: brand.id, flag: brand.id, text: brand.name }));
    const itmc = propct.map((itcat) => ({ key: itcat.id, value: itcat.id, flag: itcat.id, text: itcat.name }));
    const unt = propunt.map((un) => ({ key: un.id, value: un.abv, text: un.name }));
    const cats = propct.map((index) => ({ key: index.id, value: index.id, text: index.name }));

    // const bb = brnd.map((brand) => ({ key: brand.id, value: brand.id, flag: brand.id, text: brand.name }));
    // const itmc = itmcat.map((itcat) => ({ key: itcat.id, value: itcat.id, flag: itcat.id, text: itcat.name }));
    // const unt = unit.map((un) => ({ key: un.id, value: un.abv, text: un.name }));
    // const cats = categories.map((index) => ({ key: index.id, value: index.id, text: index.name }));


    const brnch = branches.map((index) => ({ key: index.id, value: index.id, text: index.name }));

    const qualityType = {
      0: 'good',
      1: 'Bad',
      2: 'unknown'
    };
    var i = 0;
    const itmcOpt = data.map((itcat) => (itcat.category));
    const cellEditProp = {
      mode: 'dbclick',
      blurToSave: true,
      beforeSaveCell: this.onBeforeSaveCell, // a hook for before saving cell
      afterSaveCell: this.onAfterSaveCell  // a hook for after saving cell
    };
    const options = {
      handleConfirmDeleteRow: this.customConfirm,
      // defaultSearch: this.state.defCode ? this.state.defCode : ' ',
      defaultSearch: this.state.defCode,
    };

    const selectRowProp = {
      mode: 'checkbox'
    };
    var beg1 = "beg_bal";

    // console.log("bbbb")
    // console.log(propct)

    var sorted = data.sort(function (a, b) {
      return a.name.localeCompare(b.name);
    });

    console.log("Conversion")
    console.log(this.state.convDet)
    console.log(this.state.convMatch)
    return (

      <div class="contentUtil" >

        <div className={classNames('ui  inverted dimmer loads', {
          'active': load,
        })} >
          <center>
            <div class="ui text loader">Loading</div>
          </center>
        </div>
        <ToastContainer />


        {/* <CSVReader
          parserOptions={{ header: true }}
          onFileLoaded={(dataf, fileInfof) => console.dir(dataf, fileInfof)}
          cssClass="form-control mb-2 mr-sm-8"
        /> */}
        <center>
          <button type="button" class="btn btn-primary" data-toggle="collapse" data-target="#itemMain"   >Add New Item</button>
          &nbsp;
          {/* <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#imp">
            Import
          </button> */}
          &nbsp;
          <Link to={{ pathname: `/deleted/items`, state: { role: "role" } }}>   <button type="button" class="btn btn-primary" data-toggle="collapse" data-target="#itemMain"   >All Deleted Items</button> </Link>
        </center>


        {/* modal-xl */}

        <div class="modal fade" id="imp">
          <div class="modal-dialog  modal-xxl">
            <div class="modal-content">


              <div class="modal-header">
                <h4 class="modal-title">Import Items</h4>
                <br />

                <button type="button" class="close" data-dismiss="modal">&times;</button>
              </div>


              <div class="modal-body">
                <i style={{ color: "red" }}>Important Reminders</i><br />
                <i>*import items are for those items that do not exist yet in the system. If you want to update an item please use the update
              " <i class='fas icons'>&#xf304;</i>" icon of an item inside utilities/items
                </i>
                <br />
                <i>*In adding new items with beginning balances, the beginning balances will only reflect to your specified branch and the other branch's item balance will default to 0. </i>
                <hr />
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
                        // console.dir(JSON.stringify(dataf))
                        // console.dir(dataf)
                      }


                      }
                      cssClass="custom-file-input"
                    />
                    <label class="custom-file-label" for="customFile">Choose file</label>
                  </div>
                </form>
                <div>
                  <br />
                  <div class="inline_block">
                    Branch 1
                  </div>
                  &nbsp; &nbsp; &nbsp;
                  <div class="inline_block">
                    <Dropdown
                      type="select"
                      placeholder='Select branch 1'
                      fluid
                      search
                      selection
                      style={inpt_style}
                      onChange={this.myChangeBranch1}
                      options={brnch}
                      // id="addItem"
                      name="unit_name"
                    />
                  </div>
                  &nbsp; &nbsp; &nbsp;
                  <div class="inline_block">
                    Branch 2
                  </div>
                  &nbsp; &nbsp; &nbsp;
                  <div class="inline_block">
                    <Dropdown
                      type="select"
                      placeholder='Select branch 2'
                      fluid
                      search
                      selection
                      style={inpt_style}
                      onChange={this.myChangeBranch2}
                      options={brnch}
                      // id="addItem"
                      name="unit_name"
                    />
                  </div>
                  <div class="inline_block" style={{ float: "right" }}>
                    <a href='/templates/import_item_template.csv' download>Download template here</a><br />
                    <small>*Don't change the headings of the template</small>
                  </div>
                </div>
                <br />
                <BootstrapTable
                  ref='table'
                  data={imported}
                  pagination={true}
                  search={true}
                  cellEdit={cellEditProp}
                // deleteRow={true} selectRow={selectRowProp} options={options}
                >
                  <TableHeaderColumn dataField='id' width="30" dataFormat={this.buttonFormatterDel} isKey={true}></TableHeaderColumn>
                  <TableHeaderColumn width="150" dataField='code' tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Code</TableHeaderColumn>
                  <TableHeaderColumn dataField='name' tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Name</TableHeaderColumn>
                  <TableHeaderColumn width="130" dataField='brand' tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }}  >Brand</TableHeaderColumn>
                  <TableHeaderColumn width="130" dataField='category' tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Category</TableHeaderColumn>
                  <TableHeaderColumn width="100" dataField="measurement">Size</TableHeaderColumn>
                  <TableHeaderColumn width="80" dataField="unit">Unit</TableHeaderColumn>
                  <TableHeaderColumn width="100" dataField="original_price" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }}>Original price</TableHeaderColumn>
                  <TableHeaderColumn width="80" dataField="srp">SRP</TableHeaderColumn>
                  <TableHeaderColumn width="110" dataField="beg_bal1" dataFormat={this.countdate1}>Branch 1 Bal</TableHeaderColumn>
                  <TableHeaderColumn width="110" hidden={true} dataField="date_counted1"></TableHeaderColumn>
                  <TableHeaderColumn width="110" dataField="beg_bal2" dataFormat={this.countdate2}>Branch 2 Bal</TableHeaderColumn>
                  <TableHeaderColumn width="110" hidden={true} dataField="date_counted2"></TableHeaderColumn>

                </BootstrapTable>
                <br />
                <button type="button" className={classNames('btn btn-primary', {
                  'btn-loading': loading,
                })} onClick={this.submitImport} disabled={this.state.branch1 ? false : true}>Import</button>
                <br />
                <small>Please specify what branch are the stocks covered.<br /> * Branch 1 is required</small>
              </div>


              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
              </div>

            </div>
          </div>
        </div>
        <div style={pill_form}>




          <div id="itemMain" class="collapse">
            <br /><hr />


            {/* {this.state.category_id}
                    {this.state.brand_id} */}
            {/* {this.state.unit_name} */}
            <form class="form-inline"
              method="post"
              onSubmit={this.handleSubmit}
              ref={(el) => {
                this.itemForm = el;
              }}
            >

              <table style={table_style}>
                <tr>
                  <td>
                    <label style={label_style} for="name" >Item Name</label>
                    <input type="text"
                      // id="addItem"
                      name="name"
                      // onChange={this.handleChange}
                      onBlur={this.handleChange}
                      style={inpt_style}
                      class="form-control mb-2 mr-sm-8" placeholder="Enter item name"
                      required
                    />
                  </td>
                  <td style={mid_form}></td>
                  <td>



                    <label style={label_style} for="name" >Unit Price</label>
                    <input type="number"
                      // id="addItem"
                      name="unit_price"
                      // onChange={this.handleChange}
                      onBlur={this.handleChange}
                      style={inpt_style}
                      class="form-control mb-2 mr-sm-8" placeholder="Enter item unit price"
                      required
                      step="0.001"
                    />
                  </td>

                </tr>
                <tr>
                  <td>
                    <label style={label_style} for="name" >Measurement</label>
                    <input type="text"
                      // id="addItem"
                      name="size"
                      // onChange={this.handleChange}
                      onBlur={this.handleChange}
                      style={inpt_style}
                      class="form-control mb-2 mr-sm-8" placeholder="Enter item size"

                    />
                  </td>
                  <td style={mid_form}></td>
                  <td>
                    <label style={label_style} for="name" >Original Price</label>
                    <input type="number"
                      // id="addItem"
                      name="original_price"
                      // onChange={this.handleChange}
                      onBlur={this.handleChange}
                      style={inpt_style}
                      class="form-control mb-2 mr-sm-8" placeholder="Enter item original price"
                      required
                      step="0.001"
                    />

                  </td>

                </tr>
                <tr>
                  <td>Unit measure</td>
                  <td style={mid_form}></td>
                  <td>Item Category</td>
                </tr>
                <tr>
                  <td>

                    <Dropdown
                      type="select"
                      placeholder='Select unit'
                      fluid
                      search
                      selection
                      style={inpt_style}
                      onChange={this.myChangeHandlerUnit}
                      options={unt}
                      // id="addItem"
                      name="unit_name"
                      clearable

                    />
                    {/* <BrandOpt onChange={this.myChangeHandlerBrand} /> */}

                  </td>
                  <td style={mid_form}></td>
                  <td>


                    <Dropdown
                      type="select"
                      placeholder='Select category'
                      fluid
                      search
                      selection
                      style={inpt_style}
                      onChange={this.myChangeHandlerCategory}
                      options={itmc}
                      // id="addItem"
                      name="category_id"
                      required
                      clearable
                    />

                  </td>
                </tr>
                <tr><td>Brand</td></tr>
                <tr><td>

                  <Dropdown
                    type="select"
                    placeholder='Select brand'
                    fluid
                    search
                    selection
                    style={inpt_style}
                    onChange={this.myChangeHandlerBrand}
                    options={bb}
                    // id="addItem"
                    name="brand_id"
                    required
                    clearable
                  />

                  <br />
                </td>
                  <td style={mid_form}></td>
                  <td>
                    <label style={label_style} for="name" >ID No</label>
                    <input type="text"
                      // id="addItem"
                      name="id_no"
                      // onChange={this.handleChange}
                      onBlur={this.handleChange}
                      style={inpt_style}
                      class="form-control mb-2 mr-sm-8" placeholder="Enter item ID no"


                    />

                  </td>

                </tr>

                <tr>
                  <td>
                  </td>
                  {/* <td style={mid_form}></td> */}
                  <td>
                    <button type="submit"
                      // className={classNames('btn btn-primary mb-2')}>Add</button>
                      className={classNames('btn btn-primary mb-2', {
                        'btn-loading': loading,
                      })}

                    >Add</button>


                  </td>
                </tr>
              </table>
            </form>
            <hr />
          </div>
        </div>


        <div>
          {error && (
            <div className="alert alert-warning" role="alert">
              {error}
            </div>
          )}
          <br />

          <div className="todos" style={{ width: "100%" }}>





            {/* <div id="import" class="collapse">


            </div> */}

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
            {/* <div class="inline_block"><i>*Select category to load items</i></div> */}
            <br />
            <br />
            <div>
              {/* {this.state.lol} */}
              <span style={{ float: "right", position: "absolute", top: "0", right: "0" }} class="circleNum">{this.state.item_count}</span>

              <div style={{ position: "absolute", left: "-8%", width: "115%" }}>


                <BootstrapTable
                  ref='table'
                  // data={data}
                  data={sorted}
                  pagination={true}
                  search={true}
                  // style={itemTabs}

                  options={options}
                  exportCSV
                >
                  <TableHeaderColumn dataField='code' width="150" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }}>Code</TableHeaderColumn>
                  <TableHeaderColumn dataField='id_no' width="80" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }}>ID No</TableHeaderColumn>
                  <TableHeaderColumn dataField='id' tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} isKey={true} hidden={true}>id</TableHeaderColumn>
                  <TableHeaderColumn dataField='name' tdStyle={{ whiteSpace: 'normal' }} width="200" thStyle={{ whiteSpace: 'normal' }}  >Name</TableHeaderColumn>
                  <TableHeaderColumn dataField='brand' tdStyle={{ whiteSpace: 'normal' }} width="100" thStyle={{ whiteSpace: 'normal' }} >Brand</TableHeaderColumn>
                  <TableHeaderColumn dataField="size" width="100" hidden={true}>Size</TableHeaderColumn>
                  <TableHeaderColumn dataField="unit" hidden={true}>Unit</TableHeaderColumn>
                  <TableHeaderColumn dataField="category" width="130" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }}>Category</TableHeaderColumn>
                  <TableHeaderColumn dataField="category" width="100" dataFormat={this.buttonFormatterCat}>Size</TableHeaderColumn>

                  <TableHeaderColumn dataField="original_price" hidden={role == "Superadmin" ? false : true} width="85">Original</TableHeaderColumn>
                  <TableHeaderColumn dataField="unit_price" width="85">SRP</TableHeaderColumn>
                  <TableHeaderColumn dataField="unit_price" width="90" dataFormat={this.buttonFormatter}>Action</TableHeaderColumn>

                </BootstrapTable>

              </div>
            </div>





            {/* </tbody>
            </table> */}

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

export default connect(mapStateToProps)(Items_main);
