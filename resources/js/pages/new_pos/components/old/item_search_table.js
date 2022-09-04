import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { withStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import Paper from '@material-ui/core/Paper';
import { AutoSizer, Column, Table,TableHead,TableRow,TableBody } from 'react-virtualized';
import TextField from '@material-ui/core/TextField';

const styles = (theme) => ({
  flexContainer: {
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
  },
  table: {
    // temporary right-to-left patch, waiting for
    // https://github.com/bvaughn/react-virtualized/issues/454
    '& .ReactVirtualized__Table__headerRow': {
      flip: false,
      paddingRight: theme.direction === 'rtl' ? '0 !important' : undefined,
    },
  },
  tableRow: {
    cursor: 'pointer',
  },
  tableRowHover: {
    '&:hover': {
      backgroundColor: theme.palette.grey[200],
    },
  },
  tableCell: {
    flex: 1,
  },
  noClick: {
    cursor: 'initial',
  },
});

class MuiVirtualizedTable extends React.PureComponent {
  static defaultProps = {
    headerHeight: 48,
    rowHeight: 48,
  };

  getRowClassName = ({ index }) => {
    const { classes, onRowClick } = this.props;

    return clsx(classes.tableRow, classes.flexContainer, {
      [classes.tableRowHover]: index !== -1 && onRowClick != null,
    });
  };

  cellRenderer = ({ cellData, columnIndex }) => {
    const { columns, classes, rowHeight, onRowClick } = this.props;
    return (
      <TableCell
        component="div"
        className={clsx(classes.tableCell, classes.flexContainer, {
          [classes.noClick]: onRowClick == null,
        })}
        variant="body"
        style={{ height: rowHeight }}
        align={(columnIndex != null && columns[columnIndex].numeric) || false ? 'right' : 'left'}
      >
        {cellData}
      </TableCell>
    );
  };

  headerRenderer = ({ label, columnIndex }) => {
    const { headerHeight, columns, classes } = this.props;

    return (
      <TableCell
        component="div"
        className={clsx(classes.tableCell, classes.flexContainer, classes.noClick)}
        variant="head"
        style={{ height: headerHeight }}
        align={columns[columnIndex].numeric || false ? 'right' : 'left'}
      >
        <span>{label}</span>
      </TableCell>
    );
  };

  render() {
    const { classes, columns, rowHeight, headerHeight, ...tableProps } = this.props;
    return (
      <AutoSizer>
        {({ height, width }) => (
          <Table
            height={height}
            width={width}
            rowHeight={rowHeight}
            gridStyle={{
              direction: 'inherit',
            }}
            headerHeight={headerHeight}
            className={classes.table}
            {...tableProps}
            rowClassName={this.getRowClassName}
          >
            {columns.map(({ dataKey, ...other }, index) => {
              return (
                <Column
                  key={dataKey}
                  headerRenderer={(headerProps) =>
                    this.headerRenderer({
                      ...headerProps,
                      columnIndex: index,
                    })
                  }
                  className={classes.flexContainer}
                  cellRenderer={this.cellRenderer}
                  dataKey={dataKey}
                  {...other}
                />
              );
            })}
            {/* <Column
              label="Opts"
              // cellDataGetter={({ rowData }) => parseFloat(rowData.Inventory).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              // dataKey='Inventory'
              width={100}
              // cellDataGetter={hi}
              dataFormat={hi}
              // className={classes.flexContainer}

            /> */}
            {/* <Column  >
              <TableCell >
                <TextField
                  label="Size"
                  id="outlined-size-small"
                  defaultValue="Small"
                  variant="outlined"
                  size="small"
                />
              </TableCell>
              

            </Column> */}

          </Table>
        )}
      </AutoSizer>
    );
  }
}

MuiVirtualizedTable.propTypes = {
  classes: PropTypes.object.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      dataKey: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      numeric: PropTypes.bool,
      width: PropTypes.number.isRequired,
    }),
  ).isRequired,
  headerHeight: PropTypes.number,
  onRowClick: PropTypes.func,
  rowHeight: PropTypes.number,
};

const VirtualizedTable = withStyles(styles)(MuiVirtualizedTable);

// ---

const sample = [
  ['ITM367596543523', "Wood Preservative Brown Solignum GallonSolignum GallonSolignum GallonSolignum Gallon", "Boysen", "1 ltr", 24, 4.0],
  ['ITM367596543523', "Waterproofing Compound 908grms", "Sher", "null pck", 24, 4.0],
  ['ITM193512776423', "UPVC Sanitary Tee 2", "Sun Ame's", "null pcs", 24, 4.0],
  ['ITM185210256328', "Utility Knife", "No Brand", "null roll", 24, 4.0],
  ['ITM279422300728', "Tire Black", "El Toro", "1 pc", 24, 4.0]

];

function createData(id, dessert, calories, brand, fat, carbs, protein) {
  return { id, dessert, calories, brand, fat, carbs, protein };
}

const rows = [];

for (let i = 0; i < 2000; i += 1) {
  const randomSelection = sample[Math.floor(Math.random() * sample.length)];
  rows.push(createData(i, ...randomSelection));
}

function hi() {
  return (
    <>
      <TextField
        label="Size"
        id="outlined-size-small"
        defaultValue="Small"
        variant="outlined"
        size="small"
      />
    </>
  )
}



export default function ReactVirtualizedTable() {
  return (
    <>
      <Paper style={{ height: 400, width: '100%' }}>
        <VirtualizedTable
          rowCount={rows.length}
          rowGetter={({ index }) => rows[index]}
          columns={[
            {
              width: 150,
              label: 'Code',
              dataKey: 'dessert',
            },
            {
              width: 300,
              label: 'Item',
              dataKey: 'calories',

            },
            {
              width: 120,
              label: 'Brand',
              dataKey: 'brand',
              numeric: true,
            },
            {
              width: 100,
              label: 'Meas.',
              dataKey: 'fat',
              numeric: true,
            },
            {
              width: 100,
              label: 'SRP',
              dataKey: 'carbs',
              numeric: true,
            },
            {
              width: 100,
              label: 'Stock',
              dataKey: 'protein',
              numeric: true,
            }
          ]}
        />
      </Paper>
      

    </>
  );
}
