import React, { Component } from 'react';
import { connect } from 'react-redux';
import Http from '../../Http';
import { Dropdown, Button } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';

class AddHistPurItm extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);


        this.state = {
            message: "",
            role: false,
            rl: localStorage.getItem('role'),
            items: JSON.parse(localStorage.getItem("optItems") || "[]"),
            options: [],
            loading: false,

            item_name: null,
            item_id: null,
            original_price: null,
            quantity: null,
            srp: null,

        };
    }
    componentDidMount() {
        this._isMounted = true

        Http.get(`/api/v1/transaction/receive/purchase/noreqexisting`)
            .then((response) => {
                localStorage.setItem('optItems', JSON.stringify(response.data.items))
                var localTerminal = JSON.parse(localStorage.getItem("optItems") || "[]");
                // const { data } = response.data;
                if (this._isMounted) {
                    this.setState({
                        items: localTerminal,
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
    getAlert = () => {
        alert('getAlert from Child');
    }
    setMessage = () => {
        this._isMounted = true
        if (this._isMounted) {
            this.setState({ message: "hello" })
        }
    }
    sendData = (e) => {
        e.preventDefault();

        const { items, item_id, original_price , srp} = this.state;
        
        var result = items.filter(function (v) {
            return v.id == item_id;
        })

        var conts = {
            item_name: this.state.item_name,
            item_id: this.state.item_id,
            original_price: original_price ? original_price : result[0].original_price ,
            quantity: this.state.quantity,
            srp: srp?srp: result[0].unit_price,
        }


        this.props.parentCallback(conts);
    }
    myChangeHandlerItem = (e, { value }) => {
        const { items } = this.state;
        var result = items.filter(function (v) {
            return v.id == value;
        })



        if (this._isMounted) {
            this.setState({ item_id: value, item_name: result[0].name })
        }
    };
    handleChange = (e) => {
        const { name, value } = e.target;

        if (this.state.timeout) clearTimeout(this.state.timeout);
        this.state.timeout = setTimeout(() => {

            if (this._isMounted) {
                this.setState({ [name]: value });
            }

        }, 300);
    };
    onSearchChange = (e, value) => {
        const { items } = this.state;
        this._isMounted = true
        if (this._isMounted) {
            this.setState({ loading: true })
        }

        if (this.state.timeout) clearTimeout(this.state.timeout);
        this.state.timeout = setTimeout(() => {
            // console.log(value.searchQuery)
            var n = value.searchQuery
            var val = n.toString();
            const result = items.filter(function (data) {
                if (val == null) {
                    return data
                }
                else if (data.code.toLowerCase().includes(val.toLowerCase()) || data.name.toLowerCase().includes(val.toLowerCase())
                ) {
                    return data
                }
            }
            )

            // console.log(result)

            if (this._isMounted) {
                this.setState({ options: result, loading: false })
            }

        }, 300);

    }
    render() {
        const { options } = this.state;
        const opt = options.map((items) => ({ key: items.id, value: items.id, text: items.code.concat('\xa0\xa0\xa0\xa0', items.name, '-', items.brand) }));


        return (
            <>
                <Button data-toggle="modal" data-target="#myModal">Add item</Button>



                <div class="modal fade" id="myModal">
                    <div class="modal-dialog modal-md">
                        <div class="modal-content">

                            <div class="modal-header">
                                <h4 class="modal-title">Modal Heading</h4>
                                <button type="button" class="close" data-dismiss="modal">&times;</button>
                            </div>

                            <div class="modal-body">
                                <form
                                    method="post"
                                    // onSubmit={this.handleAddItem}
                                    onSubmit={this.sendData}
                                    ref={(el) => {
                                        this.addForm = el;
                                    }}
                                >
                                    <i>leave the Orignal price blank if you want to use the system original price of the item.</i>
                                    <br/>
                                    <br/>

                                    <label> Item &nbsp; {this.state.item_id} </label>

                                    <Dropdown
                                        type="select"
                                        placeholder='Select item'
                                        fluid
                                        search
                                        selection
                                        clearable={true}
                                        loading={this.state.loading}
                                        onChange={this.myChangeHandlerItem}
                                        onSearchChange={this.onSearchChange}
                                        id="addItem"
                                        name="item_id"
                                        required
                                        options={opt}
                                    />


                                    <div>
                                        <div class="inline_block" style={{ width: "45%" }}>
                                            <label> Quantity</label>
                                            <input type="number" name="quantity" class="form-control mb-2 mr-sm-2" onChange={this.handleChange} />
                                        </div>

                                        <div class="inline_block" style={{ width: "45%", float: "right" }}>
                                            <label> Original Price </label>
                                            <input type="number" name="original_price" class="form-control mb-2 mr-sm-2" onChange={this.handleChange} />
                                        </div>
                                    </div>

                                    {
                                        this.props.imported == "yes" ?
                                        <div>
                                            <div class="inline_block" style={{ width: "45%" }}>
                                                <label> SRP </label>
                                                <input type="number" name="srp" class="form-control mb-2 mr-sm-2" onChange={this.handleChange} />
                                            </div>

                                        </div>
                                        : <></>
                                    }






                                    <button type="submit" class="btn btn-primary btn-lg"  >Add</button>
                                </form>

                            </div>

                            <div class="modal-footer">
                                <button type="button" class="btn btn-danger" data-dismiss="modal">Close</button>
                            </div>

                        </div>
                    </div>
                </div>









                {/* {this.sendData()} */}
            </>
        );
    }
}

const mapStateToProps = (state) => ({
    isAuthenticated: state.Auth.isAuthenticated,
});

export default connect(mapStateToProps)(AddHistPurItm);
