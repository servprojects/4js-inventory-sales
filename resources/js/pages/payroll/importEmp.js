import React, { Component } from 'react';
import { connect } from 'react-redux';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import { Link } from 'react-router-dom';
import CSVReader from 'react-csv-reader';
import update from 'immutability-helper';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Http from '../../Http';
class ImportEmp extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);

        // Initial state.
        this.state = {

            imported: [],

        };

        // API endpoint.
        this.api = '/api/v1/request';
    }
    more = (cell, row) => {

        return (<>
            <button type="button" class="btn btn-primary" data-toggle="modal" data-target={"#ee" + row.id}>
                More
            </button>
            <div class="modal fade" id={"ee" + row.id}>
                <div class="modal-dialog modal-xs shadow-shorter">
                    <div class="modal-content">


                        <div class="modal-header">
                            <b> More of {row.first_name}, {row.last_name}</b>
                            {/* <button type="button" class="close" data-dismiss="modal">&times;</button> */}

                        </div>


                        <div class="modal-body">
                            Position No<br />
                            <input class="form-control mb-2 mr-sm-2 " type="text" name="position_no" defaultValue={row.position_no} data-id={row.id} onBlur={this.updateFromMore} /><br />
                            Conatct No<br />
                            <input class="form-control mb-2 mr-sm-2 " type="text" name="contact_no" defaultValue={row.contact_no} data-id={row.id} onBlur={this.updateFromMore} /><br />
                             Start of work<br />
                            <input class="form-control mb-2 mr-sm-2 " type="text" name="start_work" defaultValue={row.start_work} data-id={row.id} onBlur={this.updateFromMore} /><br />
                            Birthday<br />
                            <input class="form-control mb-2 mr-sm-2 " type="date" name="birthday" value={row.birthday} data-id={row.id} onBlur={this.updateFromMore} /><br />
                            In case of Emergency<br />
                            <input class="form-control mb-2 mr-sm-2 " type="text" name="incase_emergency" defaultValue={row.incase_emergency} data-id={row.id} onBlur={this.updateFromMore} /><br />
                            Relationship to employee<br />
                            <input class="form-control mb-2 mr-sm-2 " type="text" name="relationship_employee" defaultValue={row.relationship_employee} data-id={row.id} onBlur={this.updateFromMore} /><br />

                        </div>
                    </div>
                </div>
            </div>

        </>);
    }

    updateFromMore = (e) => {
        // alert(`Save cell ${cellName} with value ${cellValue} ${row.id} `);
        this._isMounted = true



        const { name, value } = e.target;
        const { id } = e.target.dataset;
        const { imported } = this.state;
        // let rowStr = '';
        // for (const prop in row) {
        //   rowStr += prop + ': ' + row[prop] + '\n';
        // }

        var commentIndex = imported.findIndex(function (c) {
            return c.id == id;
        });
        var updatedComment = update(imported[commentIndex], { [name]: { $set: value } });
        var newData = update(imported, {
            $splice: [[commentIndex, 1, updatedComment]]
        });
        if (this._isMounted) {
            this.setState({ imported: newData });
        }

        toast("Employee successfully updated", {
            position: toast.POSITION.BOTTOM_RIGHT,
            className: 'foo-bar'
        });

        // alert('Thw whole row :\n' + rowStr);
    }
    // import


    buttonFormatterDel = (cell, row) => {

        return (<i class="trash icon" onClick={this.impdel} data-key={row.id}></i>)
    }
    impdel = (e) => {
        this._isMounted = true
        const { key } = e.target.dataset;
        const { imported: pos } = this.state;


        if (confirm(`Are you sure you want to delete ${key}?`)) {
            const index = pos.findIndex(
                (item) => parseInt(item.id, 10) === parseInt(key, 10),
            );
            const update = [...pos.slice(0, index), ...pos.slice(index + 1)];
            if (this._isMounted) {
                this.setState({ imported: update });

            }

            toast("Employee deleted successfully!")
        }
    };
    onBeforeSaveCell(row, cellName, cellValue) {
        // You can do any validation on here for editing value,
        // return false for reject the editing
        if (confirm(`Are you sure you want to update ${row.name}?`)) {
            if (cellName == "balance") {
                if (Number(cellValue)) {
                    return true;
                } else {
                    toast("Invalid amount!")
                    return false;
                }
            } else {
                return true;
            }

        } else {
            return false;
        }
    }
    onAfterSaveCell = (row, cellName, cellValue) => {
        // alert(`Save cell ${cellName} with value ${cellValue} ${row.id} `);
        const { imported } = this.state;
        // let rowStr = '';
        // for (const prop in row) {
        //   rowStr += prop + ': ' + row[prop] + '\n';
        // }

        var commentIndex = imported.findIndex(function (c) {
            return c.id == row.id;
        });
        var updatedComment = update(imported[commentIndex], { [cellName]: { $set: cellValue } });
        var newData = update(imported, {
            $splice: [[commentIndex, 1, updatedComment]]
        });
        if (this._isMounted) {
            this.setState({ imported: newData });
        }

        toast("Employee successfully updated", {
            position: toast.POSITION.BOTTOM_RIGHT,
            className: 'foo-bar'
        });

        // alert('Thw whole row :\n' + rowStr);
    }
    submitImport = (e) => {
        this._isMounted = true
        if (confirm(`Are you sure you want to insert data?`)) {
            Http.post(`/api/v1/payroll/import/employee`, { items: JSON.stringify(this.state.imported) })//last stop here no API YET
                .then(({ data }) => {

                    if (this._isMounted) {
                        this.setState({
                            imported: [],
                            // data: data.updated,
                            // error: false,
                        });

                    }
                    toast("Employee imported successfully!")

                })
                .catch(() => {

                    toast("Error importing Employees")
                });

        }
    }

    // import
    render() {
        const { imported } = this.state;
        const cellEditProp = {
            mode: 'dbclick',
            blurToSave: true,
            beforeSaveCell: this.onBeforeSaveCell, // a hook for before saving cell
            afterSaveCell: this.onAfterSaveCell  // a hook for after saving cell
        };
        console.log(imported)
        return (
            <>
                <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#imp">
                    Import Employee
                 </button>
                <div class="modal fade" id="imp">
                    <div class="modal-dialog modal-xxl">
                        <div class="modal-content">


                            <div class="modal-header">
                                <h4 class="modal-title">Import Employees</h4>
                                {/* <br /> */}

                                <button type="button" class="close" data-dismiss="modal">&times;</button>
                            </div>


                            <div class="modal-body">

                                <form>
                                    <div class="inline_block" style={{ float: "right" }}>
                                        <a href='/templates/emoployee_template.csv' download>Download template here</a><br />
                                        <small>*Don't change the headings of the template</small>
                                    </div>
                                    <div class="custom-file">
                                        <CSVReader
                                            parserOptions={{ header: true }}
                                            onFileLoaded={(dataf, fileInfof) => {
                                                this._isMounted = true
                                                if (this._isMounted) {
                                                    this.setState({
                                                        imported: dataf
                                                    });
                                                }
                                                console.dir(JSON.stringify(dataf))
                                                // console.dir(dataf)
                                            }


                                            }
                                            cssClass="custom-file-input"
                                        />
                                        <label class="custom-file-label" for="customFile">Choose file</label>
                                    </div>
                                </form>

                                <br />
                                <BootstrapTable
                                    ref='table'
                                    data={imported}
                                    pagination={true}
                                    search={true}
                                    maxWidth="500px"
                                    cellEdit={cellEditProp}
                                // deleteRow={true} selectRow={selectRowProp} options={options}
                                >
                                    <TableHeaderColumn dataField='id' isKey={true} width="50" dataFormat={this.buttonFormatterDel}  ></TableHeaderColumn>
                                    <TableHeaderColumn dataField='department' hidden={false} width="100" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Department</TableHeaderColumn>
                                    <TableHeaderColumn dataField='id_no' width="100" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >ID No.</TableHeaderColumn>
                                    <TableHeaderColumn dataField='first_name' tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >First Name</TableHeaderColumn>
                                    <TableHeaderColumn dataField='middle_name' tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Middle Name</TableHeaderColumn>
                                    <TableHeaderColumn dataField='last_name' tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Last Name</TableHeaderColumn>
                                    <TableHeaderColumn dataField='position_title' width="100" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Position Title</TableHeaderColumn>
                                    <TableHeaderColumn dataField='position_no' hidden={true} width="30" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Position #</TableHeaderColumn>
                                    <TableHeaderColumn dataField='contact_no' hidden={true} width="30" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Contact No.</TableHeaderColumn>
                                    <TableHeaderColumn dataField='start_work' hidden={true} width="30" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Start of Work</TableHeaderColumn>
                                    <TableHeaderColumn dataField='rate_per_day' width="80" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Rate/<br />day</TableHeaderColumn>
                                    <TableHeaderColumn dataField='rate_per_hour_ot' width="80" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Rate/<br /> Hour OT</TableHeaderColumn>
                                    <TableHeaderColumn dataField='birthday' hidden={true} width="30" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Birthday</TableHeaderColumn>
                                    <TableHeaderColumn dataField='address' tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Address</TableHeaderColumn>
                                    <TableHeaderColumn dataField='incase_emergency' hidden={true} width="30" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >In case of <br /> Emergency</TableHeaderColumn>
                                    <TableHeaderColumn dataField='relationship_employee' hidden={true} width="30" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} >Relationship to <br /> Employee</TableHeaderColumn>
                                    <TableHeaderColumn dataField='relationship_employee' editable={false} hidden={false} width="80" tdStyle={{ whiteSpace: 'normal' }} thStyle={{ whiteSpace: 'normal' }} dataFormat={this.more}  >More</TableHeaderColumn>



                                </BootstrapTable>
                                <br />
                                <button type="button" class="btn btn-primary" onClick={this.submitImport}>Import</button>



                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

            </>
        );
    }
}

const mapStateToProps = (state) => ({
    isAuthenticated: state.Auth.isAuthenticated,
    user: state.Auth.user,
});

export default connect(mapStateToProps)(ImportEmp);
