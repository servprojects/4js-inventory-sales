import React, { Component } from 'react';
import { connect } from 'react-redux';
import Brands from './brands';
import ItemCat from './item_category';
import ItemMain from './item_main';
import Units from './units';

import Http from '../../../Http';

class Items extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);

    // Initial state.
    this.state = {
      loading: false,
      brands: JSON.parse(localStorage.getItem("utlbrd") || "[]"),
      cats: JSON.parse(localStorage.getItem("utlct") || "[]"),
      units: JSON.parse(localStorage.getItem("utlunt") || "[]"),
    };

    // API endpoint.
    this.api = '/api/v1/getopts';
  }
  componentDidMount() {
    this._isMounted = true
    Http.post(`${this.api}`)
      .then((response) => {
        // const { data } = response.data;
        localStorage.setItem('utlbrd', JSON.stringify(response.data.brands))
        var localTerminalbrd = JSON.parse(localStorage.getItem("utlbrd") || "[]");

        localStorage.setItem('utlct', JSON.stringify(response.data.cats))
        var localTerminalct = JSON.parse(localStorage.getItem("utlct") || "[]");

        localStorage.setItem('utlunt', JSON.stringify(response.data.units))
        var localTerminalunt = JSON.parse(localStorage.getItem("utlunt") || "[]");

        if (this._isMounted) {
          this.setState({
            brands: localTerminalbrd,
            cats: localTerminalct,
            units: localTerminalunt,
            // error: false,
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

  getopts = () =>{
    this._isMounted = true
    Http.post(`${this.api}`)
      .then((response) => {
        // const { data } = response.data;
        localStorage.setItem('utlbrd', JSON.stringify(response.data.brands))
        var localTerminalbrd = JSON.parse(localStorage.getItem("utlbrd") || "[]");

        localStorage.setItem('utlct', JSON.stringify(response.data.cats))
        var localTerminalct = JSON.parse(localStorage.getItem("utlct") || "[]");

        localStorage.setItem('utlunt', JSON.stringify(response.data.units))
        var localTerminalunt = JSON.parse(localStorage.getItem("utlunt") || "[]");

        if (this._isMounted) {
          this.setState({
            brands: localTerminalbrd,
            cats: localTerminalct,
            units: localTerminalunt,
            // error: false,
          });
        }
     console.log("get")
     console.log(localTerminalct)
      })

      .catch(() => {
        if (this._isMounted) {
          this.setState({
            error: 'Unable to fetch data.',
          });
        }
      });
  }

  render() {
    const { brands, cats, units } = this.state;

    return (
      <div class="utilityContainer" >
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb-item active" aria-current="page">ITEMS</li>
          </ol>
        </nav>
        <br />
        <ul class="nav nav-tabs" role="tablist">
          <li class="nav-item" onClick={this.getopts} >
            <a class="nav-link active" data-toggle="tab" href="#item" onClick={this.getopts} >Item</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" data-toggle="tab" href="#itemcat">Item Category</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" data-toggle="tab" href="#brand">Brand</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" data-toggle="tab" href="#unit">Unit</a>
          </li>
        </ul>
        <div class="tab-content">

          <div id="item" class="container tab-pane active"><br />
            <ItemMain
              lol="lolfgy"

              brands={brands}
              cats={cats}
              units={units}
            />
          </div>

          <div id="itemcat" class="container tab-pane fade"><br />
            <ItemCat />
          </div>
          <div id="brand" class="container tab-pane fade"><br />
            <Brands />
          </div>
          <div id="unit" class="container tab-pane fade"><br />
            <Units />
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

export default connect(mapStateToProps)(Items);
