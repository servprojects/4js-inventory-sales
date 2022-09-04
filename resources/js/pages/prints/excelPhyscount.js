import React, { Component, useRef } from 'react';
import PrintHeader from './printHeader';
import ExHead from './excelHeader';
import { it } from 'date-fns/locale';

class PrintReportItem extends React.Component {


    dateRange = () => {
        var sd = 0, sye = 0, smo = 0, sda = 0
        // if (this.props.date) {

        //     sd = new Date(this.props.date);
        //     sye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(sd);
        //     smo = new Intl.DateTimeFormat('en', { month: 'short' }).format(sd);
        //     sda = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(sd);


        // }
        const formatter = new Intl.NumberFormat('fil', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2
          })
     

        return (
        <>

           
                {/* {smo + '. ' + sda + ', ' + sye} */}
            Date Started: {this.props.date}
             &nbsp;&nbsp;&nbsp;

            Stock Date As of: {this.props.sysdate} <br />
            {this.props.branch}<br/>
            Total mismatched colletibles:  {formatter.format(this.props.total_missed)} 
              
        </>);
    }
   
    
      diffTotal = (unit_price, sys_count, phys_count) => {
    
        var up = unit_price;
        var sc = sys_count;
        var pc = phys_count;
    
        var sc_col = up * sc;
        var pc_col = up * pc;
    
        var val = sc_col - pc_col;
    
    
        return (
          <>
            <span style={val != 0 ? { color: "red" } : {}}> {val} </span>
          </>
        )
    
      }
    
      sys_col = (unit_price, sys_count) => {
        var up = unit_price;
        var sc = sys_count;
    
    
        return (
          <>
            {up * sc}
          </>
        )
    
      }
    
      phys_col = (unit_price, phys_count) => {
        var up = unit_price;
        var ps = phys_count;
    
    
        return (
          <>
            {up * ps}
          </>
        )
    
      }

    content = (e, show, desc) => {


        return (
            <>
                <thead>
                    {
                        show ?
                            <>
                                <ExHead
                                    colspan="12"
                                    title={desc}
                                />
                            </>
                            :
                            <></>
                    }
                    <tr>
                        <td colspan="12">
                            <center><b>{this.dateRange()}</b></center>
                        </td>
                    </tr>
                    <tr>
                        <th>Code</th>
                        <th>Description</th>
                        <th>Brnd</th>
                        <th>Size</th>
                        <th>Unit</th>
                        <th>SRP</th>
                        <th>System Count</th>
                        <th>Sytem Collectible</th>
                        <th>Physical Count</th>
                        <th>Physical Collectible</th>
                        <th>Collectible Difference</th>
                        <th>Date Modified</th>



                    </tr>
                </thead>
                <tbody>
                    {e.map((itm, index, arr) => (
                        <tr>


                            <td>{itm.code}</td>
                            <td>{itm.name}</td>
                            <td>{itm.brand}</td>
                            <td>{itm.size}</td>
                            <td>{itm.unit}</td>
                            <td>{itm.unit_price}</td>
                            <td>{itm.sys_count}</td>
                            <td>{this.sys_col(itm.unit_price,itm.sys_count )}</td>
                            <td>{itm.phys_count}</td>
                            <td>{this.phys_col(itm.unit_price,itm.phys_count )}</td>
                            <td>{this.diffTotal(itm.unit_price, itm.sys_count, itm.phys_count)}</td>
                            <td>{itm.date_mod}</td>
                            


                        </tr>
                    ))}


                </tbody>
            </>
        )
    }





    render() {
        const allitems = this.props.items;
        var sub = 0;
        const formatter = new Intl.NumberFormat('fil', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 3
        })
        // var str = this.props.type;
        // const title = str.toUpperCase() + " " + "REQUEST";
        var data = [];
        this.props.data ? data = this.props.data : data = [];

        var datamis = [];
        var dmis = this.props.datamis;
        if (dmis.length > 0) {
            data = []
            datamis = this.props.datamis
        } else {
            datamis = [];
        }


        return (
            <div style={{ marginLeft: "2%", marginRight: "2%" }}>
                <table class="p_table">



                    <tr>
                        <td>
                            <div style={{ marginRight: "3%", zoom: "80%" }}>
                                <br />

                                <div class="table-responsive">

                                    <div style={{ display: "none" }}>
                                        <table id="physcount" class="table table-bordered">
                                            {this.content(data, "show", "Physical Count")}
                                        </table>

                                        <table id="mismatch" class="table table-bordered">
                                            {this.content(datamis, "show", "Mismatched Physical Count")}
                                        </table>


                                    </div>

                                </div>





                            </div>
                        </td>
                    </tr>
                </table>

            </div>
        );
    }
}
export default PrintReportItem;