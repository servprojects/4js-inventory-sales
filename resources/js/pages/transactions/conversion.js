import React, { Component, useRef } from 'react';
// import PrintHeader from './printHeader';
import Http from '../../Http';
import { connect } from 'react-redux';
import ReactToPrint from "react-to-print";
import { Dropdown, Icon, Button } from 'semantic-ui-react';
import PrintReportItem from '../prints/printReportItem';
import { Link } from 'react-router-dom';
import ReactHTMLTableToExcel from 'react-html-table-to-excel';
import ExHead from '../prints/excelHeader';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

class AllItems extends Component {
    _isMounted = false
    constructor(props) {
        super(props);
        this.state = {
            itOn: false,
            role: null,
            from_item_id: null,
            to_item_id: null,
            branch_id: null,
            org_itm_bal: null,
            equivalent: null,
            equivalent_unit: null,
            selItm_name: "",
            branch_name: null,
            from_qty: null,
            // returnPack: "no",
            returnPack: null,
            to_qty: null,
            const_qty: "",
            const_unit: "",
            org_unit: "",
            org_size: "",
            branches: [],
            data: [],
            subqty: [],
            match: [],
            normal: "normal",
        }
    }

    componentDidMount() {
        this._isMounted = true
        Http.get('/api/v1/branch')
            .then((response) => {
                // const { data } = response.data;
                if (this._isMounted) {
                    this.setState({
                        branches: response.data.branches,
                        role: response.data.role,
                        error: false,
                    });
                }
            })
            .catch(() => {
                this.setState({
                    error: 'Unable to fetch data.',
                });
            });

        this.getitems();


    }

    getitems = (branch) => {
        this._isMounted = true
        Http.post('/api/v1/getitems', { branch_id: branch })
            .then((response) => {
                // const { data } = response.data;
                if (this._isMounted) {
                    this.setState({
                        subqty: response.data.subqty,
                        branch_name: response.data.branch_name,
                        branch_id: response.data.branch_id,
                    });
                }


            })
            .catch(() => {
                this.setState({
                    error: 'Unable to fetch data.',
                });
            });




    }

    getmatchitems = (branch, item_id) => {
        this._isMounted = true
        Http.post('/api/v1/getmatchitems', { branch_id: branch,item_id: item_id })
            .then((response) => {
                // const { data } = response.data;

                var mt = response.data.match;
                if (this._isMounted) {
                    this.setState({
                        match: response.data.match,
                        to_item_id: mt[0].id
                    });
                    
                    if (this.state.returnPack == "yes") {



                        const { subqty } = this.state;

                        var result = subqty.filter(function (v) {
                            return v.id == mt[0].id;
                        })
console.log('result')
console.log(result)
                        this.setState({
                                       
                            equivalent: result[0].const_qty,
                            equivalent_unit: result[0].const_unit
                        });


                        // Http.post('/api/v1/getmatchitems', { branch_id: branch, item_id :  mt[0].id })
                        //     .then((response2) => {
                        //         console.log("new")
                        //         console.log(mt[0].id)
                        //         var tomatch = response2.data.match
                        //         // const { data } = response.data;
            
                               
                        //         if (this._isMounted) {
                        //             this.setState({
                                       
                        //                 equivalent: tomatch[0].size
                        //             });
            
            
                        //         }
                        //     })
                        //     .catch(() => {
                        //         this.setState({
                        //             error: 'Unable to fetch data.',
                        //         });
                        //     });
            
                    }

                }
            })
            .catch(() => {
                this.setState({
                    error: 'Unable to fetch data.',
                });
            });

        


    }

    handleItem = (e, { value }) => {
        // 
        this._isMounted = true
        const { subqty } = this.state;

        var result = subqty.filter(function (v) {
            return v.id == value;
        })

        if (this._isMounted) {
            this.setState({
                selItm: null,
                org_itm_bal: null,
                org_unit: "",
                org_size: "",
                const_qty: "",
                const_unit: "",
                selItm_name: "",
                from_qty: null,
                to_qty: null,
                match: []
            })


            this.setState({
                from_item_id: value,
                selItm: value,
                selItm_name: result[0].name,
                org_itm_bal: result[0].balance,
                org_unit: result[0].unit,
                org_size: result[0].size,
                const_qty: result[0].const_qty,
                const_unit: result[0].const_unit
            })
        }

        this.itemForm.reset();
        this.getmatchitems(this.state.branch_id, value);
    };

    handleBranch = (e, { value }) => {

        this._isMounted = true

        if (this._isMounted) {
            this.setState({
                selItm: null,
                org_itm_bal: null,
                org_unit: "",
                org_size: "",
                const_qty: "",
                const_unit: "",
                selItm_name: "",
                from_qty: null,
                to_qty: null,
                match: []
            })
        }
        this.itemForm.reset();
        this.getitems(value);
    };

    handlechange = (e) => {
        const { name, value } = e.target;
        this._isMounted = true

        if (this._isMounted) {
            this.setState({
                [name]: value,
            })
        }
    }

