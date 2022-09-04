import React, { Component, useRef } from 'react';
// import PrintHeader from './printHeader';
import Http from '../../Http';
import { connect } from 'react-redux';
import ReactToPrint from "react-to-print";
import { Dropdown, Icon, Button } from 'semantic-ui-react';
import PrintReportItem from '../prints/printReportItem';
import { Link } from 'react-router-dom';
import ReactHTMLTableToExcel from 'react-html-table-to-excel';
import { ToastContainer, toast } from 'react-toastify';
import classNames from 'classnames';
class PrintReport extends Component {
    _isMounted = false
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            data: [],
            normal: "normal",
        }
    }

    componentDidMount() {
        this._isMounted = true

        var api = `/api/v1/reports/deletedItms`;
        var items = [];

        Http.post(api)
            .then((response) => {

                if (this._isMounted) {
                    console.log("wait")
                    console.log(response.data.items)



                    const data = response.data.items;
                    var parItm;

                    data.map((itm) => {
                        var it = {}
                        parItm = JSON.parse(itm.items);



                        var sd = new Date(itm.created_at);
                        var sye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(sd);
                        var smo = new Intl.DateTimeFormat('en', { month: 'numeric' }).format(sd);
                        var sda = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(sd);
                        var hour = new Intl.DateTimeFormat('en', { hour: 'numeric' }).format(sd);
                        var min = new Intl.DateTimeFormat('en', { minute: 'numeric' }).format(sd);
                        var sec = new Intl.DateTimeFormat('en', { second: 'numeric' }).format(sd);

                        it.created_at = smo + '-' + sda + '-' + sye + '   ' + hour + min + ':' + sec;
                        it.id = itm.id
                        parItm.map((desc) => {

                            it.name = desc.name
                            it.brand = desc.brand
                            it.category = desc.category
                            it.category_id = desc.category_id
                            it.brand_id = desc.brand_id
                            it.size = desc.size
                            it.unit = desc.unit
                            it.original_price = desc.original_price
                            it.unit_price = desc.unit_price
                        }
                        )
                        items.push(it);
                    }
                    )


                    this.setState({
                        data: items,

                    });
                }
            })

            .catch((error) => {
                console.log(error)
            });
    }

    handleRetrieve = (e) => {
        const {id, name, brand_id, size, category_id, original_price, unit, unit_price } = e.target.dataset
        this._isMounted = true
        e.preventDefault();
        if (confirm("Are you sure you want to retrieve item?")) {
            const subs = {
                id: id,
                name: name,
                brand_id: brand_id,
                size: size,
                category_id: category_id,
                original_price: original_price,
                unit: unit,
                unit_price: unit_price
            }

            console.log(subs)
            if (this._isMounted) {
                // this.setState({ loading: true });
            }
            this.addItem(subs);
        }



    };

    addItem = (item) => {
        const { data: pos } = this.state;

        Http.post('/api/v1/item', item)
            .then(({ data }) => {
                toast("Item retrieved successfully!")

                Http.post('/api/v1/reports/deletedItms/remove', {id: item.id})
                    .then(({ data }) => {
                        const index = pos.findIndex(
                            (itm) => parseInt(itm.id, 10) === parseInt(item.id, 10),
                          );
                          const update = [...pos.slice(0, index), ...pos.slice(index + 1)];
                          if (this._isMounted) {
                            this.setState({ data: update });
                            this.setState({ loading: false });
                          }
                    })
                    .catch((error) => {
                        console.log(error)
                    });



            })
            .catch((error) => {
                if (this._isMounted) {
                   console.log(error)
                    toast("Error adding item!")
                    this.setState({ loading: false });
                }
            });
    }

    retrieveFormatter = (cell, row) => {
        const{loading} = this.state;
        return (
            <>
                <button

                    data-id={row.id}
                    data-name={row.name}
                    data-brand_id={row.brand_id}
                    data-size={row.size}
                    data-category_id={row.category_id}
                    data-original_price={row.original_price}
                    data-unit={row.unit}
                    data-unit_price={row.unit_price}

                    onClick={this.handleRetrieve}
                    type="button" 
                    className={classNames('btn btn-primary', {
                        'btn-loading': loading,
                      })}>Retrieve
                    </button>

            </>
        )
    }


    allItemsView = () => {
        return (
            <>
                <BootstrapTable
                    // ref='table'
                    data={this.state.data}
                    pagination={true}
                    search={true}
                // cellEdit={cellEditProp}
                // deleteRow={true} selectRow={selectRowProp} options={options}
                >
                    <TableHeaderColumn dataField='id' hidden isKey={true} dataFormat={this.buttonFormatterDel}  ></TableHeaderColumn>
                    <TableHeaderColumn dataField='created_at' width="180" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Date Removed</TableHeaderColumn>
                    <TableHeaderColumn dataField='name' tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Item Description</TableHeaderColumn>
                    <TableHeaderColumn dataField='brand' width="120" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Brand</TableHeaderColumn>
                    <TableHeaderColumn dataField='category' width="120" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Category</TableHeaderColumn>
                    <TableHeaderColumn dataField='size' width="120" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Size</TableHeaderColumn>
                    <TableHeaderColumn dataField='unit' width="120" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Unit</TableHeaderColumn>
                    <TableHeaderColumn dataField='original_price' width="120" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Org. Price</TableHeaderColumn>
                    <TableHeaderColumn dataField='unit_price' width="120" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }}  >SRP</TableHeaderColumn>
                    <TableHeaderColumn dataField='id' dataFormat={this.retrieveFormatter} width="115" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }}  ></TableHeaderColumn>
                    <TableHeaderColumn dataField='category_id' hidden width="115" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }}  ></TableHeaderColumn>
                    <TableHeaderColumn dataField='brand_id' hidden width="115" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }}  ></TableHeaderColumn>


                </BootstrapTable>
            </>
        )
    }







    render() {




        return (
            <>
                <ToastContainer />
                <div className="contentTransactSales">

                    <Link to={{ pathname: '/utilities/items', state: { type: this.props.location.state.type, path: this.props.location.state.path } }}>
                        <Button icon labelPosition='left'><Icon name='angle left' /> Back to Tansaction view </Button>
                    </Link>

                    {this.allItemsView()}

                </div>
            </>

        );
    }
}
// export default PrintReport;
const mapStateToProps = (state) => ({
    isAuthenticated: state.Auth.isAuthenticated,
    user: state.Auth.user,
});

export default connect(mapStateToProps)(PrintReport);
