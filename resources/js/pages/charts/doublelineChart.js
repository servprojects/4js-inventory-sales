import React, { Component } from 'react';
import { Line } from 'react-chartjs-2';
import { connect } from 'react-redux';
import Http from '../../Http';

export default class DlineChart extends Component {
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

    console.log("hello");
    this.setState({

      what: "JAcky"
    });
  }






  render() {
    const { datref } = this.state;
    var labs = [];
    var dats = [];
    var dats1 = [];

    var dsets = this.props.data;

    $.each(dsets, function (index, item) {
      labs.push(item.month);
    });

    $.each(dsets, function (index, item) {
      dats.push(item.remitted);
    });

    $.each(dsets, function (index, item) {
      dats1.push(item.sys_amt);
    });


    console.log(dsets);
    console.log(labs);
    console.log(dats);

    const data = {
      labels: labs,
      datasets: [
        {
          label: 'Remitted',
          data: dats,
          fill: false,
          backgroundColor: 'rgb(255, 99, 132)',
          borderColor: 'rgba(255, 99, 132, 0.2)',
          yAxisID: 'y-axis-1',
        },
        {
          label: 'System amount',
          data: dats1,
          fill: false,
          backgroundColor: 'rgb(54, 162, 235)',
          borderColor: 'rgba(54, 162, 235, 0.2)',
          yAxisID: 'y-axis-2',
        },
      ],
    }

    const options = {
      scales: {
        yAxes: [
          {
            type: 'linear',
            display: true,
            position: 'left',
            id: 'y-axis-1',
          },
          {
            type: 'linear',
            display: true,
            position: 'right',
            id: 'y-axis-2',
            gridLines: {
              drawOnArea: false,
            },
          },
        ],
      },
    }

    console.log(data)


    // console.log(labs);
    // console.log(personObject);
    return (
      <div>
        <h2>{this.props.type} chart</h2>
        <Line data={data} options={options} />

      </div>
    );
  }

  // componentDidMount() {
  //   const { datasets } = this.refs.chart.chartInstance.data
  //   console.log(datasets[0].data);


  // }
}