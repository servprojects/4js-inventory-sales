import React, { Component } from 'react';
import { Line } from 'react-chartjs-2';
import { connect } from 'react-redux';
import Http from '../../Http';
import { Dropdown, Popup, Button } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import ReactTooltip from "react-tooltip";

export default class DlineSalesChart extends Component {
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






    render() {

        var labs = [];
        var dats = [];
        var dev_fee = [];
        var disc = [];
        var raw = [];

        var dsets = this.props.data;

        console.log("dsets dash")
        console.log(dsets)

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

        const data = {
            labels: labs,
            datasets: [
                {
                    label: 'Accumulated',
                    data: dats,
                    fill: false,
                    backgroundColor: 'rgb(235, 172, 54)',
                    borderColor: 'rgba(235, 172, 54, 0.2)',
                },
                {
                    label: 'Raw sales',
                    data: raw,
                    fill: false,
                    backgroundColor: 'rgb(235, 117, 54)',
                    borderColor: 'rgba(235, 117, 54, 0.2)',
                },
                {
                    label: 'Discounts',
                    data: disc,
                    fill: false,
                    backgroundColor: 'rgb(54, 229, 235)',
                    borderColor: 'rgba(54, 229, 235, 0.2)',
                },
                {
                    label: 'Deliveries',
                    data: dev_fee,
                    fill: false,
                    backgroundColor: 'rgb(54, 120, 235)',
                    borderColor: 'rgba(54, 120, 235, 0.2)',
                },
            ],
        }

        const options = {
            scales: {
                yAxes: [
                    {
                        ticks: {
                            beginAtZero: true,
                        },
                    },
                ],
            },
        }

        // console.log(data)


        // console.log(labs);
        // console.log(personObject);
        return (
            <div>

                <div class="inline_block">
                    <h2 style={{ fontFamily: "Palatino Linotype", color: "gray" }}>
                        <i class="chart line icon"></i>Sales Revenue

                </h2>
                </div>
                &nbsp; &nbsp; &nbsp; &nbsp;
                <div class="inline_block" >
                    <i data-tip data-for='chart' class="question circle outline icon"></i>
                </div>
               
                <ReactTooltip id='chart' place="right" effect="float" aria-haspopup='true' >
                    <span>The digits shown in the chart are combined <br/>data of Direct Sales and Charges </span>
                </ReactTooltip>
                <Line data={data} options={options} />

            </div>
        );
    }

    // componentDidMount() {
    //   const { datasets } = this.refs.chart.chartInstance.data
    //   console.log(datasets[0].data);


    // }
}