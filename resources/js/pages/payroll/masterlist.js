import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../Http';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import classNames from 'classnames';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Dropdown } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import { DateRangePicker } from 'react-date-range';
import { addDays } from 'date-fns';
import update from 'immutability-helper';
import { Link } from 'react-router-dom';
import PrintPayroll from '../prints/printPayroll';
import ImportEmp from '../payroll/importEmp';
import ReactToPrint, { PrintContextConsumer } from "react-to-print";
// import SpecPayroll from './specPayroll';

class MasterList extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);

    // Initial state.
    this.state = {
      loading: false,
      dept_id: null,
      emp_id: null,
      first_name: null,
      middle_name: null,
      last_name: null,
      position_id: null,
      position_no: null,
      contac_no: null,
      start_work: null,
      rate_per_day: null,
      birthday: null,
      address: null,
      in_case_emerg: null,
      rel_to_emp: null,
      position_id: null,
      rate_per_hour: null,
      rate_per_hour_ot: null,
      sdate: null,
      edate: null,
      total_N_O_I: 0,
      deductions: null,
      incentives: null,
      upId: null,
      ca: null,
      datesel: [
        {
          startDate: new Date(),
          endDate: addDays(new Date(), 7),
          key: 'selection'
        }
      ],
      data: [],
      position: [],
      depts: [],
      payrange: [],
      prinfo: [],
      payrangeTemp: [],
      temppr: [],
      selectedEmp: [],
      printPayroll: []
    };

    // API endpoint.
    this.api = '/api/v1/payroll/employee';
  }
  componentDidMount() {
    this._isMounted = true
    Http.get(`${this.api}`)
      .then((response) => {
        if (this._isMounted) {
          this.setState({
            data: response.data.employee,
            position: response.data.position,
            depts: response.data.department,

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

  handleChange = (e) => {
    this._isMounted = true
    const { name, value } = e.target;
    if (this._isMounted) {
      this.setState({ [name]: value });



      if (name === "incentives" || name === "deductions" || name === "ca") {
        this.setState({ [name]: value == " " || value == null ? 0 : value });
      }

      if (name === "rate_per_day") {
        this.setState({ rate_per_hour: value / 8 });
      }
    }

  };

  reset = (e) => {
    this._isMounted = true

    if (this._isMounted) {
      this.setState({
        dept_id: null,
        emp_id: null,
        first_name: null,
        middle_name: null,
        last_name: null,
        position_id: null,
        position_no: null,
        contac_no: null,
        start_work: null,
        rate_per_day: null,
        birthday: null,
        address: null,
        in_case_emerg: null,
        rel_to_emp: null,


      });

    }
  };

  resetpayroll = (e) => {
    this._isMounted = true

    if (this._isMounted) {
      this.setState({


        total_N_O_I: 0,
        deductions: null,
        incentives: null,
        ca: null,
        payrange: [],
        prinfo: []
      });
      this.payrollForm.reset();

      var pr = this.state.payrange;

      pr.map(function (x) {
        x.normal = 0;
        return x
      });

      if (this._isMounted) {
        this.setState({ payrange: pr, })
      }
    }
  };

  handleSubmit = (e) => {
    this._isMounted = true
    e.preventDefault();
    const subs = {
      dept_id: this.state.dept_id,
      emp_id: this.state.emp_id,
      first_name: this.state.first_name,
      middle_name: this.state.middle_name,
      last_name: this.state.last_name,
      position_id: this.state.position_id,
      position_no: this.state.position_no,
      contac_no: this.state.contac_no,
      start_work: this.state.start_work,
      rate_per_day: this.state.rate_per_day,
      rate_per_hour: this.state.rate_per_hour,
      rate_per_hour_ot: this.state.rate_per_hour_ot,
      birthday: this.state.birthday,
      address: this.state.address,
      in_case_emerg: this.state.in_case_emerg,
      rel_to_emp: this.state.rel_to_emp,
    }
    if (this._isMounted) {
      this.setState({ loading: true });
    }
    this.addemp(subs);
  };

  addemp = (subs) => {
    this._isMounted = true
    Http.post(this.api, subs)
      .then(({ data }) => {
        const { position, depts } = this.state;

        var resultdept = depts.filter(function (v) {
          return v.id == subs.dept_id;
        })

        var resultpos = position.filter(function (v) {
          return v.id == subs.position_id;
        })


        const newItem = {
          id: data.id,
          dept_id: subs.dept_id,
          position: resultpos[0].name,
          department: resultdept[0].name,
          emp_id: subs.emp_id,
          name: subs.first_name + ' ' + subs.last_name,
          first_name: subs.first_name,
          middle_name: subs.middle_name,
          last_name: subs.last_name,
          position_id: subs.position_id,
          position_no: subs.position_no,
          contac_no: subs.contac_no,
          start_work: subs.start_work,
          rate_per_day: subs.rate_per_day,
          rate_per_hour: subs.rate_per_hour,
          rate_per_hour_ot: subs.rate_per_hour_ot,
          birthday: subs.birthday,
          address: subs.address,
          in_case_emerg: subs.in_case_emerg,
          rel_to_emp: subs.rel_to_emp,
        };
        const emp = [newItem, ...this.state.data];
        if (this._isMounted) {
          this.setState({ data: emp });
        }
        this.reset();
        this.addForm.reset();
        if (this._isMounted) {
          this.setState({ loading: false });
        }
        toast("Employee Added successfully!")
      })
      .catch(() => {
        if (this._isMounted) {
          this.setState({
            // error: 'Sorry, there was an error saving your to do.',
            loading: false
          });
          toast("Error adding employee!")
        }
      });
  };


  handlePayroll = (e) => {
    this._isMounted = true
    const { rph, rpho } = e.target.dataset;
    e.preventDefault();
    // console.log(this.state.payrange)
    const subs = {
      payranges: JSON.stringify(this.state.payrange),
      cash_ad: this.state.ca == " " || this.state.ca == null ? 0 : this.state.ca,
      deduction: this.state.deductions == " " || this.state.deductions == null ? 0 : this.state.deductions,
      incentive: this.state.incentives == " " || this.state.incentives == null ? 0 : this.state.incentives,
      rate_per_hour: rph,
      rate_per_hour_ot: rpho,
      emp_id: this.state.upId,
      beg_date: this.state.sdate,
      end_date: this.state.edate,
    }
    if (this._isMounted) {
      this.setState({ loading: true });
    }
    // console.log(subs)
    this.addPayroll(subs);
  };

  addPayroll = (subs) => {
    this._isMounted = true
    Http.post(`/api/v1/payroll/payrange`, subs)
      .then(({ data }) => {
        if (this._isMounted) {
          this.setState({ loading: false });
        }
        toast("Payroll saved!")
      })
      .catch(() => {
        if (this._isMounted) {
          this.setState({
            // error: 'Sorry, there was an error saving your to do.',
            loading: false
          });
          toast("Error saving payroll!")
        }
      });
  };



  myChangeHandlerPosition = (e, { value }) => {
    if (this._isMounted) {
      this.setState({ position_id: value })
    }
  };
  myChangeHandlerDept = (e, { value }) => {
    if (this._isMounted) {
      this.setState({ dept_id: value })
    }
  };
  handleSubmitUpdate = (e) => {
    this._isMounted = true
    e.preventDefault();
    const subs = {
      dept_id: this.state.dept_id,
      emp_id: this.state.emp_id,
      first_name: this.state.first_name,
      middle_name: this.state.middle_name,
      last_name: this.state.last_name,
      position_id: this.state.position_id,
      position_no: this.state.position_no,
      contac_no: this.state.contac_no,
      start_work: this.state.start_work,
      rate_per_day: this.state.rate_per_day,
      birthday: this.state.birthday,
      address: this.state.address,
      in_case_emerg: this.state.in_case_emerg,
      rel_to_emp: this.state.rel_to_emp,
      rate_per_hour: this.state.rate_per_hour,
      rate_per_hour_ot: this.state.rate_per_hour_ot,
    }
    if (this._isMounted) {
      this.setState({ loading: true });
    }
    this.updateProperty(subs);
  };

  updateProperty = (property) => {
    Http.patch(`${this.api}/${this.state.upId}`, property)
      .then(({ data }) => {

        if (this._isMounted) {
          this.setState({
            data: data.updated,
            error: false,
          });
          this.setState({ loading: false });
        }
        toast("Supplier Updated successfully!")
        this.updateForm.reset();
      })
      .catch(() => {
        if (this._isMounted) {
          this.setState({
            loading: false
          });
        }
        toast("Error updating Supplier!")
      });
  };
  setUpId = (e) => {
    this._isMounted = true
    const { key } = e.target.dataset;
    if (this._isMounted) {
      this.setState({ upId: key })
    }
  };
  openPayroll = (e) => {
    this._isMounted = true
    const { key } = e.target.dataset;
    if (this._isMounted) {
      this.setState({ upId: key })
    }
    const subs = {

      emp_id: key,
      beg_date: this.state.sdate,
      end_date: this.state.edate,
    }

    Http.post(`/api/v1/payroll/getpayroll`, subs)
      .then((response) => {
        if (this._isMounted) {


          if (response.data.stat === 150) {
            this.setState({
              payrange: response.data.payroll,
              prinfo: response.data.prinfo,
              incentives: response.data.prinfo[0].incentive,
              deductions: response.data.prinfo[0].deduction,
              ca: response.data.prinfo[0].cash_ad,
            });

            console.log(response.data.prinfo)
          }
          else {
            this.setState({ payrange: this.state.payrangeTemp });
          }

        }


      })
      .catch(() => {
        if (this._isMounted) {
          this.setState({
            // error: 'Sorry, there was an error saving your to do.',
            loading: false
          });
          // console.log("temp")
          // console.log(this.state.payrangeTemp)
          this.setState({ payrange: this.state.payrangeTemp });
          // toast("Error getting payroll!")
        }
      });

  };

  getPrintPayrolls = (e) => {
    this._isMounted = true

    const subs = {

      emps: JSON.stringify(this.state.selectedEmp),
      beg_date: this.state.sdate,
      end_date: this.state.edate,
    }

    Http.post(`/api/v1/payroll/printpayroll`, subs)
      .then((response) => {
        if (this._isMounted) {
          this.setState({ printPayroll: response.data.payroll });
        }
        this.prntPayrolls.handlePrint();//PRINT
      })
      .catch(() => {
        if (this._isMounted) {
          this.setState({
            loading: false
          });
        }
      });

  };

  deleteEmp = (e) => {
    this._isMounted = true
    const { key } = e.target.dataset;
    const { data: sup } = this.state;
    if (this._isMounted) {
      this.setState({ loading: true });
    }
    if (confirm("Are you sure you want to delete employee?")) {
      Http.delete(`${this.api}/${key}`)
        .then((response) => {
          if (response.status === 204) {
            const index = sup.findIndex(
              (supplier) => parseInt(supplier.id, 10) === parseInt(key, 10),
            );
            const update = [...sup.slice(0, index), ...sup.slice(index + 1)];
            if (this._isMounted) {
              this.setState({ data: update });
              this.setState({ loading: false });
            }
          }
          toast("Employee deleted successfully!")
        })
        .catch((error) => {
          console.log(error);
          toast("Error deleting Supplier!")
        });
      if (this._isMounted) {
        this.setState({ loading: false });
      }
    }

  };
  upVal = (e) => {
    const { date } = e.target.dataset;
    const { name, value } = e.target;
    var payrange = this.state.payrange;
    // console.log(payrange)
    // console.log(date)
    // console.log(value)
    var nval;
    console.log("nval")

    value ? nval = value : nval = 0
    console.log(nval)
    // value == " " || value == null ? nval = 0 : nval = value
    var commentIndex = payrange.findIndex(function (c) {
      return c.date === date;
    });

    var updatedComment = update(payrange[commentIndex], { [name]: { $set: parseFloat(nval) } });

    var newData = update(payrange, {
      $splice: [[commentIndex, 1, updatedComment]]
    });
    if (this._isMounted) {
      this.setState({ payrange: newData })
    }
    console.log(newData)

  }

  upNormal = (e) => {

    var pr = this.state.payrange;



    pr.map(function (x) {
      x.normal = 8;
      return x
    });




    if (this._isMounted) {
      this.setState({ payrange: pr, })
    }
  }
  sendPrintPayrolls = () => {
    const { printPayroll } = this.state;

    return (
      <>
        {printPayroll.map((pr) => (
          this.SpecPayroll('', '', '', '', "printall", pr.prId)
        ))}
      </>
    );

  }

  SpecPayroll = (fn, ln, rph, rpho, print, prId) => {
    var { payrange, prinfo, incentives, ca, deductions } = this.state;
    var result;

    if (print == "printall") {
      
      const { printPayroll } = this.state;
      console.log("printPayroll")
      console.log(printPayroll)
      result = printPayroll.filter(function (v) {
        return v.prId == prId;
      })
     
      payrange = result[0].ranges;
      incentives = result[0].info[0].incentive;
      ca = result[0].info[0].cash_ad;
      deductions = result[0].info[0].deduction;
      rph= result[0].info[0].rate_per_hour;
      rpho = result[0].info[0].rate_per_hour_ot;
      fn= result[0].info[0].first_name;
      ln= result[0].info[0].last_name;
    } 

    // const payrange = this.state.payranges;
    // var  = this.state.payrange;


    const sd = new Date(this.state.sdate);
    const sye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(sd);
    const smo = new Intl.DateTimeFormat('en', { month: 'short' }).format(sd);
    const sda = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(sd);

    const ed = new Date(this.state.edate);
    const eye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(ed);
    const emo = new Intl.DateTimeFormat('en', { month: 'short' }).format(ed);
    const eda = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(ed);

    var total_norm_hrs = 0;
    var total_ot_hrs = 0;

    var normal_rate = rph;
    var ot_rate = rpho;

    payrange.map((pr) => {
      total_norm_hrs += pr.normal
      total_ot_hrs += pr.ot
    })

    var subtotal_norm = total_norm_hrs * normal_rate;
    var subtotal_ot = total_ot_hrs * ot_rate;

    var total_n_o_i = (incentives ? parseFloat(incentives) : 0) + subtotal_norm + subtotal_ot;
    var net = total_n_o_i - (ca ? parseFloat(ca) : 0) - (deductions ? parseFloat(deductions) : 0);


    net = Number(net).toFixed(2);
    subtotal_norm = Number(subtotal_norm).toFixed(2);
    subtotal_ot = Number(subtotal_ot).toFixed(2);
    total_n_o_i = Number(total_n_o_i).toFixed(2);

    // console.log(payrange)

    var d;


    // console.log("looog")
    // console.log(payrange)

    const formatter = new Intl.NumberFormat('fil', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    })
    const pwidth = { width: "400px", fontSize: "15px", paddingLeft: "5%" }


    return (

      <div style={print ? pwidth : {}}>
        {/* {id} */}
        {/* {this.state.upId} */}
        <hr />
        {
          print == null ?
            <center><h5>{this.state.sdate ? <>{smo + '. ' + sda + ', ' + sye}-{emo + '. ' + eda + ', ' + eye}</> : <></>}</h5></center>
            :
            <>
              <div class="inline_block"> <span style={{ textTransform: "capitalize" }}>{fn}</span>, <span style={{ textTransform: "capitalize" }}>{ln}</span> </div>
              <div class="inline_block" style={{ float: "right" }}><h5>{this.state.sdate ? <>{smo + '. ' + sda + ', ' + sye}-{emo + '. ' + eda + ', ' + eye}</> : <></>}</h5></div>
            </>
        }

        <hr />
        <form
          ref={(el) => {
            this.payrollForm = el;
          }}
        >
          <table class="table table-bordered" >
            <thead>
              <tr>
                <th></th>
                {payrange.map((pr) => (<>

                  <th>
                    <center>
                      {new Intl.DateTimeFormat('en', { month: 'short' }).format(new Date(pr.date))}- {new Intl.DateTimeFormat('en', { day: '2-digit' }).format(new Date(pr.date))}
                      <hr />
                      {new Intl.DateTimeFormat('en', { weekday: 'short' }).format(new Date(pr.date))}
                    </center>
                  </th>
                </>
                ))}
                <th>Total<br />Hours</th>
                <th>Rate</th>
                <th>Subtotal</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Normal</td>
                {payrange.map((pr) => (

                  <td>
                    {print == null ?
                      <input onChange={this.upVal} data-date={pr.date} value={pr.normal == 0 ? " " : pr.normal} name="normal" class="form-control" type="number" step=".001" />
                      : <> {pr.normal == 0 ? " " : pr.normal} </>}
                  </td>
                ))}


                <td>{total_norm_hrs}</td>
                <td>{normal_rate}</td>
                <td>{subtotal_norm}</td>
                <td rowSpan="3" class="align-middle" >{formatter.format(total_n_o_i)}</td>

              </tr>
              <tr>
                <td>O.T</td>
                {payrange.map((pr) => (
                  <td>
                    {print == null ?
                      <input onChange={this.upVal} data-date={pr.date} value={pr.ot == 0 ? " " : pr.ot} name="ot" class="form-control" type="number" step=".001" />
                      : <> {pr.ot == 0 ? " " : pr.ot} </>}
                  </td>
                ))}


                <td>{total_ot_hrs}</td>
                <td>{ot_rate}</td>
                <td>{subtotal_ot}</td>

              </tr>
              <tr>
                <td>Incentives</td>
                <td colspan={payrange.length + 2}></td>

                <td>
                  {print == null ?
                    <input onChange={this.handleChange} name="incentives" value={incentives == " " || incentives == null ? 0 : incentives} class="form-control  inptTable" type="number" step=".001" />
                    : <> {incentives == " " || incentives == null ? 0 : incentives} </>}
                </td>

              </tr>
              <tr>
                <td>C.A</td>
                <td colspan={payrange.length + 3}></td>
                <td>
                  {print == null ?
                    <input onChange={this.handleChange} name="ca" value={ca == " " || ca == null ? 0 : ca} class="form-control  inptTable" type="number" step=".001" />
                    : <> {ca == " " || ca == null ? 0 : ca} </>}
                </td>
              </tr>
              <tr>
                <td>Deduction</td>
                <td colspan={payrange.length + 3}></td>
                <td>
                  {print == null ?
                    <input onChange={this.handleChange} name="deductions" value={deductions == " " || deductions == null ? 0 : deductions} class="form-control  inptTable" type="number" step=".001" />
                    : <> {deductions == " " || deductions == null ? 0 : deductions} </>}
                </td>
              </tr>
              <tr>
                <td>Net</td>
                <td colspan={payrange.length + 3}></td>
                <td>{formatter.format(net)}</td>
              </tr>



            </tbody>
          </table>
        </form>
      </div>

    );
  }


  buttonFormatter = (cell, row) => {
    var reff = "print" + row.id;
    const { loading, position, depts } = this.state;
    const pstn = position.map((pst) => ({ key: pst.id, value: pst.id, text: pst.name }));
    const dept = depts.map((pst) => ({ key: pst.id, value: pst.id, text: pst.name }));
    return (
      <div>
        <button type="button" data-key={row.id} onClick={this.setUpId}
          class=" btn btn-secondary" data-backdrop="static" data-keyboard="false" data-toggle="modal" data-target={`#sup${row.id}`}>
          <i data-key={row.id} onClick={this.setUpId} class='fas icons'>&#xf304;</i>
        </button>

    &nbsp;
        <button
          type="button"
          className="btn btn-danger"
          onClick={this.deleteEmp}
          data-key={row.id}
        >
          <i class='fas icons' onClick={this.deleteEmp}
            data-key={row.id}>&#xf1f8;</i>
        </button>
    &nbsp;
        {
          this.state.sdate ?
            <button
              type="button"
              className="btn btn-primary"
              data-backdrop="static" data-keyboard="false" data-toggle="modal" data-target={`#emppayroll${row.id}`}
              data-key={row.id}
              onClick={this.openPayroll}
            >
              Payroll
        </button>
            : <></>
        }
        <div class="modal fade" id={`emppayroll${row.id}`} tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div class="modal-dialog modal-xxl" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h3 class="modal-title" id="exampleModalLabel"><span style={{ textTransform: "capitalize" }}>{row.first_name}</span>, <span style={{ textTransform: "capitalize" }}>{row.last_name}</span></h3>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close" onClick={this.resetpayroll}>
                  <span aria-hidden="true" >&times;</span>
                </button>
              </div>
              <div style={{ padding: "3%" }}>

                <div class="inline_block">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={this.upNormal}

                  >
                    Set normal to 8
        </button>
                </div>
                <div class="inline_block" style={{ float: "right" }}>


                  <ReactToPrint

                    trigger={() =>
                      <button
                        type="button"
                        className="btn btn-secondary"
                      // onClick={this.upNormal}

                      >
                        <i class="print icon"></i> Print
              </button>
                    }
                    content={() => reff}
                  />
                  <div style={{ display: "none" }} >

                    <PrintPayroll
                      itms={this.SpecPayroll(row.first_name, row.last_name, row.rate_per_hour, row.rate_per_hour_ot, "print")}
                      specpayroll="yes"
                      ref={el => (reff = el)}

                    />
                  </div>
                </div>

                {/* <SpecPayroll
                  sdate={this.state.sdate}
                  edate={this.state.edate}
                  payrange={this.state.payrange}
                /> */}
                {this.SpecPayroll(row.first_name, row.last_name, row.rate_per_hour, row.rate_per_hour_ot)}
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal" onClick={this.resetpayroll}>Close</button>
                <button type="button" class="btn btn-primary" data-rph={row.rate_per_hour} data-rpho={row.rate_per_hour_ot} onClick={this.handlePayroll}>Save</button>

              </div>

            </div>
          </div>
        </div>

        <div class="modal" id={`sup${row.id}`}    >
          <div class="modal-dialog">
            <div class="modal-content">


              <div class="modal-header">
                <h4 class="modal-title">Update Employee</h4>
                <button type="button" class="close" data-dismiss="modal" onClick={this.reset}>&times;</button>
              </div>


              <div class="modal-body">
                <form
                  method="post"
                  onSubmit={this.handleSubmitUpdate}
                  ref={(el) => {
                    this.updateForm = el;
                  }}
                >
                  <div class="modal-body">

                    Department
                  <Dropdown
                      type="select"
                      placeholder='Select position'
                      fluid
                      search
                      selection
                      // style={inpt_style}
                      onChange={this.myChangeHandlerDept}
                      options={dept}
                      id="addemp"
                      name="position_id"
                      required
                    />
                            I.D. No.
                            <input onChange={this.handleChange} name="emp_id" defaultValue={row.emp_id} class="form-control mb-2 mr-sm-2" />
                            First Name
                            <input onChange={this.handleChange} name="first_name" defaultValue={row.first_name} class="form-control mb-2 mr-sm-2" />
                            Middle Name
                            <input onChange={this.handleChange} name="middle_name" defaultValue={row.middle_name} class="form-control mb-2 mr-sm-2" />
                            Last Name
                            <input onChange={this.handleChange} name="last_name" defaultValue={row.last_name} class="form-control mb-2 mr-sm-2" />
                            Position
                            <Dropdown
                      type="select"
                      placeholder='Select position'
                      fluid
                      search
                      selection
                      // style={inpt_style}
                      onChange={this.myChangeHandlerPosition}
                      options={pstn}
                      id="addemp"
                      name="position_id"
                      required
                    />
                            Position no.
                            <input onChange={this.handleChange} name="position_no" defaultValue={row.position_no} class="form-control mb-2 mr-sm-2" />
                            Contact no.
                            <input onChange={this.handleChange} name="contac_no" defaultValue={row.contac_no} class="form-control mb-2 mr-sm-2" />
                             Start of Work
                            <input onChange={this.handleChange} name="start_work" defaultValue={row.start_work} class="form-control mb-2 mr-sm-2" />
                            Rate per Day {this.state.rate_per_day}
                    <input onChange={this.handleChange} name="rate_per_day" defaultValue={row.rate_per_day} type="number" step=".01" class="form-control mb-2 mr-sm-2" />
                            Rate per hour{this.state.rate_per_hour}
                    <input onChange={this.handleChange} name="rate_per_hour" defaultValue={this.state.rate_per_hour ? this.state.rate_per_hour : row.rate_per_hour} type="number" step=".0001" class="form-control mb-2 mr-sm-2" />
                            Rate per Hour OT
                            <input onChange={this.handleChange} name="rate_per_hour_ot" type="number" defaultValue={row.rate_per_hour_ot} step=".0001" class="form-control mb-2 mr-sm-2" />
                            Birthday
                            <input onChange={this.handleChange} name="birthday" defaultValue={row.birthday} type="date" class="form-control mb-2 mr-sm-2" />
                             Address
                            <input onChange={this.handleChange} name="address" defaultValue={row.address} class="form-control mb-2 mr-sm-2" />
                             In case of emergency
                            <input onChange={this.handleChange} name="in_case_emerg" defaultValue={row.in_case_emerg} class="form-control mb-2 mr-sm-2" />
                            Relation to employee
                            <input onChange={this.handleChange} name="rel_to_emp" defaultValue={row.rel_to_emp} class="form-control mb-2 mr-sm-2" />

                  </div>

                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal" onClick={this.reset}>Close</button>
                    <button type="submit" className={classNames('btn btn-primary', {
                      'btn-loading': loading,
                    })} >Update</button>
                  </div>
                </form>


              </div>


              {/* <div class="modal-footer">
                <button type="button" class="btn btn-danger" data-dismiss="modal" onClick={this.reset}>Close</button>
              </div> */}

            </div>
          </div>
        </div>





        {/* payroll */}


      </div>
    )
  }
  handleSelect = (item) => {
    // console.log(date); // native Date object
    this._isMounted = true
    if (this._isMounted) {
      this.setState({
        datesel: [item.selection]
      })
    }
    var sd = item.selection.startDate;
    var day = String(sd.getDate());
    if (day.length == 1) {
      day = "0" + day;
    }
    var month = String(sd.getMonth() + 1);
    var year = String(sd.getFullYear());
    var sdate = year + "-" + month + "-" + day;

    var ed = item.selection.endDate;
    var day = String(ed.getDate());
    if (day.length == 1) {
      day = "0" + day;
    }
    var month = String(ed.getMonth() + 1);
    var year = String(ed.getFullYear());
    var edate = year + "-" + month + "-" + day;




    // console.log(sdate)
    // console.log(edate)

    var dd;
    var dday;
    var ddayLit;
    var dmonth;
    var dyear;
    var dedate;
    var payrange = [];
    var subs;


    for (var d = new Date(sdate); d <= new Date(edate); d.setDate(d.getDate() + 1)) {
      dd = d;
      dday = String(dd.getDate());
      if (dday.length == 1) {
        dday = "0" + dday;
      }
      dmonth = String(dd.getMonth() + 1);
      dyear = String(dd.getFullYear());


      ddayLit = dd.toLocaleString("default", { weekday: "short" });
      dedate = dyear + "-" + dmonth + "-" + dday;

      subs = {
        date: dedate,
        day: ddayLit,
        normal: 0,
        ot: 0,
      }


      payrange.push(subs);

    }


    // console.log("handle")
    // console.log(payrange)

    if (this._isMounted) {
      this.setState({
        sdate: sdate,
        edate: edate,
        payrange: payrange,
        payrangeTemp: payrange,
      })
    }
  }

  onRowSelect = (row, isSelected, e) => {
    const { selectedEmp, selectedEmp: se } = this.state;


    var dptemp = selectedEmp;
    if (this._isMounted) {
      if (isSelected) {
        const subs = {
          id: row.id,
        }
        dptemp.push(subs);
        this.setState({
          selectedEmp: dptemp,
        });

      } else {
        const index = se.findIndex(
          (sc) => parseInt(sc.id, 10) === parseInt(row.id, 10),
        );
        const dptemp = [...se.slice(0, index), ...se.slice(index + 1)];

        this.setState({
          selectedEmp: dptemp,
        });

      }
    }
    // console.log("sel")
    // console.log(dptemp)

  }

  onSelectAll = (isSelected, rows) => {



    const { selectedEmp, selectedEmp: se } = this.state;
    var dptemp = selectedEmp;
    var subs;
    if (this._isMounted) {
      if (isSelected) {
        dptemp = [];
        for (let i = 0; i < rows.length; i++) {
          // alert(rows[i].id);
          subs = {
            id: rows[i].id,
          }
          dptemp.push(subs);
        }
        this.setState({
          selectedEmp: dptemp,
        });

      } else {
        dptemp = [];
        this.setState({
          selectedEmp: dptemp,
        });
      }
    }

  }

  render() {

    const { data, loading, position, depts, selectedEmp, printPayroll } = this.state;
    const options = {
      afterSearch: this.afterSearch, // define a after search hook
      insertModalHeader: this.createCustomModalHeader
    };
    const pstn = position.map((pst) => ({ key: pst.id, value: pst.id, text: pst.name }));
    const dept = depts.map((pst) => ({ key: pst.id, value: pst.id, text: pst.name }));
    const selectRowProp = {
      mode: 'checkbox',
      clickToSelect: true,
      onSelect: this.onRowSelect,
      onSelectAll: this.onSelectAll,
      columnWidth: '60px'
    };
    console.log(JSON.stringify(selectedEmp))
    console.log(printPayroll)
    return (
      <div style={{ margin: "1%" }}>
        <ToastContainer />

        {/* <div className="pill_section_head">
        PAYROLL
    </div>
    <br/> */}
        {/* {this.state.emp_id} */}
        <div class="inline_block">
          <button type="button" class="btn btn-primary" data-backdrop="static" data-keyboard="false" data-toggle="modal" data-target="#exampleModal">
            Add Employee
                </button>
        </div>
      &nbsp;&nbsp;&nbsp;&nbsp;
      <div class="inline_block">
          <ImportEmp />
        </div>
      &nbsp;&nbsp;&nbsp;&nbsp;
        <div class="inline_block">
          <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#datemodal">
            Payroll date
        </button>
        </div>
      &nbsp;&nbsp;&nbsp;&nbsp;
        {
          this.state.sdate ?
            <>
              <div class="inline_block">
                <Link to={{ pathname: `/payroll/summary`, state: { sdate: this.state.sdate, edate: this.state.edate } }}>
                  <button type="button" class="btn btn-primary" data-toggle="modal" >
                    Payroll Summary
                </button>
                </Link>
              </div>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <div class="inline_block">

                <button type="button" class="btn btn-primary" data-toggle="modal" onClick={this.getPrintPayrolls}>
                  Print selected payroll
                </button>
                <ReactToPrint

                  // trigger={() =>  }
                  ref={ref => this.prntPayrolls = ref}
                  content={() => this.ppall}
                />
                <div style={{ display: "none" }}>
                  <PrintPayroll
                    itms={this.sendPrintPayrolls()}
                    specpayroll="yes"
                    ref={el => (this.ppall = el)}

                  />
                </div>
              </div>
            </>
            : <></>
        }
        <br />
        <br />
        {/* set payroll date modal */}
        <div class="modal fade" id="datemodal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Set payroll date range</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close" onClick={this.reset}>
                  <span aria-hidden="true" >&times;</span>
                </button>
              </div>

              <DateRangePicker
                onChange={this.handleSelect}
                showSelectionPreview={true}
                moveRangeOnFirstSelection={false}
                months={2}
                ranges={this.state.datesel}
                direction="horizontal"
                data-key="Hello"
                className="cal"
              />


              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>

              </div>

            </div>
          </div>
        </div>



        {/* add new employee modal */}
        <div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div class="modal-dialog" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Add new employee</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close" onClick={this.reset}>
                  <span aria-hidden="true" onClick={this.reset}>&times;</span>
                </button>
              </div>
              <form
                method="post"
                onSubmit={this.handleSubmit}
                ref={(el) => {
                  this.addForm = el;
                }}
              >
                <div class="modal-body">

                  Department
                            <Dropdown
                    type="select"
                    placeholder='Select position'
                    fluid
                    search
                    selection
                    // style={inpt_style}
                    onChange={this.myChangeHandlerDept}
                    options={dept}
                    id="addemp"
                    name="position_id"
                    required
                  />
                            I.D. No.
                            <input onChange={this.handleChange} name="emp_id" class="form-control mb-2 mr-sm-2" />
                            First Name
                            <input onChange={this.handleChange} name="first_name" class="form-control mb-2 mr-sm-2" />
                            Middle Name
                            <input onChange={this.handleChange} name="middle_name" class="form-control mb-2 mr-sm-2" />
                            Last Name
                            <input onChange={this.handleChange} name="last_name" class="form-control mb-2 mr-sm-2" />
                            Position
                            <Dropdown
                    type="select"
                    placeholder='Select position'
                    fluid
                    search
                    selection
                    // style={inpt_style}
                    onChange={this.myChangeHandlerPosition}
                    options={pstn}
                    id="addemp"
                    name="position_id"
                    required
                  />
                            Position no.
                            <input onChange={this.handleChange} name="position_no" class="form-control mb-2 mr-sm-2" />
                            Contact no.
                            <input onChange={this.handleChange} name="contac_no" class="form-control mb-2 mr-sm-2" />
                             Start of Work
                            <input onChange={this.handleChange} name="start_work" class="form-control mb-2 mr-sm-2" />
                            Rate per Day
                            <input onChange={this.handleChange} name="rate_per_day" type="number" step=".01" class="form-control mb-2 mr-sm-2" />
                            Rate per hour
                            <input onChange={this.handleChange} name="rate_per_hour" defaultValue={this.state.rate_per_hour} type="number" step=".0001" class="form-control mb-2 mr-sm-2" />
                            Rate per Hour OT
                            <input onChange={this.handleChange} name="rate_per_hour_ot" type="number" step=".0001" class="form-control mb-2 mr-sm-2" />
                            Birthday
                            <input onChange={this.handleChange} name="birthday" type="date" class="form-control mb-2 mr-sm-2" />
                             Address
                            <input onChange={this.handleChange} name="address" class="form-control mb-2 mr-sm-2" />
                             In case of emergency
                            <input onChange={this.handleChange} name="in_case_emerg" class="form-control mb-2 mr-sm-2" />
                            Relation to employee
                            <input onChange={this.handleChange} name="rel_to_emp" class="form-control mb-2 mr-sm-2" />

                </div>

                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-dismiss="modal" onClick={this.reset}>Close</button>
                  <button type="submit" className={classNames('btn btn-primary', {
                    'btn-loading': loading,
                  })} >Add</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <BootstrapTable data={data} options={options} search={true} pagination={true} selectRow={this.state.sdate ? selectRowProp : {}}>
          <TableHeaderColumn dataField='id' isKey={true} customInsertEditor={{ getElement: this.empid }} hidden={true} isKey></TableHeaderColumn>
          <TableHeaderColumn width="150" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} dataField='department' customInsertEditor={{ getElement: this.departmentField }} >Department</TableHeaderColumn>
          <TableHeaderColumn width="100" dataField='emp_id'>I.D. No.</TableHeaderColumn>
          <TableHeaderColumn width="300" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} dataField='name'>Name</TableHeaderColumn>
          <TableHeaderColumn width="100" dataField='position' tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }}>Position</TableHeaderColumn>
          <TableHeaderColumn hidden={true} dataField='position_no'>Position #</TableHeaderColumn>
          <TableHeaderColumn width="100" dataField='contac_no'>Contact #</TableHeaderColumn>
          <TableHeaderColumn tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} hidden={true} dataField='start_work'>Satart of Work</TableHeaderColumn>
          <TableHeaderColumn tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} width="100" dataField='rate_per_day'>Rate per Day</TableHeaderColumn>
          <TableHeaderColumn hidden={true} dataField='rate_per_hour'>Rate per Day</TableHeaderColumn>
          <TableHeaderColumn hidden={true} dataField='rate_per_hour_ot'>Rate per Day</TableHeaderColumn>
          <TableHeaderColumn hidden={true} dataField='birthday'>Birthdate</TableHeaderColumn>
          <TableHeaderColumn hidden={true} dataField='address'>Address</TableHeaderColumn>
          <TableHeaderColumn hidden={true} dataField='in_case_emerg'>In case of emergency</TableHeaderColumn>
          <TableHeaderColumn hidden={true} dataField='rel_to_emp'>Relationship to employee</TableHeaderColumn>
          <TableHeaderColumn dataField="id" width="200" dataFormat={this.buttonFormatter}>Action</TableHeaderColumn>
        </BootstrapTable>
      </div >
    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: state.Auth.isAuthenticated,
  user: state.Auth.user,
});

export default connect(mapStateToProps)(MasterList);
