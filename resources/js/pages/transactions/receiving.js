import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../Http';
import classNames from 'classnames';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Transfer from './transfer';
import Purchase from './purchase';
import NoReq from './receiveNoReq';

class Receiving extends Component {
      _isMounted = false;
  constructor(props) {
    super(props);

    // Initial state.
    this.state = {
      loading: false,
      brand: null, 
      name: null,
      error: false,
      upId: null,
      data: [],
    };

    // API endpoint.
    this.api = '/api/v1/brand';
  }
  componentDidMount() {
      this._isMounted = true
    Http.get(`${this.api}`)
      .then((response) => {
        const { data } = response.data;
      if(this._isMounted){
        this.setState({
          data,
          error: false,
        });
         }
      })
      
      .catch(() => {
 if(this._isMounted){
        this.setState({
          error: 'Unable to fetch data.',
        });
      }  
      });
  }

  handleChange = (e) => {
    const { name, value } = e.target;
 if(this._isMounted){
    this.setState({ [name]: value });
    }
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { brand } = this.state;
 if(this._isMounted){
    this.setState({ loading: true });
    }
    this.addBrand(brand);
  };

  addBrand = (brand) => {
    this._isMounted = true
    Http.post(this.api, { name: brand })
      .then(({ data }) => {
        const newItem = {
          id: data.id,
          name: brand,
        };
        const allBrands = [newItem, ...this.state.data];
 if(this._isMounted){
        this.setState({ data: allBrands, brand: null });
        }
        this.brandForm.reset();
 if(this._isMounted){
        this.setState({ loading: false });
        }
           toast("Brand added successfully!")
      })
      .catch(() => {
        if(this._isMounted){
       toast("Error adding brand!")
        }
      });
  };
  deleteBrand = (e) => {
    this._isMounted = true
    const { key } = e.target.dataset;
    const { data: brd } = this.state;
if(this._isMounted){
    this.setState({ loading: true });
    }
    Http.delete(`${this.api}/${key}`)
      .then((response) => {
        if (response.status === 204) {
          const index = brd.findIndex(
            (brand) => parseInt(brand.id, 10) === parseInt(key, 10),
          );
          const update = [...brd.slice(0, index), ...brd.slice(index + 1)];
if(this._isMounted){
          this.setState({ data: update });
          this.setState({ loading: false });
          }
        }
        toast("Brand deleted successfully!")
      })
      .catch((error) => {
        console.log(error);
        toast("Error deleting brand!")
      });
  };


  
setUpId = (e) => {
    this._isMounted = true
    const { key } = e.target.dataset;
    if(this._isMounted){
      this.setState({upId: key})
    }
};

handleSubmitUpdate = (e) => {
  this._isMounted = true
  e.preventDefault();
  const subs = {
    name: this.state.name
  }
if(this._isMounted){
  this.setState({ loading: true });
  }
  this.updateProperty(subs);
};

updateProperty = (property) => {
  Http.patch(`${this.api}/${this.state.upId}`, property)//last stop here no API YET
    .then(({ data }) => {

    if(this._isMounted){
      this.setState({
        data: data.updated.data,
        error: false,
      });
      this.setState({ loading: false });
       }
       toast("Brand Updated successfully!")
       this.updateForm.reset();
    })
    .catch(() => {
    if(this._isMounted){
      this.setState({
        loading: false
      });
      }
      toast("Error updating brand!")
    });
};

reset = (e) => {
  this._isMounted = true
    if(this._isMounted){
      this.setState({name: null});
      }
  
};

  render() {
    const { data, error, loading } = this.state;
    const pill_form = {
        textAlign: "center",
        paddingLeft: "30%",
      };
      const up_form = {
        paddingLeft: "28%",
        width: "100%",
          };
        const up_input = {
        width: "100%",
          };
    return (
<div>
<ToastContainer />
<br/>
<div class="dropdown">
  <button type="button" class="btn btn-secondary dropdown-toggle" data-toggle="dropdown">
    Receive From
  </button>
  <div class="dropdown-menu"   >
    {/* <a class="dropdown-item"  id="v-pills-purchase-tab" data-toggle="pill" href="#v-pills-purchase"  aria-controls="v-pills-purchase" >Purchase</a>
    <a class="dropdown-item"  id="v-pills-transfer-tab" data-toggle="pill" href="#v-pills-transfer"  aria-controls="v-pills-transfer" >Transfer</a>
    <a class="dropdown-item" id="v-pills-return-tab" data-toggle="pill" href="#v-pills-return"  aria-controls="v-pills-return" >Customer Return</a> */}
    <div class="nav flex-column nav-pills" id="v-pills-tab" role="tablist" aria-orientation="vertical">
                <a class="nav-link" id="v-pills-noreq-tab" data-toggle="pill" href="#v-pills-noreq" role="tab" aria-controls="v-pills-noreq" aria-selected="false">No request</a>
                <a class="nav-link" id="v-pills-purchase-tab" data-toggle="pill" href="#v-pills-purchase" role="tab" aria-controls="v-pills-purchase" aria-selected="false">Purchase</a>
                <a class="nav-link" id="v-pills-transfer-tab" data-toggle="pill" href="#v-pills-transfer" role="tab" aria-controls="v-pills-transfer" aria-selected="false">Transfer</a>
                {/* <a class="nav-link" id="v-pills-return-tab" data-toggle="pill" href="#v-pills-return" role="tab" aria-controls="v-pills-return" aria-selected="false">Customer Return</a> */}
  </div>
  </div>
</div>
<div class="col-10">
            <div class="tab-content" id="v-pills-tabContent">
                <div class="tab-pane fade" id="v-pills-noreq" role="tabpanel" aria-labelledby="v-pills-noreq-tab"><NoReq/></div>
                <div class="tab-pane fade" id="v-pills-purchase" role="tabpanel" aria-labelledby="v-pills-purchase-tab"><Purchase/></div>
                <div class="tab-pane fade" id="v-pills-transfer" role="tabpanel" aria-labelledby="v-pills-transfer-tab"><Transfer/></div>
                {/* <div class="tab-pane fade" id="v-pills-return" role="tabpanel" aria-labelledby="v-pills-return-tab">customer return </div> */}
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

export default connect(mapStateToProps)(Receiving);