    handlechangeQty = (e) => {
        const { value } = e.target;
        const { org_itm_bal, const_qty, returnPack, equivalent } = this.state;
        this._isMounted = true

        if (this._isMounted) {
            if (value > org_itm_bal) {
                toast("Insufficient balance")
            } else {
                var qty;
                if (returnPack == "yes") {
                    // qty = value / parseFloat(const_qty)
                    qty = value / equivalent
                } else {
                    qty = value * parseFloat(const_qty)
                }

                this.setState({
                    from_qty: value,
                    to_qty: qty,
                })
            }

        }

    };

    makeReturn = (e) => {
        this._isMounted = true

        if (this._isMounted) {
            this.setState({
                selItm: null,
                org_itm_bal: null,
                org_unit: "",
                org_size: "",
                const_qty: "",
                const_unit: "",
                selItm_name: "",
                from_qty: null,
                to_qty: null,
                match: [],
                returnPack: this.state.returnPack == "no" ? "yes" : "no",
            })
        }

        this.itemForm.reset();
    }


    convert = (e) => {
        const { branch_id, from_item_id, from_qty, to_qty, to_item_id } = this.state;

        if (branch_id && from_item_id && from_qty && to_qty && to_item_id) {
            const subs = {
                branch_id: branch_id,
                from_item_id: from_item_id,
                from_qty: parseFloat(from_qty),
                to_qty: to_qty,
                to_item_id: to_item_id,

            }

            console.log(subs)
            if (confirm("Are you sure you want to convert items?")) {
                Http.post('/api/v1/convert', subs)
                    .then((response) => {
                        // const { data } = response.data;
                        if (this._isMounted) {
                            this.setState({
                                selItm: null,
                                org_itm_bal: null,
                                org_unit: "",
                                org_size: "",
                                const_qty: "",
                                const_unit: "",
                                selItm_name: "",
                                from_qty: null,
                                to_qty: null,
                                match: []
                            })
                        }

                        toast("Success!")
                    })
                    .catch(() => {
                        toast("Failed!")
                    });

            }



        } else {
            toast("Data not yet complete")
        }



    }

