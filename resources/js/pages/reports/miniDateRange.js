import React, { Component } from 'react';
import { connect } from 'react-redux';
import 'react-toastify/dist/ReactToastify.css';
import classNames from 'classnames';
class MinDate extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);

    // Initial state.
    this.state = {
      from_date: null,
      to_date: null,
    };
   
  }

  handleChange = (e) => {
    this._isMounted = true
    const { name, value } = e.target;
    if (this._isMounted) {
        this.setState({ [name]: value });
    }
};
 
getData=(e)=>{
e.preventDefault()
    const subs = {
        from_date: this.state.from_date,
        to_date: this.state.to_date
    }
    this.props.dates(subs)
}
  
  render() {
    

    

    return (
    
      <>
      
       <form onSubmit={this.getData} style={{ width: "20%" }}>
                    <table>
                        <tr>
                            <td>
                                From
                            </td>
                            <td>
                                To
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <input type="date"
                                    name="from_date"
                                    onChange={this.handleChange}
                                    required
                                    class="form-control mb-2 mr-sm-2 inline_block" />

                            </td>
                            <td>
                                <input type="date"
                                    name="to_date"
                                    onChange={this.handleChange}
                                    required
                                    class="form-control mb-2 mr-sm-2 inline_block" 
                                    
                                    />
                            </td>
                            <td>
                                <button
                                //  class="btn btn-primary mb-2"
                                 className={classNames('btn btn-primary mb-2', {
                                  'btn-loading': this.props.loading,
                                })}
                                 >Search</button>
                            </td>
                        </tr>
                    </table>



                </form>
      
      
      
      
      
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: state.Auth.isAuthenticated,
  user: state.Auth.user,
});

export default connect(mapStateToProps)(MinDate);
