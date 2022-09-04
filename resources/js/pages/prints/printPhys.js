import React, { Component, useRef } from 'react';
import PrintHeader from './printHeader';

class PrintPhys extends React.Component {
  render() {
    const allitems = this.props.allitems;
    var sub = 0;
    const formatter = new Intl.NumberFormat('fil', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 3
    })
    // var str = this.props.type;
    const title = "Physical Count";
    // var emp_name = this.props.first_name + " " + this.props.last_name
    return (
      <div>
        <table class="p_table">
          <PrintHeader
            title={title}
          // code={this.props.code}
          />

          <tr>
            <td>
              <div class="p_compDet">
                <br />
                <h3><b>DETAILS</b></h3>
                <b>Physical count date : {this.props.date}</b><br />
                <b>Branch: {this.props.branch}</b><br />

              </div>
            </td>
          </tr>
          <tr>
            <td>
              <br />
              <div style={{marginRight: "5%"}}>

                <table class="table table-bordered p_table" >
                  <thead>
                    <tr>
                      <th class="iconTable">Item Description</th>
                      <th class="iconTable">System Count</th>
                      <th class="iconTable">Physical Count</th>
                      <th class="iconTable">Date Mod.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allitems.map((item) => (
                      <tr>
                        <td class="iconTable">{item.name}</td>
                        <td class="iconTable">{item.sys_count}</td>
                        <td class="iconTable">{item.phys_count}</td>
                        <td class="iconTable">{item.date_mod}</td>

                      </tr>

                    ))}

                  </tbody>
                </table>
              </div>
            </td>
          </tr>

        </table>
      </div>
    );
  }
}
export default PrintPhys;