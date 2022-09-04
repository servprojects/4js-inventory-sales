import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../Http';
import TemplateReport from './templateReport';
import { Dropdown } from 'semantic-ui-react';//filt_branch
import 'semantic-ui-css/semantic.min.css';//filt_branch
import classNames from 'classnames';
import MinDate from './miniDateRange';

class GeneralReport extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);

    // Initial state.
    this.state = {
      branch_id: null,
      loading: false,
      error: null,
      sdate: null,
      edate: null,
      load: false,
      branch: "all",
      branch_name: "all",
      filter: null,
      upIdItem: null,
      data: [],
      dataTemp: [],
      databranchTemp: [],
      // data: JSON.parse(localStorage.getItem("genTrans") || "[]"),
      // dataTemp: JSON.parse(localStorage.getItem("genTrans") || "[]"),
      // databranchTemp: JSON.parse(localStorage.getItem("genTrans") || "[]"),
      tranItems: [],
      branches: [],//filt_branch
      role: null,
      sysmode: "normal",
    };
    // API endpoint.
    this.api = '/api/v1/reports/sales';
  }
  componentDidMount() {
    var from_date= null;
    var to_date= null;
    this.getData(from_date, to_date)
    this.getSystemMode()
  }

  getData = (from_date, to_date)=>{
    this._isMounted = true
    if (this._isMounted) { this.setState({ load: true, loading: true }); };

    var subs ;
    if(from_date && to_date){
      subs = {
        type: "General",
        from_date: from_date,
        to_date: to_date
  
      }
  console.log(subs)
    }else{
      subs = {
        type: "General" 
  
      }
    }




    Http.post(`/api/v1/reports/transacs`, subs)
      .then((response) => {
        // localStorage.setItem('genTrans', JSON.stringify(response.data.transaction))
        // var localTerminal = JSON.parse(localStorage.getItem("genTrans") || "[]");
        var localTerminal = response.data.transaction;
        // const { data } = response.data.transaction.data;
        if (this._isMounted) {

          this.setState({
            data: response.data.transaction,
            dataTemp: response.data.transaction,
            databranchTemp: response.data.transaction,
            // data: localTerminal,
            // dataTemp: localTerminal,
            // databranchTemp: localTerminal,
            branches: response.data.branches,
            load: false,
            loading: false,
            role: response.data.role
          });
        }
      })

      .catch(() => {
        if (this._isMounted) {
          this.setState({
            error: 'Unable to fetch data.',
            load: false,
            loading: false,
          });
        }
      });
  }
  handleChange = (e) => {
    this._isMounted = true
    const { data, dataTemp } = this.state;
    const { name, value } = e.target;
    if (this._isMounted) {
      this.setState({ [name]: value });

      var result = dataTemp;
      if (name == "trans") {
        if (value != "General") {
          result = dataTemp.filter(function (v) {
            return v.type == value;
          });
        }
        this.setState({ data: result, databranchTemp: result, filter: value });




      }
    }
  };
  myChangeHandlerbranch = (e, { value, key }) => {
    // if (this._isMounted) {
    //     this.setState({ branch_id: value });
    // }
    this._isMounted = true
    const { data, dataTemp, databranchTemp, branches } = this.state;

    var result = databranchTemp;
    if (value != "All Branch") {
      result = databranchTemp.filter(function (v) {
        return v.branch == value;
      });
    }

    var resultB = branches.filter(function (v) {
      return v.name == value;
    });
    // console.log("no")
    // console.log(resultB)
    this.setState({
      data: result,
      databranchTemp: databranchTemp,
      branch: value,
      branch_id: resultB[0].id,
      branch_name: resultB[0].name,
    });


  };

  getDates = (data) =>{
    this._isMounted = true
    
    if (this._isMounted) {
    this.setState({
      sdate: data.from_date,
      edate: data.to_date,
    });
  }
    this.getData(data.from_date, data.to_date);
  }

  getSystemMode() {
    Http.post(`/api/v1/sysmode`)
      .then(({ data }) => {
        console.log("data.spec")
        console.log(data.spec)

       
       
        if (this._isMounted) { this.setState({ sysmode: data.spec }); };
      })
      .catch(() => {
        this.setState({
          error: 'Unable to fetch data.',
          load: false,
        });
      });
  }
  



  render() {
    const { data, branches, load , sysmode} = this.state;
    const options = {
      exportCSVBtn: this.createCustomExportCSVButton
    };

    var dptemp = branches;
    var exist = "no";
    dptemp.map((itemex) => {
      if (itemex.id == "all") {
        exist = "yes";
      }
    })

    if (exist == "no") {
      const subs = {
        id: "all",
        name: "All Branch",
      }
      dptemp.push(subs);
    }
    const branch = dptemp.map((brnch) => ({ key: brnch.id, value: brnch.name, text: brnch.name }));

    return (
      <div>
        <div style={{paddingLeft: "5%", paddingTop: "2%"}}>
          <MinDate loading={this.state.loading} dates={this.getDates} />
        </div>
      {/* {this.state.sdate}
      {this.state.edate} */}

        {/* <div class="transfilt"> */}
        <div class="transfiltN">

          {/* <br />
          <br /> */}

{sysmode != "pos" ?
          <select placeholder="Transactions" class="form-control mb-2 mr-sm-2 " name="trans" onClick={this.handleChange}>
            <option value="General">General</option>
           <option value="Account Payment">Account Payment </option>
            <option value="Charge">Charge</option>
            <option value="Credit">Credit</option>
            <option value="Debit">Debit</option>
            <option value="Direct Sale">Direct Sale</option>
            <option value="Excess Payment">Excess Payment</option>
            <option value="Payment Charge">Payment Charge</option>
            <option value="Receiving">Receiving</option>
            <option value="Releasing">Releasing</option>
            <option value="Replacement">Replacement</option>
            <option value="Return">Return</option>
            <option value="Update">Update</option>
            <option value="Import">Import</option>
          </select>
:

          <select placeholder="Transactions" class="form-control mb-2 mr-sm-2 " name="trans" onClick={this.handleChange}>
            <option value="General">General</option>
            <option value="Direct Sale">Direct Sale</option>
            <option value="Excess Payment">Excess Payment</option>
            <option value="Receiving">Receiving</option>
            <option value="Replacement">Replacement</option>
            <option value="Return">Return</option>
            <option value="Update">Update</option>
            <option value="Import">Import</option>
          </select>
}


          {
            this.state.role == "Superadmin" ?
              <Dropdown
                type="select"
                placeholder='Select branch'
                fluid
                search
                selection
                // style={req_inpt}
                onChange={this.myChangeHandlerbranch}
                options={branch}
                id="addItem"
                name="brand_id"
                required
              />
              : <></>
          }

        </div>
        {/* {this.state.branch} */}
        {/* {this.state.branch_id} */}
        
        <TemplateReport
          title="General Transactions"
          data={data}
          filter={this.state.filter}
          gen="General"
          type="General"
          role={this.state.role}
          path={this.props.location?( this.props.location.state.path ? this.props.location.state.path : ' ' ): this.props.path}
          // path={this.props.location.state.path ? this.props.location.state.path : this.props.path}
          // path={this.props.location.state.path}
          branch_idS={this.state.branch_id}
          branch_name={this.state.branch_name}
          sdate={this.state.sdate}
          edate={this.state.edate}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: state.Auth.isAuthenticated,
  user: state.Auth.user,
});

export default connect(mapStateToProps)(GeneralReport);
