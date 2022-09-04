import React, { useEffect } from 'react';

import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { withStyles, lighten, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import DeleteIcon from '@material-ui/icons/Delete';
import FilterListIcon from '@material-ui/icons/FilterList';


import update from 'immutability-helper';

var _isMounted = false;


function StickyHeadTable(props) {
  _isMounted = true;

  const columns = [
      // { id: 'code', label: 'Code', minWidth: 50 },
      { id: 'name', label: 'Item', minWidth: 200 },
      {
          id: 'brand',
          label: 'Brand',
          minWidth: 80,
          align: 'right',
          format: (value) => value.toLocaleString('en-US'),
      }
      // ,
      // {
      //     id: 'meas',
      //     label: 'Meas.',
      //     minWidth: 80,
      //     align: 'right',
      //     format: (value) => value.toLocaleString('en-US'),
      // }
      ,
      {
          id: 'unit_price',
          label: 'SRP',
          minWidth: 80,
          align: 'right',
          format: (value) => value.toFixed(2),
      },
      {
          id: 'balance',
          label: 'Stock',
          minWidth: 80,
          align: 'right',
          format: (value) => value.toFixed(2),
      }
  
  ];
  
  
  const useStyles = makeStyles({
      root: {
          width: '100%',
      },
      container: {
          maxHeight: 440,
      },
  });

  
  const classes = useStyles();
  const [page, setPage] = React.useState(0);

  const [selItem, setSelItem] = React.useState([]);
  const [selTempItem, setSelTempItem] = React.useState([]);

  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event, newPage) => {
      setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(+event.target.value);
      setPage(0);
  };

  const setItmQty = (value, row) => {



      if (value <= row.balance) {

          row.qty = parseFloat(value);



          setTimeout(function () {
              newData(row)
              //  props.newItem(row)
          }, 500);
          // props.newItem(row)
      } else {
          if (value > row.balance) {
              toast("Insufficient balance")
          }
      }


  }

  const newData = (data) => {
      var ndata = selItem
      var ndataD = selItem


      var exist = "no";
      ndata.map((itemex) => {
          if (itemex.id == data.id) {
              exist = "yes";
          }
      })

      var qtynew = parseFloat(data.qty);
      var id = data.id;

      if (exist == "yes" && !isNaN(qtynew)) {

          

          // console.log("wee")
          // console.log(result)

          // console.log("wee")

          if (!isNaN(qtynew)) {

              var commentIndex = ndata.findIndex(function (c) {
                  return c.id == id;
              });
              var qt = 0;
              console.log("ndata")
              console.log(ndata)
              if (ndata[commentIndex].tempal == "yes") {

                  var result = selTempItem.filter(function (v) {
                      return v.id == id;
                  });
                  console.log(result[0].tempalQty)
                  qt = result[0].tempalQty + parseFloat(qtynew);
              }else{
                  qt = ndata[commentIndex].qty + parseFloat(qtynew);
              }




              var updatedComment = update(ndata[commentIndex], { qty: { $set: qt }, tempal: { $set: "no" } });

              ndataD = update(ndata, {
                  $splice: [[commentIndex, 1, updatedComment]]
              });



              const index = selTempItem.findIndex(
                  (item) => parseInt(id, 10) === parseInt(id, 10),
              );
              var ndataDel = [...selTempItem.slice(0, index), ...selTempItem.slice(index + 1)];
              setSelTempItem(ndataDel)
          }
          // else {
          //     const index = selItem.findIndex(
          //         (item) => parseInt(id, 10) === parseInt(id, 10),
          //     );
          //     var ndata = [...selItem.slice(0, index), ...selItem.slice(index + 1)];
          // }

      } else {
          if (qtynew > 0) {
              var temp = data;
              var tempselTempItem = selTempItem;

              temp.tempal = "yes";
              temp.tempalQty = data.qty;

              ndataD.push(temp)

              tempselTempItem.push(temp);
              console.log("update")

              setSelTempItem(tempselTempItem)

          }



      }


      // props.newItem(ndata)
      // console.log("ndatanew")
      // console.log(ndatanew)
      // console.log("ndatanew")

      if (!isNaN(qtynew)) {
          console.log("what54")
          if (_isMounted) {
              setSelItem(ndataD)
              props.newItem(ndataD)
          }
      }


  }


  // console.log("selTempItemNooo")
  // console.log(selTempItem)
  // console.log("selTempItemNooo")

  // console.log("ndataD")
  // console.log(selItem)
  // console.log("ndataD")


  return (
      <>
          <ToastContainer autoClose={1000} limit={1} />
          <Paper className={classes.root}>
              <TableContainer className={classes.container}>
                  <Table stickyHeader size="small" aria-label="sticky table">
                      <TableHead>
                          <TableRow>
                              {columns.map((column) => (
                                  <TableCell
                                      key={column.id}
                                      align={column.align}
                                      style={{ minWidth: column.minWidth }}
                                  >
                                      {column.label}
                                  </TableCell>
                              ))}
                              <TableCell

                              >
                                  Opts
                              </TableCell>
                          </TableRow>
                      </TableHead>
                      <TableBody>
                          {props.itemData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                              return (
                                  <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                                      {columns.map((column) => {
                                          const value = row[column.id];
                                          return (
                                              <TableCell key={column.id} align={column.align}>
                                                  {
                                                      // column.id == 'meas' ?
                                                      //     <> { row.size ? row.size : ' ' + ' ' + row.unit} </>
                                                      //     :
                                                      column.id == 'name' ?
                                                          <>
                                                              <small style={{ float: "right" }}>{row.size ? row.size : ' ' + ' ' + row.unit}&nbsp;&nbsp;&nbsp;&nbsp;{row.code}</small><br /><b>{row.name}</b>
                                                          </>
                                                          :
                                                          <> {column.format && typeof value === 'number' ? column.format(value) : value}</>
                                                  }
                                              </TableCell>

                                          );
                                      })}
                                      <TableCell align="right">
                                          <TextField onChange={(e) => setItmQty(e.target.value, row)} style={{ width: 70 }} size="small" label="Qty" variant="outlined" type="number" />
                                      </TableCell>

                                  </TableRow>
                              );
                          })}
                      </TableBody>
                  </Table>
              </TableContainer>
              <TablePagination
                  rowsPerPageOptions={[10, 25, 100]}
                  component="div"
                  count={props.itemData.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onChangePage={handleChangePage}
                  onChangeRowsPerPage={handleChangeRowsPerPage}
              />
          </Paper>
      </>
  );
}