    mainContent = () => {
        const { branches, subqty, match, org_unit, org_size, org_itm_bal, const_qty, returnPack, const_unit, selItm_name, to_qty } = this.state;
        const brnch = branches.map((index) => ({ key: index.id, value: index.id, text: index.name }));
        // const sbt = subqty.map((index) => ({ key: index.id, value: index.id, text: index.name }));
        const sbt = subqty.map((items) => ({ key: items.id, value: items.id, text: items.code.concat('\xa0\xa0\xa0\xa0', items.name, "-", items.brand, " : ", items.size || items.unit ? items.size + " " + items.unit : "(No Size Spec.)") }));

        console.log("subqty")
        console.log(subqty)

      
        return (
            <>

                <br />
                <br />
                <b>  {returnPack == "yes" ? " Returning Package" : "Extracting Package"} </b>
                <br /><br /><br />
                {
                    this.state.role == "Superadmin" ?
                        <Dropdown
                            type="select"
                            placeholder='Select branch'
                            fluid
                            search
                            selection
                            onChange={this.handleBranch}
                            options={brnch}
                            id="addItem"
                            name="unit_name"
                            clearable
                        /> : <></>

                }
                <br />
                <div style={{ width: "60%" }} class="inline_block">
                    Items with measurement conversion
                        <Dropdown
                        type="select"
                        placeholder='Select item'
                        fluid
                        search
                        selection
                        onChange={this.handleItem}
                        options={sbt}
                        id="addItem"
                        name="unit_name"
                        clearable
                    />
                </div>
                        &nbsp;&nbsp;&nbsp;
                <div style={{ width: "15%" }} class="inline_block">
                    Measurement
                           <input type="text" disabled class="form-control mb-2 mr-sm-8" value={org_size + "-" + org_unit} />
                </div>
                <div style={{ width: "15%", float: "right" }} class="inline_block">
                    Balance
                           <input type="text" disabled class="form-control mb-2 mr-sm-8" defaultValue={org_itm_bal} />
                </div>

                <br />
                <br />

                <div style={{ width: "15%" }} class="inline_block">
                    Convert M.
                           <input type="text" disabled class="form-control mb-2 mr-sm-8" value={const_qty + "-" + const_unit} />
                </div>


                        &nbsp;&nbsp;&nbsp;&nbsp;

                {match.map((m) => (
                    <>

                        <div style={{ width: "60%" }} class="inline_block">
                            Matched item
                                    {/* <input type="text" disabled class="form-control mb-2 mr-sm-8" value={m.name + ": " + m.size + "-" + m.unit} /> */}
                            <input type="text" disabled class="form-control mb-2 mr-sm-8" value={m.name + ": " + m.unit} />
                        </div>
                        <div style={{ width: "15%", float: "right" }} class="inline_block">
                            Balance
                           <input type="text" disabled class="form-control mb-2 mr-sm-8" defaultValue={m.balance} />
                        </div>
                    </>
                ))}
                {returnPack == "yes" ?
                    <div style={{ width: "15%" }} class="inline_block">
                        Equivalent
                           {/* <input type="number" name="equivalent" defaultValue={eqv} disabled onChange={this.handlechange} step=".001" class="form-control mb-2 mr-sm-8" /> */}
                           <input type="text" name="equivalent" value={this.state.equivalent + "-" + this.state.equivalent_unit} disabled onChange={this.handlechange} step=".001" class="form-control mb-2 mr-sm-8" />
                    </div>
                    : <></>}

                <hr />

                <b> Convert </b>
                <br />
                <br />
                <div style={{ width: "15%" }} class="inline_block">
                    Quantiy

                <form ref={(el) => {
                        this.itemForm = el;
                    }}>
                        <input type="number" onBlur={this.handlechangeQty} class="form-control mb-2 mr-sm-8" /> </form>
                </div>

                <div style={{ width: "80%", float: "right" }} class="inline_block">
                    Item
                           {/* <input type="text" disabled class="form-control mb-2 mr-sm-8" value={selItm_name + ": " + org_size + "-" + org_unit} /> */}
                    <input type="text" disabled class="form-control mb-2 mr-sm-8" value={selItm_name + ": " + org_unit} />
                </div>
                <br />
                {/* <b> To </b>
                        <br /> */}
                <br />

                <div style={{ width: "15%" }} class="inline_block">
                    Quantiy
                           <input type="number" defaultValue={to_qty} disabled class="form-control mb-2 mr-sm-8" />
                </div>
                {match.map((m) => (
                    <div style={{ width: "80%", float: "right" }} class="inline_block">
                        Item
                        <input type="text" disabled class="form-control mb-2 mr-sm-8" value={m.name + ":" + m.unit} />
                        {/* <input type="text" disabled class="form-control mb-2 mr-sm-8" value={m.name + ": " + m.size + "-" + m.unit} /> */}
                    </div>
                ))}
                <hr />
                <Button onClick={this.convert} style={{ float: "right" }} primary>Convert</Button>


            </>
        )
    }
    changeType = (e, { value }) => {
        this._isMounted = true
        this._isMounted = true

        if (this._isMounted) {
            this.setState({
                selItm: null,
                org_itm_bal: null,
                org_unit: "",
                org_size: "",
                const_qty: "",
                const_unit: "",
                selItm_name: "",
                from_qty: null,
                to_qty: null,
                match: [],
                returnPack: value,
                // returnPack: this.state.returnPack == "no" ? "yes" : "no",
            })
        }

        this.itemForm.reset();

    };
    render() {
        const { branches, subqty, match, org_unit, org_size, org_itm_bal, const_qty, returnPack, const_unit, selItm_name, to_qty } = this.state;
        const brnch = branches.map((index) => ({ key: index.id, value: index.id, text: index.name }));
        // const sbt = subqty.map((index) => ({ key: index.id, value: index.id, text: index.name }));
        const sbt = subqty.map((items) => ({ key: items.id, value: items.id, text: items.code.concat('\xa0\xa0\xa0\xa0', items.name, "-", items.brand, " : ", items.size || items.unit ? items.size + " " + items.unit : "(No Size Spec.)") }));

        console.log("subqty")
        console.log(subqty)

        const typeOptions = [
            { key: '1', text: 'Extract Package', value: 'no' },
            { key: '2', text: 'Return Package', value: 'yes' },
        ]
        return (
            <>
                <ToastContainer />
                <div style={{ position: "absolute", margin: "10px" }}>
                    <i><span style={{ color: "red" }}>*</span>Return Package will divide <b>Convert Quantity</b> over <b>Equivalent</b></i><br />
                    <i><span style={{ color: "red" }}>*</span>Extract Package will multiply <b>Convert M.</b> and <b>Convert Quantity</b></i>
                </div>
                <div style={{ width: "50%", marginLeft: "25%" }}>
                    <div className="contentTransactSales" >
                        <nav aria-label="breadcrumb">
                            <ol class="breadcrumb">
                                <li class="breadcrumb-item active" aria-current="page">Conversion</li>

                            </ol>

                        </nav>
                        Current Branch: <b> {this.state.branch_name} </b>
                        <div style={{ float: "right" }}>
                            <Dropdown
                                button
                                className='icon'
                                floating
                                labeled
                                icon='setting'
                                onChange={this.changeType}
                                options={typeOptions}
                                search
                                text='Conversion Options'
                            />
                        </div>
                        {/* <Button onClick={this.makeReturn} style={{ float: "right" }}>{returnPack == "no" ? " Return Package" : "Extract Package"} </Button> */}
                        {/* {returnPack} */}

                        {
                            returnPack ?
                                this.mainContent()
                                : <></>
                        }

                    </div>
                </div>
            </>

        );
    }
}
// export default PrintReport;
const mapStateToProps = (state) => ({
    isAuthenticated: state.Auth.isAuthenticated,
    user: state.Auth.user,
});

export default connect(mapStateToProps)(AllItems);
