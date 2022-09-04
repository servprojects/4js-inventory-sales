import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../Http';
import 'react-toastify/dist/ReactToastify.css';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import TemplateReport from './templateReport';
import MinDate from './miniDateRange';
import { Dropdown } from 'semantic-ui-react';//filt_branch
import 'semantic-ui-css/semantic.min.css';//filt_branch
import classNames from 'classnames';
import { DateRangePicker } from 'react-date-range';
import { addDays } from 'date-fns';
import { contains } from 'jquery';
import { toast } from 'react-toastify';
class AllRep extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);

    // Initial state.
    this.state = {
      error: null,
      upIdItem: null,
      branch_id: null,
      loading: false,
      ttt: null,
      sdate: null,
      edate: null,
      // data: [],
      data: JSON.parse(localStorage.getItem("transaction") || "[]"),
      tranItems: [],
      datasets: [],
      datasetsTemp: [],
      // datasetsTemp: [],
      branches: [],//filt_branch
      // dataAll: [],//filt_branch
      dataAll: JSON.parse(localStorage.getItem("transaction") || "[]"),//filt_branch
      // dataTemp: [],//filt_branch
      dataTemp: JSON.parse(localStorage.getItem("transaction") || "[]"),//filt_branch
      hidbranch: true,//filt_branch
      role: false,//filt_branch

      load: false,
      from_date: null,
      to_date: null,
      datesel: [
        {
          startDate: new Date(),
          endDate: addDays(new Date(), 7),
          key: 'selection'
        }
      ],
    };
    // API endpoint.
    this.api = '/api/v1/reports/sales';
  }
  componentDidMount() {
    var from_date= null;
    var to_date= null;

    this.getAllData(from_date, to_date);
  }


  getAllData = (from_date, to_date) => {

    this._isMounted = true
    if (this._isMounted) { this.setState({ load: true, loading: true }); };
    // Http.get(`${this.api}`)
    // var ttype=this.props.location.state.type;
    var subs ;
    if(from_date && to_date){
      subs = {
        type: this.props.location.state.type,
        from_date: from_date,
        to_date: to_date
  
      }
  
    }else{
      subs = {
        type: this.props.location.state.type
  
      }
    }

    // console.log("yesssh")
    // console.log(subs)
    
    // Http.post(`/api/v1/reports/transacs`, { type: subs })
      Http.post(`/api/v1/reports/transacs`, subs)
      .then((response) => {
        // const { data } = response.data.transaction.data;

        localStorage.setItem('transaction', JSON.stringify(response.data.transaction))
        var localTerminal = JSON.parse(localStorage.getItem("transaction") || "[]");

        if (this._isMounted) {

          this.setState({
            // data: response.data.transaction,
            data: localTerminal,
            branches: response.data.branches,//filt_branch
            // dataAll: response.data.transaction,//filt_branch
            dataAll: localTerminal,//filt_branch
            // dataTemp: response.data.transaction,//filt_branch
            dataTemp: localTerminal,//filt_branch
            role: response.data.role,//filt_branch
            datasets: response.data.datasets,
            datasetsTemp: response.data.datasets,
            // datasetsTemp: response.data.datasets,
            load: false, loading: false
          });
          // console.log("localTerminaltrr")
          // console.log(response.data.transaction)
         
        }
      })

      .catch(() => {
        if (this._isMounted) {
          this.setState({
            error: 'Unable to fetch data.',
            load: false, loading: false
          });
        }
      });

    if (this._isMounted) {

      this.setState({
        ttt: this.props.location.state.type,


      });
    }
  }


  setUpId = (e) => {
    this._isMounted = true
    const { key } = e.target.dataset;
    if (this._isMounted) {
      this.setState({ upIdItem: key })
    }

    Http.post(`/api/v1/reports/saleItems`, { id: key })
      .then((response) => {
        // const { data } = response.data.transaction.data;
        if (this._isMounted) {

          this.setState({
            tranItems: response.data.items,

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



  };

  buttonFormatter = (cell, row) => {
    const { tranItems } = this.state;
    return (
      //  <button
      //  type="button"
      //  className="btn btn-primary"
      //  data-key={row.id}
      //  >
      //  Receive
      //  </button>
      <div>
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#exampleModal" data-key={row.t_id} onClick={this.setUpId}>
          Items
    </button>
        <div class="modal fade " id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
          <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">

              <div class="modal-body">
                <BootstrapTable
                  ref='table'
                  data={tranItems}
                  pagination={true}
                  search={true}
                // options={options} exportCSV
                >
                  <TableHeaderColumn tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} dataField='item_name' isKey={true}>Item Name</TableHeaderColumn>
                  <TableHeaderColumn dataField='quantity'>Quantity</TableHeaderColumn>
                  <TableHeaderColumn dataField='beg_balance'>Beginning Balance</TableHeaderColumn>
                  <TableHeaderColumn dataField='end_bal'>Ending Balance</TableHeaderColumn>
                  <TableHeaderColumn dataField='unit_price'>Price</TableHeaderColumn>
                </BootstrapTable>

              </div>

            </div>
          </div>
        </div>
      </div>
    )
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

    const {dataAll, branches} = this.state;

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

      var resultB = branches.filter(function (v) {
        return v.id == value;
      })  
      
      var result = dataAll.filter(function (v) {
        return v.branch == resultB[0].name;
      })

      if (this._isMounted) {
        this.setState({
          data: result,
        });
      }

      // Http.post(`/api/v1/reports/transacs`, { branch_id: value, type: this.props.location.state.type })
      //   .then((response) => {
      //     // const { data } = response.data.header;
      //     if (this._isMounted) {
      //       this.setState({
      //         data: response.data.transaction,
      //         dataTemp: response.data.transaction,
      //         datasets: response.data.datasets,
      //       });
      //     }
      //   })
      //   .catch(() => {
      //     this.setState({
      //       error: 'Unable to fetch data.',
      //     });
      //   });


    }

  }; // filt_branch


  lowerLetter = (string) => {
    return string.charAt(0).toLowerCase() + string.slice(1);
  }

  getDates = (data) =>{
    this._isMounted = true
    
    if (this._isMounted) {
    this.setState({
      sdate: data.from_date,
      edate: data.to_date,
    });
  }
    this.getAllData(data.from_date, data.to_date);
  }
  

  render() {
    const { load, data,
      branches, //filt_branch
    } = this.state;
    const options = {
      exportCSVBtn: this.createCustomExportCSVButton
    };
    //filt_branch
    var _hidbranch = this.state.hidbranch;
    var dptemp = branches;
    // console.log(dptemp)
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
    // console.log("sssss")
    // console.log(branch)

    var bid = this.state.branch_id;
    var result = branch.filter(function (v) {
      return v.key == bid;
    })
    var branch_name = this.state.role == "Superadmin" ? "All Branch" : " ";
    if (this.state.branch_id) {

      if (result[0].text) {
        branch_name = result[0].text;
      }
      // console.log(branch_name)
    }

    //filt_branch
var rangeStyle ={position: "relative", paddingTop: ".5%", paddingLeft: "4%" };
var rangeStyleA ={position: "absolute", paddingTop: ".5%", paddingLeft: "4%" };
    return (

      <div >
        <div>
          {/* <div className={classNames('ui  inverted dimmer loads', {
            'active': load,
          })} >
            <center>
              <div class="ui text loader">Loading</div>
            </center>
          </div> */}


          {/* <div style={{ paddingTop: ".5%", paddingLeft: "4%" }}> */}
            {/* <div class="branch_drop" style={hidFilt}>filt_branch */}
            <div class="branch_drop">{/* filt_branch */}
              {
                this.state.role == "Superadmin"?
                <>
                <div class="inline_block" style={{position: "relative", paddingTop: "4%", paddingLeft: "5%" }}>
                <i class="undo icon" onClick={this.resetFilter}></i>
              </div>
              <div class="inline_block" style={{position: "relative", paddingTop: "4%", paddingLeft: "5%" }}>
             
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
              </>
              : <>
</>              }
              <div class="inline_block" style={ this.state.role == "Superadmin"?rangeStyleA : rangeStyle }>
                < MinDate  loading={this.state.loading} dates={this.getDates} />
              </div>

              <br />
              <br />
            </div>{/* filt_branch */}
         
          {/* </div> */}

          {/* {this.state.ttt} */}

          {/* <DateRangePicker
                onChange={this.handleSelect}
                showSelectionPreview={true}
                moveRangeOnFirstSelection={false}
                months={1}
                ranges={this.state.datesel}
                direction="horizontal"
                data-key="Hello"
                className="cal"
              /> */}

          <TemplateReport
            title={this.props.location.state.type == "Receiving" ? this.props.location.state.type : this.props.location.state.type + "s"}
            type={this.props.location.state.type}
            role={this.state.role}
            hidbranch={_hidbranch}
            branch={this.state.branch_id}
            branches={branch}
            data={data}
            branchName={branch_name}
            datasets={this.state.datasets}
            // path={"/report/"+ this.lowerLetter(this.props.location.state.type)}
            path={this.props.location.state.path}
            sdate={this.state.sdate}
            edate={this.state.edate}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: state.Auth.isAuthenticated,
  user: state.Auth.user,
});

export default connect(mapStateToProps)(AllRep);
