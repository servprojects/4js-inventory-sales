import React, { Component } from 'react';
import { Line } from 'react-chartjs-2';
import { connect } from 'react-redux';
import Http from '../../Http';

export default class SaleChart extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);

    // Initial state.
    this.state = {

      datavals: [],
      labels: [],
      datref: [],
      what: "HElllooo"
    };
    // API endpoint.
    this.api = '/api/v1/charts/sales';
  }
  componentDidMount() {
    this._isMounted = true
    Http.get(this.api)
      .then((response) => {
        // const { data } = response.data.transaction.data;
        if (this._isMounted) {

          this.setState({
            // labels: response.data.labels,
            // datavals: response.data.dataval,
            datref: response.data.datasets,
            what: "JAcky"
          });

          // console.log(data.dataval);

        }
      })

      .catch(() => {
        if (this._isMounted) {
          this.setState({
            error: 'Unable to fetch data.',
          });
        }
      });

    // console.log("hello");
    this.setState({

      what: "JAcky"
    });
  }






  render() {
    const { datref } = this.state;
    var display;

    var labs = [];
    var dats = [];
    var dev_fee = [];
    var disc = [];
    var raw = [];

    var dsets = this.props.data;

    $.each(dsets, function (index, item) {
      labs.push(item.month);
    });

    $.each(dsets, function (index, item) {
      dats.push(item.total);
    });

    $.each(dsets, function (index, item) {
      disc.push(item.discount);
    });

    $.each(dsets, function (index, item) {
      dev_fee.push(item.delivery);
    });

    $.each(dsets, function (index, item) {
      raw.push(item.raw_sales);
    });


    // console.log(dsets);
    // console.log(labs);
    // console.log(dats);
    // console.log("raw");
    // console.log(dsets);

    const salesdata = {
      // labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      labels: labs,
      datasets: [
        {
          label: "Accumulated",
          fill: false,
          lineTension: 0.1,
          backgroundColor: 'rgba(75,192,192,0.4)',
          borderColor: 'rgba(75,192,192,1)',
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: 'rgba(75,192,192,1)',
          pointBackgroundColor: '#fff',
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: 'rgba(75,192,192,1)',
          pointHoverBorderColor: 'rgba(220,220,220,1)',
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          // data: [65, 59, 80, 81, 56, 55, 40]
          data: dats
        },
        {
          label: "Discount",
          fill: false,
          lineTension: 0.1,
          backgroundColor: 'rgba(255,204,102,1)',//stop here
          borderColor: 'rgba(247,201,110,1)',
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: 'rgba(247,201,110,1)',
          pointBackgroundColor: '#fff',
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: 'rgba(247,201,110,1)',
          pointHoverBorderColor: 'rgba(224,194,133,1)',
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          // data: [65, 59, 80, 81, 56, 55, 40]
          data: disc
        },
        {
          label: "Delivery fee",
          fill: false,
          lineTension: 0.1,
          backgroundColor: 'rgba(0,153,153,1)',
          borderColor: 'rgba(31,122,122,1)',
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: 'rgba(31,122,122,1)',
          pointBackgroundColor: '#fff',
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: 'rgba(31,122,122,1)',
          pointHoverBorderColor: 'rgba(46,107,107,1)',
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          // data: [65, 59, 80, 81, 56, 55, 40]
          data: dev_fee
        },
        {
          label: "Raw sales",
          fill: false,
          lineTension: 0.1,
          backgroundColor: 'rgba(128,255,0,1)',
          borderColor: 'rgba(128,230,25,1)',
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: 'rgba(128,230,25,1)',
          pointBackgroundColor: '#fff',
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: 'rgba(128,230,25,1)',
          pointHoverBorderColor: 'rgba(128,204,51,1)',
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          // data: [65, 59, 80, 81, 56, 55, 40]
          data: raw
        }
      ]
    };


    const data = {
      // labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      labels: labs,
      datasets: [
        {
          label: this.props.type,
          fill: false,
          lineTension: 0.1,
          backgroundColor: 'rgba(75,192,192,0.4)',
          borderColor: 'rgba(75,192,192,1)',
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: 'rgba(75,192,192,1)',
          pointBackgroundColor: '#fff',
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: 'rgba(75,192,192,1)',
          pointHoverBorderColor: 'rgba(220,220,220,1)',
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          // data: [65, 59, 80, 81, 56, 55, 40]
          data: dats
        }

      ]
    };
    // console.log(data)

    this.props.type == "Sale" || this.props.type == "Sales" ? display = salesdata : display = data

    // console.log(labs);
    // console.log(personObject);
    return (
      <div>
        <h2>{this.props.type == "Sale" ? "Direct Sale" : this.props.type} chart</h2>
        <Line ref="chart" data={display} />

      </div>
    );
  }

  // componentDidMount() {
  //   const { datasets } = this.refs.chart.chartInstance.data
  //   console.log(datasets[0].data);


  // }
}