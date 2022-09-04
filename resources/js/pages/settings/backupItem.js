import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../Http';
import classNames from 'classnames';
import { Dropdown } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import BrandOpt from './brand_options';
import CatOpt from './category_options';
import axios from 'axios';
import {products} from './const/productSeed';


class Items_main extends Component {
 
  constructor(props) {
    super(props);
    // this._isMounted = false;
    // Initial state.
    this.state = {
      loading: false,
      name: null,
      brand_id: null,
      size: null,
      category_id: null,
      original_price: null,
      unit_price: null,
      error: false,
      data: [],
      username: '',
    };

    
    // API endpoint.
    this.api = '/api/v1/item';
    this.apiBrand = '/api/v1/brand';

    this.brandsItems = this.brandsItems.bind(this);
  }


 

   componentDidMount() {
    

    
    Http.get(`${this.api}`)
    .then((response) => {
      const { data } = response.data;
      this.setState({
        data,
        error: false,
      });
      
    })
    .catch(() => {
      this.setState({
        error: 'Unable to fetch data.',
      });
    });
    


  }   
  // componentWillUnmount() {
  //   this._isMounted = false;
  // }
    
   
  brandsItems = (e) => {
    
    Http.get('/api/v1/brand')
      .then((response) => 
      {
       
        const { data } = response.data;
        this.setState({
          data,
          error: false,
        });
        
      })
      .catch((error) => {
        console.log(error);
      });
    
  }
  

 
  myChangeHandlerCategory = (e, { value }) => this.setState({category_id: value });
  myChangeHandlerBrand = (e, { value }) => this.setState({brand_id: value });
 
  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const subs = {
      name: this.state.name,
      brand_id: this.state.brand_id,
      size: this.state.size,
      category_id: this.state.category_id,
      original_price: this.state.original_price,
      unit_price: this.state.unit_price
    }
    this.setState({ loading: true });
    this.addItem(subs);
  };

  addItem = (item) => {
    Http.post(this.api, item)
      .then(({ data }) => {
        const newItem = {
          id: data.id,
          name: item.name,
          brand_id: item.brand_id,
          size: item.size,
          category_id: item.category_id,
          original_price: item.original_price,
          unit_price: item.unit_price
        };
        const allItems = [newItem, ...this.state.data];
        this.setState({ data: allItems, name: null, brand_id: null, size: null, category_id: null, original_price: null, unit_price: null });
        this.itemForm.reset();
        this.setState({ loading: false });
      })
      .catch(() => {
        this.setState({
          error: 'Sorry, there was an error saving your to do.',
        });
        this.setState({ loading: false });
      });
  };

 
 

  render() {
    
    // const product = products;
    const {data, error, loading } = this.state;
    const pill_form = {
       
      };
    const inpt_style = {
        width: "100%",
      };
    const table_style = {
        width: "100%",
      };

    const label_style = {
        float: "left",
      };


      

    const bb = data.map((brand) =>  ({ key: brand.id , value: brand.id, flag: brand.id, text: brand.name })  );
    // const bb = this.brand_data.map((brands) => (
    //   { key: brands.id , value: brands.id, flag: brands.id, text: brands.name }
    // ));
    //  const bb = this.brand_data;
   
// this.brand_data;
// const bb = async () => {
//   return await Http.get(`/api/v1/brand`)
//    .then((response) => {
//     console.log('Date miiii: ', response.data);
//     const dats = response.data;
//     return dats.map((brands) => (
//       { key: brands.id , value: brands.id, flag: brands.id, text: brands.name }
//     ));
//  })
// }
// const hello = products;
//   const bb = hello.map((brands) => (
//       { key: brands.id , value: brands.id, flag: brands.id, text: brands.name }
//     ));

    return (
     
  <div>
    
    
   <br/>
   <center> <button type="button" class="btn btn-primary" data-toggle="collapse" data-target="#itemMain"   onClick={this.brandsItems}>Add New Item</button></center>
  <div style={pill_form}>
  
        <div id="itemMain" class="collapse">
                    <br/>
                    {this.state.category_id}
                    {this.state.brand_id}
                <form class="form-inline"
                            method="post"
                            onSubmit={this.handleSubmit}
                            ref={(el) => {
                            this.itemForm = el;
                            }} 
                            >
                       
                        <table style={table_style}>
                              <tr>
                                  <td>
                                    <label style={label_style} for="name" >Item Name</label>
                                      <input type="text"
                                      id="addItem"
                                      name="name"
                                      onChange={this.handleChange}
                                      style={inpt_style}
                                      class="form-control mb-2 mr-sm-8" placeholder="Enter item name" />
                                      </td>
                                  
                                  <td>
                                  <label style={label_style} for="name" >Unit Price</label>
                                      <input type="text"
                                      id="addItem"
                                      name="unit_price"
                                      onChange={this.handleChange}
                                      style={inpt_style}
                                      class="form-control mb-2 mr-sm-8" placeholder="Enter item unit price" />
                                  </td>
                                  
                              </tr>
                              <tr>
                                  <td>
                                  <label style={label_style} for="name" >Size</label>
                                    <input type="text"
                                    id="addItem"
                                    name="size"
                                    onChange={this.handleChange}
                                    style={inpt_style}
                                    class="form-control mb-2 mr-sm-8" placeholder="Enter item size" />
                                </td>
                            
                                  <td>
                                  <label style={label_style} for="name" >Original Price</label>
                                    <input type="text"
                                    id="addItem"
                                    name="original_price"
                                    onChange={this.handleChange}
                                    style={inpt_style}
                                    class="form-control mb-2 mr-sm-8" placeholder="Enter item original price" />
                                
                                </td>
                                
                              </tr>
                              <tr>
                              <td>
                                <p style={label_style} for="name" >Brand</p>
                                <Dropdown
                                        type="select"
                                        placeholder='Select brand'
                                        fluid
                                        search
                                        selection
                                        style={inpt_style}
                                        onChange={this.myChangeHandlerBrand}
                                        options={bb}
                                        id="addItem"
                                        name="brand_id" 
                                        />
                                      

                                       {/* <BrandOpt onChange={this.myChangeHandlerBrand} /> */}

                                  </td>
                                  <td>
                                  <p style={label_style} for="name" >Category</p>
                                   
                                      {/* <Dropdown
                                        type="select"
                                        placeholder='Select category'
                                        fluid
                                        search
                                        selection
                                        style={inpt_style}
                                        onChange={this.myChangeHandlerCategory}
                                        options={bb}
                                        id="addItem"
                                        name="category_id" 
                                        /> */}
                                        
                                </td>
                              </tr>
                              
                              <tr>
                                <td>
                                </td>
                                  <td>
                                  <button type="submit"
                                  className={classNames('btn btn-primary mb-2', {
                                  'btn-loading': loading,
                                  })}>Add</button>

                                      
                              </td>
                              </tr>
                    </table>
                    </form>
        </div>
    </div>

  <div>
    {error && (
          <div className="alert alert-warning" role="alert">
            {error}
          </div>
        )}
    <br/>
    <div className="todos">
          <table className="table table-striped">
            <tbody>
              <tr>
                <th>Name</th>
                <th>Brand</th>
                <th>Size</th>
                <th>Category</th>
                <th>Original Price</th>
                <th>Unit Price</th>
                <th>Action</th>
              </tr>
              {data.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.brand_id}</td>
                  <td>{item.size}</td>
                  <td>{item.category_id}</td>
                  <td>{item.original_price}</td>
                  <td>{item.unit_price}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={this.closeTodo}
                      data-key={item.id}
                    >
                      Close
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

export default connect(mapStateToProps)(Items_main);
