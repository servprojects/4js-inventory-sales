import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Dropdown, Icon, Button } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import Http from '../../Http';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TransLog from "../reports/updateLogDebitTrans";
import UpdateItemReturn from "../reports/updateItemReturn";
import ModItems from "../reports/modIems_upReturn";
import update from 'immutability-helper';

class UpRet extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props);

        // Initial state.
        this.state = {
            tranItems: [],
            released: [],
            replacements: [],
            selected: [],
            modSelected: [],
            details: [],
            transItmdata: [],
            customer_name: null,
            debit_code: null,
            org_type: null,
            accountability: null,
            modRetRep: "no",
            modReturn: "no",
            modReplace: "no",
        };

    }

    componentDidMount() {
        this.getItems()
        this.getDebitTrans()
    }

    getItems = () => {
        this._isMounted = true
        Http.post(`/api/v1/reports/saleItems`, { id: this.props.location.state.id })
            .then((response) => {
                // const { data } = response.data.transaction.data;
                if (this._isMounted) {

                    var details = response.data.details;
                    var cust;
                    var type;
                    var acc;
                    details.map((d) => {
                        cust = d.customer_name;
                        type = d.org_type;
                        acc = d.accountability;
                    })
                    this.setState({
                        tranItems: response.data.items,
                        details: details,
                        customer_name: cust,
                        org_type: type,
                        accountability: acc,
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

        if (this._isMounted) {

            this.setState({
                sdate: this.props.sdate,
                edate: this.props.edate,

            });
        }
    }

    getDebitTrans = () =>{
        

        Http.post(`/api/v1/reports/getDebitTrans`, { return_id: this.props.location.state.id })
        .then((response) => {
          var itm= response.data.items;
            if (this._isMounted) {

                this.setState({
                    debit_code: itm[0].debit_code,
                });
            }
            // console.log("debit")
            // console.log(response.data.items)
        })
        .catch(() => {
            if (this._isMounted) {
                this.setState({
                    error: 'Unable to fetch data.',
                });
            }
        });

    }

setModRetRep = () =>{
    this._isMounted = true;
    this.setState({
        modRetRep: this.state.modRetRep == "no" ? "yes" : "no",
    });
}

setModReturn = () =>{
    this._isMounted = true;
    this.setState({
        modReturn: this.state.modReturn == "no" ? "yes" : "no",
    });
}

setModReplace = () =>{
    this._isMounted = true;
    this.setState({
        modReturn: this.state.modReplace == "no" ? "yes" : "no",
    });
}


    onRowSelect = (row, isSelected, e) => {
        const { selected, selected: se } = this.state;


        var dptemp = selected;
        if (this._isMounted) {
            if (isSelected) {
                const subs = {
                    id: row.ti_id,
                }
                dptemp.push(subs);
                this.setState({
                    selected: dptemp,
                });

            } else {
                const index = se.findIndex(
                    (sc) => parseInt(sc.id, 10) === parseInt(row.ti_id, 10),
                );
                const dptemp = [...se.slice(0, index), ...se.slice(index + 1)];

                this.setState({
                    selected: dptemp,
                });

            }
        }
    }

    onSelectAll = (isSelected, rows) => {



        const { selected, selected: se } = this.state;
        var dptemp = selected;
        var subs;
        if (this._isMounted) {
            if (isSelected) {
                dptemp = [];
                for (let i = 0; i < rows.length; i++) {
                    // alert(rows[i].id);
                    subs = {
                        id: rows[i].ti_id,
                    }
                    dptemp.push(subs);
                }
                this.setState({
                    selected: dptemp,
                });

            } else {
                dptemp = [];
                this.setState({
                    selected: dptemp,
                });
            }
        }

    }
    totalitmFormatter = (cell, row) => {
        return (

            <div>
                {row.quantity * row.unit_price}
                {/* {row.req_type } */}
            </div>
        );

    }

    submitModDebit = () => {

        const { selected } = this.state;
        const subs = {
            return_id: this.props.location.state.id,
            items: JSON.stringify(selected)
        }

        if (selected.length > 0) {

            if (confirm("Are you sure you want to change the debit status of items? This will affect the charge balance of this account")) {
                // console.log(subs)

                Http.post(`/api/v1/mod/transaction/debit`, subs)
                    .then((response) => {
                        toast("Update Successful")
                        this.getItems()
                    })
                    .catch(() => {
                        toast("Update failed")
                    });
            }
        } else {
            toast("Please select item to modify debit")
        }



    }

    uplogicon = (cell, row) => {
       
        return (
          <>
    
           <i class="file alternate icon"  data-toggle="modal" data-target={"#modsItm"} data-itid={row.item_id} onClick={this.getData}></i>
            
          </>
        )
      }

      transitms = (e, print) => {
       
        const zm = { zoom: "85%" }
if(e){
        var sorted = e.sort(function (a, b) {
            return b.replace_date.localeCompare(a.replace_date);
          });}

        return (
            <>

                <div style={print ? zm : {}}>
                    <BootstrapTable
                        ref='table'
                        data={sorted}
                        pagination={print ? false : true}
                        search={print ? false : true}
                    // options={options} exportCSV
                    >
                        <TableHeaderColumn isKey={true} hidden width="180" dataField='id' ></TableHeaderColumn>
                        <TableHeaderColumn width="130" dataField='debit' >Debit</TableHeaderColumn>
                        <TableHeaderColumn width="130" dataField='item_status' >Status</TableHeaderColumn>
                        <TableHeaderColumn width="130" dataField='quantity' >Quantity</TableHeaderColumn>
                         <TableHeaderColumn width="200" dataField='replace_date' >Replace Date</TableHeaderColumn>

                    </BootstrapTable>
                </div>
            </>
        );
    }

    getData=(e)=>{
        this._isMounted = true
const {itid} = e.target.dataset;

console.log(itid)
        const subs ={ code: this.props.location.state.code, type: "Item Update" };
        // console.log(subs)
        Http.post(`/api/v1/reports/upLogs`, subs)
            .then((response) => {

                if (this._isMounted) {
                    const data = response.data.items

                    // console.log("data")
                    // console.log(data)


                    var items = [];


                    data.map((itm) => {
                     
                        var parItms = JSON.parse(itm.items);

                        var it = {};
                      
                        parItms.map((det) => {
                             if(det.item_id == itid){   
                                  
                                   it.replace_date = itm.date_transac;
                                   it.debit = det.debit
                                   it.item_status = det.item_status
                                   it.quantity = det.quantity
                                   items.push(it);
                             }      

                        }
                        )
                        
                   
                    }
                    )
                    this.setState({
                        transItmdata: items,

                    });
                }
            })
            .catch(() => {
                toast("Error fetching")
            });
    }
    handleReturnMod = (e)=>{
        const {quantity, uprice, key,status,itemname, item_id}= e.target.dataset;
        const {value, name}= e.target;

        if(value == "Select"){
            toast("Please select proper option")
        }else{
            this.returnMod(quantity, uprice, key, status, value, name, "status", itemname, item_id);
        }
        
    }

    onAfterSaveCell=(row, cellName, cellValue) =>{

        this.returnMod(row.quantity, row.unit_price, row.id, row.item_status, cellValue, "quantity", "quantity", row.item_name, row.item_id);
// toast(row.unit_price)
    }

    returnMod = (quantity, uprice, key, status, value, name, type, item_name, item_id) =>{

        const {modSelected} = this.state;
      
        
        var items = modSelected;

        var exist = "no";
        items.map((itemex) => {
      
        if (itemex.trItem_id == key) {
          exist = "yes";
          status = itemex.item_status;
          quantity = itemex.quantity;
        }
      })

      if(type == "status"){
        status = value
      }else if(type== "quantity"){
        quantity = value
      }
      

        if(exist == "no"){
        const newItm = {
            item_name:item_name, 
            item_status:status, 
            trItem_id:key,
            item_id:item_id,
            quantity:quantity,
            unit_price:uprice
        }

        items.push(newItm)

            if (this._isMounted) {
                this.setState({
                    modSelected: items,
                });
            }
        }else{
            var commentIndex = items.findIndex(function (c) {
                return c.trItem_id == key;
              });
      
              var updatedComment = update(items[commentIndex], { [name]: { $set: value } });
      
              var newData = update(items, {
                $splice: [[commentIndex, 1, updatedComment]]
              });

              if (this._isMounted) {
                this.setState({
                    modSelected: newData,
                });
            }
        }


    }

    buttonFormatterReturn = (cell, row) => {
        const dis = this.state.edit_qty;
        return (
    
          <div>
    
    
            <select class="form-control" name="return_type" 
            // data-itmname={row.item} 
            data-quantity={row.quantity} data-status={row.item_status} data-itemname={row.item_name} data-item_id={row.item_id} data-uprice={row.unit_price} data-key={row.id} data-trnid={row.ti_id} 
            onChange={this.handleReturnMod} disabled={this.state.modReturn == "no" ? true : false} name="item_status" defaultValue={row.item_status == "Returned GC" ? "Returned GC": row.item_status == "Defective" ? "Defective" : "Select"}>
              <option >Select</option>
              <option value="Defective">Defective</option>
              <option value="Returned GC">Good Condition</option>
            </select>
    
          </div>
        )
      }
     

      onBeforeSaveCell=(row, cellName, cellValue)=> {
        // console.log("whhhhfd")
                 if (Number(cellValue) || cellValue == 0) {

                    const {released} = this.state;
                    // console.log(released)
                    // console.log(row.item_id)
                    var check= "greater";
                    released.map((itemex) => {
                          
                            if (itemex.id == row.item_id) {
                              if(itemex.quantity < cellValue){
                                check = "lesser"
                               
                              }
                            }
                          })

                          if(check== "greater"){
                            return true;
                          }else{
                            toast("Must be lesser than released!")
                          return false;
                          }
                          
                 
                } else {
                  toast("Invalid amount!")
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
     saveMod = () =>{
        const subs = {
            return_code: this.props.location.state.code,
            mod_items: JSON.stringify(this.state.modSelected),
            type: this.state.org_type,
            mod_type: "Update"
        }
        // transaction/return
        // console.log("submit")
        // console.log(subs)

        if(confirm("Are you sure you want to modify this transaction?")){
            Http.post(`/api/v1/mod/transaction/return`, subs)
            .then((response) => {
                toast("Transaction successfully updated");
            })
            .catch(() => {
                toast("Error fetching")
            });
    }
      
    }
    getReps = (data) =>{
        // console.log("replacements")
        // console.log(data)

        if (this._isMounted) {
            this.setState({
                replacements: data,
            });
        }
    }
    getRel = (data) =>{
        // 
        // console.log("released")
        // console.log(data)

        if (this._isMounted) {
            this.setState({
                released: data,
            });
        }
    }

    render() {
        const { path, type, code, imported, loading } = this.props.location.state;
        const { tranItems, details, selected, modSelected } = this.state;
        const formatter = new Intl.NumberFormat('fil', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2
        })

        const selectRowProp = {
            mode: 'checkbox',
            // clickToSelect: true,
            onSelect: this.onRowSelect,
            onSelectAll: this.onSelectAll,
            columnWidth: '60px'
        };
        const cellEditPropMain = {
            // mode: 'click',
            mode: 'dbclick',
            blurToSave: true,
            beforeSaveCell: this.onBeforeSaveCell, // a hook for before saving cell
            afterSaveCell: this.onAfterSaveCell
            // blurToSave: false,
          };
        // console.log("selected")
        // console.log(JSON.stringify(selected))
        var totalReturned = 0;
        var totalDebited = 0;
        tranItems.map((itemex) => {
            var amount = parseFloat(itemex.quantity * itemex.unit_price);
            totalReturned += amount;

            if (itemex.debit == "yes") {
                totalDebited += amount
            }
        }
        )

       
// console.log(modSelected)
        
        return (
            <>
                <ToastContainer />

                <div class="contentTransactSales">
                    <Link to={{ pathname: path, state: { type: type, path: path, defCode: code } }}>
                        <Button icon labelPosition='left'><Icon name='angle left' /> Back to Tansaction view </Button>
                    </Link>
                   {this.state.org_type == "Sale"? <></>: <Button onClick={this.submitModDebit} style={{ float: "right" }} > Change Debit </Button>}
                   <Button onClick={this.setModRetRep} style={{ float: "right" }} > Modify Return and Replace </Button>
              
                {this.state.org_type == "Sale"? <></>:   <TransLog code={this.state.debit_code} id={this.props.location.state.id} />}
                    {/* <br />
                    <br /> */}
                    {this.state.modRetRep == "no" ? <></> : <UpdateItemReturn replacements={this.getReps} released={this.getRel} code={code} org_type={this.state.org_type}/>}
                    <h1> Returned Items </h1>
                  
                   {this.state.modRetRep == "no" ? <></> : <> <Button style={{float: "left"}} onClick={this.setModReturn}  primary={this.state.modReturn == "no" ? false : true}>Update Return</Button></>}
                   {modSelected.length > 0 ? <p style={{float: "left"}}><ModItems data={modSelected}  type="return"/>  </p> : <></>}<br/><br/>
                   {modSelected.length > 0 ? <Button style={{float: "right"}} onClick={this.saveMod} primary>Save Return Modification</Button>: <></>}

                    <>
                        <h2>{this.state.customer_name} ({this.state.org_type}-{this.state.accountability})</h2>
                        <div style={{float: "right", textAlign: "right"}}>
                          
                            <b>Total Returned value: </b> {formatter.format(totalReturned)}<br />
                            <b>Total Debited value: </b>  {formatter.format(totalDebited)} 
                        </div>
                    </>
                    <br/>
                    <br/>
                    { code} 
                    {/* { this.props.location.state.id} */}
                    <BootstrapTable
                        ref='table'
                        data={tranItems}
                        selectRow={this.state.org_type == "Sale" ? false : selectRowProp}
                        cellEdit={this.state.modReturn == "no" ? {} : cellEditPropMain}
                    // options={options} exportCSV
                    >
                        <TableHeaderColumn editable={false} dataField='item_status' hidden={this.state.org_type == "Sale" ? true : false} dataField='debit' width="130" >Debit</TableHeaderColumn>
                        <TableHeaderColumn editable={false} tdStyle={{ whiteSpace: 'normal' }} dataFormat={this.buttonFormatterReturn} thStyle={{ whiteSpace: 'normal' }} dataField='item_status' width="170" >Status</TableHeaderColumn>
                        <TableHeaderColumn editable={false} tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} dataField='item_name' >Item Name</TableHeaderColumn>
                        <TableHeaderColumn width="130" dataField='brand'>Brand</TableHeaderColumn>
                        <TableHeaderColumn width="100" dataField='quantity'>Quantity</TableHeaderColumn>
                        
                        <TableHeaderColumn editable={false} width="120" hidden={true} dataField='beg_balance'>Beg Item Bal</TableHeaderColumn>
                        {/* <TableHeaderColumn width="120" dataField='end_bal'>End Item Bal</TableHeaderColumn> */}
                        <TableHeaderColumn editable={false} width="100" dataField='unit_price'>SRP</TableHeaderColumn>
                        <TableHeaderColumn editable={false} width="100" hidden dataField='item_id'>item id</TableHeaderColumn>
                        <TableHeaderColumn editable={false} width="100" isKey={true} hidden dataField='ti_id'>id</TableHeaderColumn>
                        <TableHeaderColumn editable={false} width="100" dataFormat={this.totalitmFormatter} dataField='ti_id'>Total</TableHeaderColumn>
                        <TableHeaderColumn editable={false} width="100"  dataFormat={this.uplogicon} dataField='ti_id'>History</TableHeaderColumn>

                    </BootstrapTable>
                </div>
                <br/>
                <br/>

                <div class="modal fade " id="modsItm" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-lg" role="document">
                        <div class="modal-content">

                            <div class="modal-body">
                               Items trans here
                            
                            {this.transitms(this.state.transItmdata)}

                            </div>

                        </div>
                    </div>
                </div>

            </>
        );
    }
}
export default UpRet;