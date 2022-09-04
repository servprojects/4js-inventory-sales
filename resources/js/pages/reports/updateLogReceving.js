import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../Http';
import classNames from 'classnames';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import { Link } from 'react-router-dom';
import ReactToPrint from "react-to-print";
import PrintReport from '../prints/printReport';
import { Dropdown } from 'semantic-ui-react';//filt_branch
class UpdateLog extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);

        // Initial state.
        this.state = {
            error: null,
            data: [],
        };
        // API endpoint.
        // this.api = '/api/v1/reports/sales';
    }
    componentDidMount() {
        this._isMounted = true
        Http.post(`/api/v1/reports/upLogs`, { code: this.props.location.state.code, type: "Receiving Item"  })
            .then((response) => {

                if (this._isMounted) {
                    const data = response.data.items
                    const { id, type, trans_type } = this.props.location.state;
                    console.log("lol")
                    var items = [];

                    if (type == "item") {
                        data.map((itm) => {

                            var parItms = JSON.parse(itm.items);
                            // console.log("elljhg")
                            // console.log(parItms)

                           

                            

                            parItms.map((itmD) => {
                                       

                                            var itmid = id;
                                            var it = {}

                                       it.replace_date = itm.date_transac;
                                            

                                                if (itmD.item_id == id) {
                                                    it.beg_balance = itmD.beg_balance
                                                    it.beg_collectible = itmD.beg_collectible
                                                    it.created_at = itmD.created_at
                                                    it.end_balance = itmD.end_balance
                                                    it.end_collectible = itmD.end_collectible
                                                    it.id = itmD.id
                                                    it.item_id = itmD.item_id
                                                    it.item_status = itmD.item_status
                                                    it.old_transaction_id = itmD.old_transaction_id
                                                    it.original_price = itmD.original_price
                                                    it.quantity = itmD.quantity
                                                    it.supplier_id = itmD.supplier_id
                                                    it.transaction_id = itmD.transaction_id
                                                    it.unit_price = itmD.unit_price
                                                    it.updated_at = itmD.updated_at
                                                   
                
                                                    items.push(it);
                
                
                                                   
                                                }
                
                
                                           
                
                                        }

                              
                             )



                      



                    }


            )
    }

// console.log("items")
// console.log(items)
// var result = data.filter(function (v) {
//   return v.id == 45;
// })

// var parItms = JSON.parse(result[0].items);

// var resultitm = parItms.filter(function (v) {
//   return v.type == "Items";
// })
// console.log(resultitm[0].details)
this.setState({
    data: items,

});
        }
      })

      .catch (() => {
    if (this._isMounted) {
        this.setState({
            error: 'Unable to fetch data.',
        });
    }
});
  }



itms = (e, print) => {
    const zm = { zoom: "85%" }
    return (
        <>

            <div style={print ? zm : {}}>
                <BootstrapTable
                    ref='table'
                    data={e}
                    pagination={print ? false : true}
                    search={print ? false : true}
                // options={options} exportCSV
                >
                    <TableHeaderColumn isKey={true} hidden width="180" dataField='id' >Code</TableHeaderColumn>
                    <TableHeaderColumn width="150" dataField='replace_date' >Replace Date</TableHeaderColumn>
                    <TableHeaderColumn width="100" dataField='item_status' >Type</TableHeaderColumn>
                    <TableHeaderColumn width="100" dataField='unit_price' >SRP</TableHeaderColumn>
                    <TableHeaderColumn width="100" dataField='quantity' >Quantity</TableHeaderColumn>
                    <TableHeaderColumn width="150" hidden={true} dataField='beg_balance' >Beg. Balance</TableHeaderColumn>
                    <TableHeaderColumn width="150" dataField='end_balance' >End Balance</TableHeaderColumn>
                    <TableHeaderColumn width="150" hidden={true} dataField='beg_collectible' >Beg Collectible</TableHeaderColumn>
                    <TableHeaderColumn width="150" dataField='end_collectible' >End Collectible</TableHeaderColumn>
                    {/* <TableHeaderColumn width="200" dataField='created_at' >Updated at</TableHeaderColumn> */}

                </BootstrapTable>
            </div>
        </>
    );
}

myChangeHandlerbranch = (e, { value, key }) => {
    this._isMounted = true
    if (this._isMounted) {

        this.setState({
            branch_id: value,

        });
    }
    Http.post(`/api/v1/reports/specitemledger`, { id: this.props.location.state.id, branch_id: value })
        .then((response) => {
            // const { data } = response.data.transaction.data;
            if (this._isMounted) {

                this.setState({
                    data: response.data.ledger,

                });
            }
        })
    toast("Data fetched")
        .catch(() => {
            toast("Unable to fetch data")
        });
};
render() {
    const { data } = this.state;
    const { type, trans_type } = this.props.location.state;

    // console.log(this.props.location.state.code);
    // var ledName, code;
    // const branch = branches.map((brnch) => ({ key: brnch.id, value: brnch.id, text: brnch.name }));

    var sorted = data.sort(function (a, b) {
        return b.replace_date.localeCompare(a.replace_date);
    });
    return (
        <div className="contentledgerSpec" >
            <Link to={{ pathname: this.props.location.state.path, state: { id: this.props.location.state.id } }}><button type="button" class="btn btn-primary"  > Back </button></Link>
            <br />
            <h1>  <small>  {this.props.location.state.code} - {this.props.location.state.itm}</small></h1>
            <h2>Previous Records before the current update</h2>
            <br />
            {trans_type}  

            {type == "item" ? this.itms(sorted) : <></>}
            {/* {this.itms(data)} */}
        </div>
    );
}
}

const mapStateToProps = (state) => ({
    isAuthenticated: state.Auth.isAuthenticated,
    user: state.Auth.user,
});

export default connect(mapStateToProps)(UpdateLog);
