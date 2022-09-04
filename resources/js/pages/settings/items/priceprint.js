import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../../Http';
import classNames from 'classnames';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import { Dropdown, Button } from 'semantic-ui-react';
import ReactToPrint from "react-to-print";
import PrintItems from '../../prints/printItem';

class PricePrint extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);

        // Initial state.
        this.state = {
            loading: false,
            load: false,
            name: null,
            error: false,
            upId: null,
            role: null,
            branch_id: null,
            branch_name: null,
            show_stocks: { display: "block" },
            show_branchfilt: { display: "none" },
            show_def: { display: "none" },
            edit_qty: { display: "none" },
            isedit_qty: "no",
            data: [],
            dataTemp: [],
            dataSubTemp: [],
            categories: [],
            dataAll: [],
            dataPrint: [],
            branches: [],
            brands: [],
            totalPrints: 0,
        };

        // API endpoint.
        this.api = '/api/v1/stocksMod';
    }
    componentDidMount() {
        this._isMounted = true
        if (this._isMounted) { this.setState({ load: true }); };
        Http.post(`${this.api}`)
            .then((response) => {
                // const { data } = response.data;
                if (this._isMounted) {

                    console.log("response data", response.data)

                    this.setState({
                        role: response.data.role,
                        data: response.data.stocks,
                        dataAll: response.data.stocks,
                        dataTemp: response.data.stocks,
                        dataSubTemp: response.data.stocks,
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


// brand

    Http.post('/api/v1/getopts')
      .then((response) => {
        // const { data } = response.data;
        if (this._isMounted) {
          this.setState({
            brands: response.data.brands,
            error: false,
          });
          console.log("brands")
          console.log(response.data.brands)
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

    handleChange = (e) => {
        const { key } = e.target.dataset;
        const { name, value } = e.target;
        if (this._isMounted) {
            this.setState({ [name]: value });
        }


    };

    jobStatusValidator = (value, row) => {
        this._isMounted = true
        const { dataPrint } = this.state;
        const nan = isNaN(parseInt(value, 10));
        if (nan) {
            return 'Quantity must be a integer!';
        }

        var dptemp = dataPrint;

        var result = dataPrint.filter(function (v) {
            return v.code == row.code;
        })
        // console.log(newData)
        var count = result.length;
        var diffs = count - value;

        // var newItems=[{}];
        var newData;
        const subs = {
            brand: row.brand,
            code: row.code,
            name: row.name,
            size: row.size,
            unit: row.unit,
            unit_price: row.unit_price,
            id_no: row.id_no
        }
        if (diffs < 0) {
            for (var i = diffs; i < 0; i++) {
                dptemp.push(subs);
            }
        } else if (diffs > 0) {
            dptemp = dptemp.filter(values => !result.includes(values))
            for (var i = 0; i < value; i++) {
                dptemp.push(subs);
            }
        }




        newData = dptemp;

        // console.log(newData)

        if (this._isMounted) {
            this.setState({ dataPrint: newData, totalPrints: newData.length   });
        }
        // console.log(newData)

        return true;
    }



    reset = (e) => {
        this._isMounted = true
        if (this._isMounted) {
            this.setState({ name: null });
        }

    };
    handleExportCSVButtonClick = (onClick) => {
        onClick();
    }

    createCustomExportCSVButton = (onClick) => {
        return (
            <ExportCSVButton
                btnText='Download CSV'
                onClick={() => this.handleExportCSVButtonClick(onClick)} />
        );
    }

  

    myChangeHandlerCats = (e, { value }) => {
        const { dataTemp } = this.state;
        var result = dataTemp.filter(function (v) {
            return v.category_id == value;
        })
        if (this._isMounted) {
            this.setState({ data: result, dataSubTemp: result })
        }

    };
    
    myChangeHandlerZero = (e, { value }) => {
        const { data } = this.state;
        var result = data.filter(function (v) {
            return v.balance != 0;
        })
        if (this._isMounted) {
            this.setState({ data: result, dataSubTemp: result })
        }

    };

 myChangeHandlerbrand = (e, { value }) => {
        const { dataSubTemp } = this.state;
        var result = dataSubTemp.filter(function (v) {
            return v.brand_id == value;
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

    };


    render() {
        const { data, categories, load, dataPrint, branches, brands, dataSubTemp, role } = this.state;


        const options = {
            exportCSVBtn: this.createCustomExportCSVButton
        };

        const stocks = this.state.show_stocks;
        const def = this.state.show_def;
        const cats = categories.map((index) => ({ key: index.id, value: index.id, text: index.name }));
        const brnd = brands.map((index) => ({ key: index.id, value: index.id, text: index.name }));
        // var dataPrint = [];
        const cellEditPropMain = {
            mode: 'click',
            blurToSave: true
        };


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
            name: "All Branch",
          }
          dptemp.push(subs);
        }

        console.log("dataSubTemp")
        console.log(dataSubTemp)
        console.log("dataSubTemp")
    
        const branch = dptemp.map((brnch) => ({ key: brnch.id, value: brnch.id, text: brnch.name }));


        var sorted = data.sort(function (a, b) {
            return a.name.localeCompare(b.name);
          });

        return (
            <div>


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

                        <h1>Print Pricing</h1>
                        <ReactToPrint
                            trigger={() => 
                                <Button content='Print Pricing' icon='print' primary labelPosition='left' />
                            // <button className={classNames('btn btn-primary mb-2')}>Print Pricing</button>
                        }
                            ref={ref => this.returnprt = ref}
                            content={() => this.retRef}
                        />
                        <br/>
                        <br/>
                        <div style={{ display: "none" }}>
                            <PrintItems
                                ref={el => (this.retRef = el)}
                                data={dataPrint}
                            // data={dataPrint}


                            />
                        </div>
                     
                        <div class="slcItemCat" style={{ width: "100%" }}>
                            <div class="inline_block">
                                <Button  onClick={this.resetFilter} content='Reset Filter' icon='undo' labelPosition='left' />
                                {/* <i class="undo icon" onClick={this.resetFilter}></i> */}
                            </div>
                            &nbsp;&nbsp;&nbsp;
                            <div class="inline_block">
                                <Dropdown type="select" placeholder='Select Category' fluid search selection balance
                                    onChange={this.myChangeHandlerCats}
                                    options={cats}
                                    class="form-control form-control-lg "
                                    required
                                />

                            </div>
                            &nbsp;&nbsp;&nbsp;
                            <div class="inline_block">
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
                            &nbsp;&nbsp;&nbsp;
                            <div class="inline_block">
                            <Dropdown
                            
                                type="select"
                                placeholder='Select brands'
                                fluid
                                search
                                selection
                                // style={req_inpt}
                                onChange={this.myChangeHandlerbrand}
                                options={brnd}
                                id="addItem"
                                name="brand_id"
                                required
                                clearable
                            />
                            </div>
                             &nbsp;&nbsp;&nbsp;
                            <div class="inline_block">
                            <Button onClick={this.myChangeHandlerZero} >Exclude Zero (0) Balance</Button> 
                            </div>

                            <span style={{float: "right"}} class="circleNum inline_block">{this.state.totalPrints}</span>


                        </div>


                        <br />
                        <br />
                        <BootstrapTable
                            ref='table'
                            // data={data}
                            data={sorted}
                            pagination={true}
                            search={true}
                            options={options} exportCSV
                            cellEdit={cellEditPropMain}
                        >
                            <TableHeaderColumn dataField='code'hidden width="150" editable={false} isKey={true} >Code</TableHeaderColumn>
                            <TableHeaderColumn dataField='id_no' width="170" editable={false} >Product Code</TableHeaderColumn>
                            <TableHeaderColumn dataField='brand' width="150" editable={false} tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Brand</TableHeaderColumn>
                            <TableHeaderColumn dataField='item' editable={false} tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Item</TableHeaderColumn>
                            <TableHeaderColumn dataField='size' editable={false} width="100" >Measure</TableHeaderColumn>
                            <TableHeaderColumn dataField='unit' editable={false} width="130" >Unit</TableHeaderColumn>
                            <TableHeaderColumn dataField='original_price' hidden={role == "Cashier" ? true : false} editable={false} width="100" >Org. Price</TableHeaderColumn>
                            <TableHeaderColumn dataField='unit_price' width="120" editable={false} >SRP</TableHeaderColumn>
                            <TableHeaderColumn dataField='balance' width="120" editable={false} >Balance</TableHeaderColumn>
                            <TableHeaderColumn dataField='id' hidden={true}></TableHeaderColumn>
                            <TableHeaderColumn width="80" editable={{ validator: this.jobStatusValidator }} >Print</TableHeaderColumn>
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

export default connect(mapStateToProps)(PricePrint);
