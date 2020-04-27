import React, { PureComponent } from 'react';
import {
  Content,
} from 'carbon-components-react/lib/components/UIShell';

import {
  Button,
  DataTable,
} from 'carbon-components-react';

import {
  Search20,
  Edit20,
  Settings20,
  Add20,
} from '@carbon/icons-react';

const {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  TableHeader,
  TableToolbar,
  TableBatchActions,
  TableBatchAction,
  TableToolbarSearch,
  TableToolbarContent,
  TableToolbarMenu,
  TableToolbarAction,
  TableSelectAll,
  TableSelectRow,
  TableExpandHeader,
  TableExpandRow,
  TableExpandedRow,
} = DataTable;

const defaultHeaders = [
  {
    header: 'Status',
    key: 'status',
  },
  {
    header: 'Name',
    key: 'name',
  },
  {
    header: 'Namespace',
    key: 'namespace',
  },
];

const initialRows = [
  {
    id: 'a',
    name: 'stock-trader',
    status: 'Normal',
    namespace: 'kappnav',
  },
  {
    id: 'b',
    name: 'bookinfo',
    status: 'Normal',
    namespace: 'kappnav',
  },
];

export default class App extends PureComponent {
  render() {
    return (
      <Content>
        <DataTable
          headers={defaultHeaders}
          rows={initialRows}
          render={({
            rows,
            headers,
            getHeaderProps,
            getRowProps,
            onInputChange,
          }) => (
            <TableContainer title="Applications">
              <TableToolbar>
                <TableToolbarContent>
                  <TableToolbarSearch onChange={onInputChange} />
                  <Button
                    onClick={() => console.log('Clicking')}
                    size="small"
                    kind="primary"
                    renderIcon={Add20}
                    iconDescription="Add Application"
                  >
                    Add Application
                  </Button>
                </TableToolbarContent>
              </TableToolbar>
              <Table>
                <TableHead>
                  <TableRow>
                    {/* add the expand header before all other headers */}
                    <TableExpandHeader />
                    {headers.map((header) => (
                      <TableHeader {...getHeaderProps({ header })}>
                        {header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map(row => (
                    <React.Fragment key={row.id}>
                      <TableExpandRow {...getRowProps({ row })}>
                        {row.cells.map(cell => (
                          <TableCell key={cell.id}>{cell.value}</TableCell>
                        ))}
                      </TableExpandRow>
                      {row.isExpanded && (
                        <TableExpandedRow colSpan={headers.length + 1}>
                          <h1>Expandable row content</h1>
                          <p>Description here</p>
                        </TableExpandedRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        />
      </Content>
    );
  }
}
