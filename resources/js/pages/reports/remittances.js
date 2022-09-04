import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../Http';
import 'react-toastify/dist/ReactToastify.css';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import TemplateReport from './templateReport';
import { Dropdown } from 'semantic-ui-react';//filt_branch
import 'semantic-ui-css/semantic.min.css';//filt_branch
import MinDate from './miniDateRange';

class Remittances extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);

    // Initial state.
    this.state = {
      error: null,
      upIdItem: null,
      branch_id: null,
      sdate: null,
      edate: null,
      ttt: null,
      // data: [],
      data: JSON.parse(localStorage.getItem("remittances") || "[]"),
      tranItems: [],
      datasets: [],
      datasetsTemp: [],
      // datasetsTemp: [],
      branches: [],//filt_branch
      // dataAll: [],//filt_branch
      dataAll: JSON.parse(localStorage.getItem("remittances") || "[]"),//filt_branch
      // dataTemp: [],//filt_branch
      dataTemp: JSON.parse(localStorage.getItem("remittances") || "[]"),//filt_branch
      hidbranch: true,//filt_branch
      role: false,//filt_branch
    };
    // API endpoint.
    this.api = '/api/v1/reports/sales';
  }
  componentDidMount() {
    var from_date= null;
    var to_date= null;

   this.getData(from_date, to_date);
  }

  getData = (from_date, to_date) =>{
    this._isMounted = true
    var subs ;
    if(from_date && to_date){
      subs = {
        type: this.props.location.state.type,
        from_date: from_date,
        to_date: to_date
  
      }
  
    }
    Http.post(`/api/v1/reports/remittance`, subs)
      // Http.post(`/api/v1/reports/transacs`, subs)
      .then((response) => {
        // const { data } = response.data.transaction.data;
        if (this._isMounted) {

          localStorage.setItem('remittances', JSON.stringify(response.data.transaction))
          var localTerminal = JSON.parse(localStorage.getItem("remittances") || "[]");

          this.setState({
            // data: response.data.transaction,
            data: localTerminal,
            branches: response.data.branches,//filt_branch
            // dataAll: response.data.transaction,//filt_branch
            // dataTemp: response.data.transaction,//filt_branch
            dataAll: localTerminal,//filt_branch
            dataTemp: localTerminal,//filt_branch
            role: response.data.role,//filt_branch
            datasets: response.data.datasets,
            datasetsTemp: response.data.datasets,
            datasetsTemp: response.data.datasets,
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
        ttt: this.props.location.state.type,


      });
    }
  }
 
  
  handleExportCSVButtonClick = (onClick) => {
    onClick();
  }
  createCustomExportCSVButton = (onClick) => {
    return (
      <ExportCSVButton
        btnText='Down CSV'
        onClick={() => this.handleExportCSVButtonClick(onClick)} />
    );
  }
  // filt_branch
  resetFilter = (e) => {
    const { dataAll } = this.state;

    if (this._isMounted) {
      this.setState({ data: dataAll, hidbranch: false })
    }

  };
  myChangeHandlerbranch = (e, { value }) => {
    if (this._isMounted) {
      this.setState({ branch_id: value, hidbranch: true });
    }

    // console.log("vaaaaaal")
    // console.log(value)
    if (value == 0) {
      if (this._isMounted) {
        this.setState({
          data: this.state.dataAll,
          dataTemp: this.state.dataAll,
          datasets: this.state.datasetsTemp,
          hidbranch: false
        });
      }
    } else {


      Http.post(`/api/v1/reports/transacs`, { branch_id: value, type: this.props.location.state.type })
        .then((response) => {
          // const { data } = response.data.header;
          if (this._isMounted) {
            this.setState({
              data: response.data.transaction,
              dataTemp: response.data.transaction,
              datasets: response.data.datasets,
            });
          }
        })
        .catch(() => {
          this.setState({
            error: 'Unable to fetch data.',
          });
        });
    }

  }; // filt_branch


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


  render() {
    const { data,
      branches, //filt_branch
    } = this.state;
    const options = {
      exportCSVBtn: this.createCustomExportCSVButton
    };
    //filt_branch
    var _hidbranch = this.state.hidbranch;
    var dptemp = branches;
    console.log(dptemp)
    var exist = "no";
    dptemp.map((itemex) => {
      if (itemex.id == 0) {
        exist = "yes";
      }
    })

    if (exist == "no") {
      const subs = {
        id: 0,
        name: "All Branch",
      }
      dptemp.push(subs);
    }
    const branch = dptemp.map((brnch) => ({ key: brnch.id, value: brnch.id, text: brnch.name }));

    var hidFilt = { display: "none" }
    if (this.state.role == "Superadmin") {
      hidFilt = { display: "block" }
    }
    console.log("sssss")
    console.log(branch)
    var bid = this.state.branch_id;
    var result = branch.filter(function (v) {
      return v.key == bid;
    })
    var branch_name = "All Branch"
    if (this.state.branch_id) {

      if (result[0].text) {
        branch_name = result[0].text;
      }
      // console.log(branch_name)
    }

    //filt_branch

    return (

      <div >
        <div style={{ paddingTop: ".5%", paddingLeft: "4%" }}>
          <div class="branch_drop" style={hidFilt}>{/* filt_branch */}
            <div class="inline_block">
              <i class="undo icon" onClick={this.resetFilter}></i>
            </div>
            <div class="inline_block"  style={{position: "relative", paddingTop: "4%", paddingLeft: "5%" }} >
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
              
            </div>
            <div class="inline_block" style={{position: "absolute", paddingTop: ".5%", paddingLeft: "4%" }}>
            <MinDate  dates={this.getDates} />
            </div>
            <br />
            <br />
          </div>{/* filt_branch */}
        </div>

        {/* {this.state.ttt} */}
        <TemplateReport
          title="Remittances"
          type="Remittances"
          role={this.state.role}
          branch={this.state.branch_id}
          branches={branch}
          data={data}
          branchName={branch_name}
          datasets={this.state.datasets}
          path={this.props.location.state.path}
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

export default connect(mapStateToProps)(Remittances);