function EnhancedTable(props) {

  function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }

  function getComparator(order, orderBy) {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }

  function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  }

  const headCells = [
    { id: 'name', numeric: false, disablePadding: true, label: 'Item' },
    { id: 'brand', numeric: true, disablePadding: false, label: 'Brand' },
    { id: 'meas', numeric: true, disablePadding: false, label: 'Meas.' },
    { id: 'unit_price', numeric: true, disablePadding: false, label: 'SRP' },
    { id: 'qty', numeric: true, disablePadding: false, label: 'Qty' },

  ];

  function EnhancedTableHead(props) {
    const { classes, onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
    const createSortHandler = (property) => (event) => {
      onRequestSort(event, property);
    };

    return (
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox">
            <Checkbox
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={onSelectAllClick}
              inputProps={{ 'aria-label': 'select all desserts' }}
            />
          </TableCell>
          {headCells.map((headCell) => (
            <TableCell
              key={headCell.id}
              align={headCell.numeric ? 'right' : 'left'}
              padding={headCell.disablePadding ? 'none' : 'default'}
              sortDirection={orderBy === headCell.id ? order : false}
            >
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <span className={classes.visuallyHidden}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </span>
                ) : null}
              </TableSortLabel>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
    );
  }

  EnhancedTableHead.propTypes = {
    classes: PropTypes.object.isRequired,
    numSelected: PropTypes.number.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    onSelectAllClick: PropTypes.func.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired,
  };

  const useToolbarStyles = makeStyles((theme) => ({
    root: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(1),
    },
    highlight:
      theme.palette.type === 'light'
        ? {
          color: theme.palette.secondary.main,
          backgroundColor: lighten(theme.palette.secondary.light, 0.85),
        }
        : {
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.secondary.dark,
        },
    title: {
      flex: '1 1 100%',
    },
  }));

  const EnhancedTableToolbar = (props) => {
    const classes = useToolbarStyles();
    const { numSelected } = props;

    return (
      <Toolbar
        className={clsx(classes.root, {
          [classes.highlight]: numSelected > 0,
        })}
      >
        {numSelected > 0 ? (
          <Typography className={classes.title} color="inherit" variant="subtitle1" component="div">
            {numSelected} selected
          </Typography>
        ) : (
          <Typography className={classes.title} variant="h6" id="tableTitle" component="div">
            Selected Items
          </Typography>
        )}

        {numSelected > 0 ? (
          <Tooltip title="Delete">
            <IconButton aria-label="delete">
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Filter list">
            <IconButton aria-label="filter list">
              <FilterListIcon />
            </IconButton>
          </Tooltip>
        )}
      </Toolbar>
    );
  };

  EnhancedTableToolbar.propTypes = {
    numSelected: PropTypes.number.isRequired,
  };

  const useStyles = makeStyles((theme) => ({
    root: {
      width: '100%',
    },
    paper: {
      width: '100%',
      marginBottom: theme.spacing(2),
    },
    table: {
      minWidth: 750,
    },
    visuallyHidden: {
      border: 0,
      clip: 'rect(0 0 0 0)',
      height: 1,
      margin: -1,
      overflow: 'hidden',
      padding: 0,
      position: 'absolute',
      top: 20,
      width: 1,
    },
  }));


  _isMounted = true;


  const classes = useStyles();
  const [rows, setRows] = React.useState([]);
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('calories');
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(true);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const [selItemorg, setSelItem] = React.useState([]);
  const [selTempItem, setSelTempItem] = React.useState([]);

  useEffect(() => {

    // console.log("fetched itemssss")
    // console.log(props.selItem)


    setRows([])
    setTimeout(function () {
      // console.log(props.selItem)
      setRows(props.selItem)

    }, 100);

  }, [props.selItem]);




  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };



  const isSelected = (name) => selected.indexOf(name) !== -1;

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  return (
    <div className={classes.root}>

      <Paper className={classes.paper}>
        <EnhancedTableToolbar numSelected={selected.length} />
        <TableContainer>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size="small"
            aria-label="enhanced table"
          >


            <EnhancedTableHead
              classes={classes}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {stableSort(rows, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const isItemSelected = isSelected(row.name);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, row.name)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.name}
                      selected={isItemSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isItemSelected}
                          inputProps={{ 'aria-labelledby': labelId }}
                        />
                      </TableCell>
                      <TableCell component="th" id={labelId} scope="row" padding="none">
                        {row.name}
                      </TableCell>
                      <TableCell align="right" >{row.brand}</TableCell>

                      <TableCell align="right">{row.meas}</TableCell>
                      <TableCell align="right">{row.unit_price}</TableCell>
                      <TableCell align="right">{row.qty}</TableCell>
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>


          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>

    </div>
  );
}


const mapStateToProps = (state) => ({
  isAuthenticated: state.Auth.isAuthenticated,
});

export default connect(mapStateToProps)(EnhancedTable);