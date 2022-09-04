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
   this.getDebitTrans();
    }

    getDebitTrans = () =>{
        this._isMounted = true

        Http.post(`/api/v1/reports/getDebitTrans`, { return_id: this.props.id })
        .then((response) => {
          var itm= response.data.items;
            if (this._isMounted) {

                this.setState({
                    debit_code: itm[0].debit_code,
                });

                this.getData(itm[0].debit_code);
            }
            console.log("debit")
            console.log(response.data.items)
        })
        .catch(() => {
            if (this._isMounted) {
                this.setState({
                    error: 'Unable to fetch data.',
                });
            }
        });

    }

    getData=(code)=>{
        this._isMounted = true



        const subs ={ code: code, type: "Debit Update" };
        console.log(subs)
        Http.post(`/api/v1/reports/upLogs`, subs)
            .then((response) => {

                if (this._isMounted) {
                    const data = response.data.items

                    console.log("data")
                    console.log(data)


                    var items = [];


                    data.map((itm) => {

                        var parItms = JSON.parse(itm.items);
                        var it = {}




                        // var sd = new Date(itm.created_at);
                        // var sye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(sd);
                        // var smo = new Intl.DateTimeFormat('en', { month: 'numeric' }).format(sd);
                        // var sda = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(sd);
                        // var hour = new Intl.DateTimeFormat('en', { hour: 'numeric' }).format(sd);
                        // var min = new Intl.DateTimeFormat('en', { minute: 'numeric' }).format(sd);
                        // var sec = new Intl.DateTimeFormat('en', { second: 'numeric' }).format(sd);

                        it.replace_date = itm.date_transac;
                        // it.replace_date = smo + '/' + sda + '/' + sye + '   ' + hour + min + ':' + sec;


                        parItms.map((det) => {
                            it.payable = det.payable
                            it.date_transac = det.date_transac
                        }
                        )
                        items.push(it);
                    }


                    )


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
    creditFormatter = (cell, row) => {
        return (

            <div>
                { row.credit == null ? "Cash" : "Credit"}
                {/* {row.credit == null ? "Cash" : "Credit"} */}
            </div>
        );

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
                        <TableHeaderColumn isKey={true} hidden width="180" dataField='id' ></TableHeaderColumn>
                        <TableHeaderColumn width="130" dataField='date_transac' >Transaction Date</TableHeaderColumn>
                        <TableHeaderColumn width="130" dataField='payable' >Amount Due</TableHeaderColumn>
                         <TableHeaderColumn width="200" dataField='replace_date' >Replace Date</TableHeaderColumn>

                    </BootstrapTable>
                </div>
            </>
        );
    }



    render() {
        const { data } = this.state;
       
        // console.log(this.props.location.state.code);
        // var ledName, code;
        // const branch = branches.map((brnch) => ({ key: brnch.id, value: brnch.id, text: brnch.name }));

        var sorted = data.sort(function (a, b) {
            return b.replace_date.localeCompare(a.replace_date);
        });
        return (
            <div className="contentledgerSpec" >
               

                {/* {type == "item" ? this.itms(sorted) : type=="supplier" ? this.itmsSup(sorted) : <></>} */}
                {/* {this.itms(data)} */}
             
                <button  type="button"  class={ "btn btn-secondary btn-circle btn-circle-sm m-1"} 
                data-toggle="modal" data-target={"#modsPC"} onClick={this.getDebitTrans} >
        Debit Transaction Log
          </button>
                <div class="modal fade " id="modsPC" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-lg" role="document">
                        <div class="modal-content">

                            <div class="modal-body">
                               
                            {this.itms(sorted)}
                            {/* {this.itms(data)} */}

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

export default connect(mapStateToProps)(UpdateLog);
