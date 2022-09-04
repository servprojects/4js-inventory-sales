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
    Http.post(`/api/v1/reports/upLogs`, { code: this.props.location.state.code })
      .then((response) => {

        if (this._isMounted) {
          const data = response.data.items
          const { id, type, trans_type } = this.props.location.state;
          console.log("lol")
          var items = [];

          if (type == "item") {
            data.map((itm) => {

              var parItms = JSON.parse(itm.items);
              console.log("ell")
              console.log(parItms)

              // var resultitm = parItms.filter(function (v) {
              //   return v.type == "Items";
              // })

              var tayp;
              var resultitm = parItms.filter(function (v) {
                if (v.type == "Transaction") {
                  tayp = "Transaction";
                  return v
                } else {
                  tayp = "Items";
                  return v
                }
                // return v.type == "Transaction";
                // return v.type == "Items";
              })

              if (tayp == "Items") {
                var details = resultitm[0].details;

                var itmid = id;
                var it = {}

                // Just added
                if (trans_type == "Sale") {
                  details = [details]
                }

                // if (trans_type == "Sale") {
                //   details = [details]
                // }





                var ip = details.filter(function (v) {

                  if (v.item_id == itmid) {
                    it.beg_balance = v.beg_balance
                    it.beg_collectible = v.beg_collectible
                    it.created_at = v.created_at
                    it.end_balance = v.end_balance
                    it.end_collectible = v.end_collectible
                    it.id = v.id
                    it.item_id = v.item_id
                    it.item_status = v.item_status
                    it.old_transaction_id = v.old_transaction_id
                    it.original_price = v.original_price
                    it.quantity = v.quantity
                    it.supplier_id = v.supplier_id
                    it.transaction_id = v.transaction_id
                    it.unit_price = v.unit_price
                    it.updated_at = v.updated_at
                    it.replace_date = v.replace_date

                    items.push(it);


                    return v.item_id == itmid;
                  }


                })

              }



            }


            )
          } else if (type == "supplier") {
            data.map((itm) => {
              var parItms = JSON.parse(itm.items);

              var trans = trans_type == "Credit" ? "Credit" : "Transaction"
              var resultitm = parItms.filter(function (v) {
                // return v.type == "Credit";
                return v.type == trans;
              })

              if (trans_type == "Account Payment") {
                var dt = resultitm[0].details;
                var it = {}
                it.payable = dt[0].payable
                it.end_charge_bal = dt[0].end_charge_bal
                it.beg_charge_bal = dt[0].beg_charge_bal
                it.replace_date = dt[0].last_update


                var resultitmch = parItms.filter(function (v) {
                  // return v.type == "Credit";
                  return v.type == "Cheque";
                })
                var ch = resultitmch[0].details;

                it.ch_code = ch[0].code
                it.bank = ch[0].bank
                it.ch_date = ch[0].date
                it.payee = ch[0].payee

                items.push(it);


              } else {
                var dt = resultitm[0].details;
                var it = {}
                it.payable = dt[0].payable
                it.end_charge_bal = dt[0].end_charge_bal
                it.beg_charge_bal = dt[0].beg_charge_bal
                it.replace_date = dt[0].last_update
                items.push(it);
              }


            }
            )
          }

          console.log("items")
          console.log(items)
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

      .catch(() => {
        if (this._isMounted) {
          this.setState({
            error: 'Unable to fetch data.',
          });
        }
      });
  }
  setUpId = (e) => {
    this._isMounted = true
    const { key } = e.target.dataset;
    if (this._isMounted) {
      this.setState({ upIdItem: key })
    }

    Http.post(`/api/v1/reports/saleItems`, { id: key })
      .then((response) => {
        // const { data } = response.data.transaction.data;
        if (this._isMounted) {

          this.setState({
            tranItems: response.data.items,

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



  };

  buttonFormatter = (cell, row) => {
    const { tranItems } = this.state;
    return (
      //  <button
      //  type="button"
      //  className="btn btn-primary"
      //  data-key={row.id}
      //  >
      //  Receive
      //  </button>
      <div>
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#exampleModal" >
          Ledger
    </button>

      </div>
    )
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
  itmsSup = (e, print) => {
    const zm = { zoom: "85%" }
    const { trans_type } = this.props.location.state;
    return (
      <>

        <div style={print ? zm : {}}>

          {
            trans_type == "Account Payment" ?
              <BootstrapTable
                ref='table'
                data={e}
                pagination={print ? false : true}
                search={print ? false : true}
              // options={options} exportCSV
              >
                <TableHeaderColumn isKey={true} hidden width="180" dataField='id' >Code</TableHeaderColumn>
                <TableHeaderColumn width="100" dataField='replace_date' >Replace Date</TableHeaderColumn>
                <TableHeaderColumn width="100" dataField='payable' >Payable</TableHeaderColumn>
                <TableHeaderColumn width="100" dataField='ch_code' >Cheque Code</TableHeaderColumn>
                <TableHeaderColumn width="100" dataField='bank' >Bank</TableHeaderColumn>
                <TableHeaderColumn width="100" dataField='ch_date' >Cheque Date</TableHeaderColumn>
                <TableHeaderColumn width="100" dataField='payee' >Payee</TableHeaderColumn>
                <TableHeaderColumn width="100" dataField='end_charge_bal' >Ending Balance</TableHeaderColumn>

              </BootstrapTable>
              :
              <BootstrapTable
                ref='table'
                data={e}
                pagination={print ? false : true}
                search={print ? false : true}
              // options={options} exportCSV
              >
                <TableHeaderColumn isKey={true} hidden width="180" dataField='id' >Code</TableHeaderColumn>
                <TableHeaderColumn width="100" dataField='replace_date' >Replace Date</TableHeaderColumn>
                <TableHeaderColumn width="100" dataField='payable' >Payable</TableHeaderColumn>
                <TableHeaderColumn width="100" dataField='end_charge_bal' >Ending Balance</TableHeaderColumn>

              </BootstrapTable>

          }
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
        
        {type == "item" ? this.itms(sorted) : type == "supplier" ? this.itmsSup(sorted) : <></>}
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
