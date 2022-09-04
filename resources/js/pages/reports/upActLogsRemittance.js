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
    Http.post(`/api/v1/reports/upActLogs`, { code: this.props.location.state.id })
      .then((response) => {

        if (this._isMounted) {
          var items = [];
         
          const data = response.data.activities;
          var parDesc;
          console.log(data)
          data.map((itm) => {
            var it = {}
            parDesc = JSON.parse(itm.description);
            console.log(parDesc)

            parDesc.map((desc) => {
              it.amount_remitted = desc.amount_remitted
              it.sys_amount = desc.sys_amount
              it.remark = desc.remark
            }
            )



            it.created_at = itm.created_at
            it.reason = itm.reason




            items.push(it);
          }
          )

          this.setState({
            data: items,

          });

          console.log(items)

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
            <TableHeaderColumn width="100" dataField='amount_remitted' >Amount Remitted</TableHeaderColumn>
            <TableHeaderColumn width="100" dataField='sys_amount' >System Amount</TableHeaderColumn>
            <TableHeaderColumn width="100" dataField='remark' >Remarks</TableHeaderColumn>
            <TableHeaderColumn width="100" dataField='reason' >Reason for changing</TableHeaderColumn>
            <TableHeaderColumn width="100" dataField='created_at' >Date Replaced</TableHeaderColumn>

          </BootstrapTable>
        </div>
      </>
    );
  }


  render() {
    const { data } = this.state;
    const { type, date } = this.props.location.state;

    // console.log(this.props.location.state.code);
    // var ledName, code;
    // const branch = branches.map((brnch) => ({ key: brnch.id, value: brnch.id, text: brnch.name }));

    var sorted = data.sort(function (a, b) {
      // return b.replace_date.localeCompare(a.replace_date);
      return b.created_at.localeCompare(a.created_at);
    });
    return (
      <div className="contentledgerSpec" >
        <Link to={{ pathname: this.props.location.state.path, state: { id: this.props.location.state.id } }}><button type="button" class="btn btn-primary"  > Back </button></Link>
        <br />
        <h1> Remittance previous updates </h1>
        <h5>Previous Records before the current update</h5>
        <br />
        {/* {type == "item" ? this.itms(sorted) : type=="supplier" ? this.itmsSup(sorted) : <></>} */}
        {this.itms(sorted)}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: state.Auth.isAuthenticated,
  user: state.Auth.user,
});

export default connect(mapStateToProps)(UpdateLog);
