import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../Http';
import update from 'immutability-helper';

class SpecPayroll extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);

    this.state = {
      total_N_O_I: 0,
      deductions: null,
      incentives: null,
      ca: null,
      payranges: [],
      new: "what"
    };

  }
  handleChange = (e) => {
    this._isMounted = true
    const { name, value } = e.target;
    if (this._isMounted) {
      this.setState({ [name]: value });
    }
  };

  getPayranges = (e) => {
    this._isMounted = true
    // const { name, value } = e.target;
    if (this._isMounted) {
      this.setState({ payranges: e });
    }
    console.log("eeee")
    console.log(e)
  };


  render() {
    // const payrange = this.state.payranges;
    var payrange = this.props.payrange;


    const sd = new Date(this.props.sdate);
    const sye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(sd);
    const smo = new Intl.DateTimeFormat('en', { month: 'short' }).format(sd);
    const sda = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(sd);

    const ed = new Date(this.props.edate);
    const eye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(ed);
    const emo = new Intl.DateTimeFormat('en', { month: 'short' }).format(ed);
    const eda = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(ed);

    var total_norm_hrs = 0;
    var total_ot_hrs = 0;

    var normal_rate = 45.6;
    var ot_rate = 55.6;
    var incentives = 100;

    payrange.map((pr) => {

      total_norm_hrs += pr.normal
      total_ot_hrs += pr.ot
    })

    var subtotal_norm = total_norm_hrs * normal_rate;
    var subtotal_ot = total_ot_hrs * ot_rate;

    var total_n_o_i = (this.state.incentives ? parseFloat(this.state.incentives) : 0) + subtotal_norm + subtotal_ot;

    var cash_ad = 100;
    var deduction = 100;

    var net = total_n_o_i - (this.state.ca ? parseFloat(this.state.ca) : 0) - (this.state.deductions ? parseFloat(this.state.deductions) : 0);

    const upVal = (e) => {
      const { date } = e.target.dataset;
      const { name, value } = e.target;
      console.log(payrange)
      console.log(date)
      console.log(value)

      var commentIndex = payrange.findIndex(function (c) {
        return c.date === date;
      });

      var updatedComment = update(payrange[commentIndex], { [name]: { $set: parseFloat(value) } });

      var newData = update(payrange, {
        $splice: [[commentIndex, 1, updatedComment]]
      });
      payrange = newData;
      // return ("weeee");
      // console.log("tell")
      // console.log(newData)
    }
    console.log("hello")
    console.log(payrange)

    var thisss = this.upVal;
    // console.log(this.state.payranges)
    return (
      <div>

        <center><h5>{this.props.sdate ? <> {smo + '. ' + sda + ', ' + sye}-{emo + '. ' + eda + ', ' + eye}</> : <></>}</h5></center>
        <hr />
        <table class="table table-bordered ">
          <thead>
            <tr>
              <th></th>
              {payrange.map((pr) => (
                <th>{pr.day}</th>
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

                <td><input onChange={upVal} data-date={pr.date} data-payrange={payrange} defaultValue={pr.normal} name="normal" class="form-control" type="text" /></td>

              ))}


              <td>{total_norm_hrs}</td>
              <td>{normal_rate}</td>
              <td>{subtotal_norm}</td>
              <td rowSpan="3" class="align-middle" >{total_n_o_i}</td>

            </tr>
            <tr>
              <td>O.T</td>
              {payrange.map((pr) => (
                <td><input onChange={this.handleChange} defaultValue={pr.ot} name="incentives" class="form-control" type="text" /></td>
              ))}


              <td>{total_ot_hrs}</td>
              <td>{ot_rate}</td>
              <td>{subtotal_ot}</td>

            </tr>
            <tr>
              <td>Incentives</td>
              <td colspan={payrange.length + 2}></td>
              <td><input onChange={this.handleChange} name="incentives" class="form-control  inptTable" type="text" /></td>

            </tr>
            <tr>
              <td>C.A</td>
              <td colspan={payrange.length + 3}></td>
              <td><input onChange={this.handleChange} name="ca" class="form-control  inptTable" type="text" size="30" /></td>
            </tr>
            <tr>
              <td>Deduction</td>
              <td colspan={payrange.length + 3}></td>
              <td><input onChange={this.handleChange} name="deductions" class="form-control  inptTable" type="text" size="30" /></td>
            </tr>
            <tr>
              <td>Net</td>
              <td colspan={payrange.length + 3}></td>
              <td>{net}</td>
            </tr>



          </tbody>
        </table>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: state.Auth.isAuthenticated,
  user: state.Auth.user,
});

export default connect(mapStateToProps)(SpecPayroll);
