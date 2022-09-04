import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../Http';
import classNames from 'classnames';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import { Dropdown } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import ReactToPrint from "react-to-print";

class BranchRequest extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);

    // Initial state.
    this.state = {
      loading: false,
      urgency_status: null,
      estimated_receiving_date: null,
      type: null,
      error: false,
      upId: null,
      data: [],
    };

    // API endpoint.
    this.api = '/api/v1/approval/requests';
  }
  componentDidMount() {
    this._isMounted = true
    Http.get(`${this.api}`)
      .then((response) => {
        const { data } = response.data.requests;
        if (this._isMounted) {
          this.setState({
            data: response.data.branchreq,
            error: false,
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

    }
  };

  handleSubmit = (e) => {
    this._isMounted = true
    e.preventDefault();
    const subs = {
      urgency_status: this.state.urgency_status,
      estimated_receiving_date: this.state.estimated_receiving_date,
      type: this.state.type
    }
    if (this._isMounted) {
      this.setState({ loading: true });
    }
    this.addRequest(subs);
  };

  addRequest = (request) => {
    this._isMounted = true
    Http.post(this.api, request)
      .then(({ data }) => {
        const newItem = {
          id: data.id,
          code: data.code,
          urgency_status: request.urgency_status,
          estimated_receiving_date: request.estimated_receiving_date,
          type: request.type,
          request_status: data.status,
        };
        const allRequest = [newItem, ...this.state.data];
        if (this._isMounted) {
          this.setState({ data: allRequest, urgency_status: null, estimated_receiving_date: null, type: null });
        }
        this.addForm.reset();
        if (this._isMounted) {
          this.setState({ loading: false });
        }
        toast("Request Added successfully!")
      })
      .catch(() => {
        if (this._isMounted) {

          toast("Error adding request!")
          this.setState({ loading: false });
        }
      });
  };

  buttonFormatter(cell, row) {
    return '<BootstrapButton type="submit"></BootstrapButton>';
  }
  handleExportCSVButtonClick = (onClick) => {
    // Custom your onClick event here,
    // it's not necessary to implement this function if you have no any process before onClick
    console.log('This is my custom function for ExportCSVButton click event');
    onClick();
  }
  createCustomExportCSVButton = (onClick) => {
    return (
      <ExportCSVButton
        btnText='Down CSV'
        onClick={() => this.handleExportCSVButtonClick(onClick)} />
    );
  }
  buttonFormatter = (cell, row) => {
    return (
      <div>
        {/* <button
    type="button"
    className="btn btn-primary"
    data-key={row.id}
    >
    View
    </button> */}

        <div class="inline_block"> <Link to={{ pathname: row.route, state: { reqId: row.id } }}><i class="eye icon regIcon" data-key={row.id}></i> </Link> </div>
        {/* <div class="disb">
          <PrintRequest
            code={row.code}
            type={row.type}
            request_status={row.request_status}
            id={row.id}
            estimated_receiving_date={row.estimated_receiving_date}
            branch_req_to={row.branch_req_to}
            branch={row.branch}
            last_name={row.last_name}
            first_name={row.first_name}
            position={row.position}
            request_status={row.request_status}
            created_at={row.created_at}
            items={result}
            ref={el => (reff = el)}


          />
        </div> */}
      </div>

    )
    // return '<Link to=\'{{ pathname: /approvalitems, state:{reqId: '+row.id+'} }}\'> <button type="button" class=\'btn btn-secondary \' > View  </button></Link>';
    // return '<Link to=\'{{ pathname: /approvalitems, state:{reqId: '+row.id+'} }}\'> <button type="button" class=\'btn btn-secondary \' > View  </button></Link>';
  }

  render() {
    const { data, error, loading } = this.state;
    const pill_form = { textAlign: "center", paddingLeft: "30%", };
    const up_form = { paddingLeft: "28%", width: "100%", };
    const up_input = { width: "100%", };
    const req_tab = { width: "100%", };
    const req_list = { width: "80%", float: "right" };
    const req_inpt = { width: "100%", };
    const addBtn = { float: "right", };
    const label = { float: "left", };

    const products = [{
      id: 1,
      name: "Product1",
      price: 120
    }, {
      id: 2,
      name: "Product2",
      price: 80
    }];

    const options = {
      exportCSVBtn: this.createCustomExportCSVButton
    };
    return (
      <div className="content">

        <nav aria-label="breadcrumb">
          <ol class="breadcrumb">
            <li class="breadcrumb-item active" aria-current="page">Branch Requests</li>
          </ol>
        </nav>
        <ToastContainer />
        {/* {this.state.urgency_status}
      {this.state.estimated_receiving_date}
      {this.state.type} */}
        {/* <center> <h3>Requests </h3> </center> */}
        <BootstrapTable
          ref='table'
          data={data}
          pagination={true}
          search={true}
          options={options} exportCSV
        >
          <TableHeaderColumn dataField='code' isKey={true}>Code</TableHeaderColumn>
          <TableHeaderColumn dataField='branch'>Branch</TableHeaderColumn>
          <TableHeaderColumn dataField='id' hidden={true}>id</TableHeaderColumn>
          <TableHeaderColumn dataField='route' hidden={true}>route</TableHeaderColumn>
          <TableHeaderColumn dataField='type'>Type</TableHeaderColumn>
          <TableHeaderColumn dataField='request_status'>Status</TableHeaderColumn>
          <TableHeaderColumn dataField="id" dataFormat={this.buttonFormatter}></TableHeaderColumn>
        </BootstrapTable>


      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: state.Auth.isAuthenticated,
  user: state.Auth.user,
});
export default connect(mapStateToProps)(BranchRequest);
