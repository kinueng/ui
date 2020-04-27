import React, { PureComponent } from 'react';
import {
  Button,
  DataTable,
} from 'carbon-components-react';

import {
  Search20,
  Edit20,
  Settings20,
} from '@carbon/icons-react';

const {
  TableToolbar,
  TableToolbarSearch,
  TableToolbarContent,
  TableToolbarMenu,
  TableToolbarAction,
} = DataTable;

class DataTableToolBar extends PureComponent {

  action(msg) {
    console.log(msg);
  }

  render() {
    return (
      <>
        <TableToolbar>
          {/* pass in `onInputChange` change here to make filtering work */}
          <TableToolbarSearch
            onChange={onInputChange}
          />
          <TableToolbarContent>
            <TableToolbarMenu>
              <TableToolbarAction
                icon={Search20}
                iconDescription="Search"
                onClick={action('TableToolbarAction - Download')}
              />
              <TableToolbarAction
                icon={Edit20}
                iconDescription="Edit"
                onClick={action('TableToolbarAction - Download')}
              />
              <TableToolbarAction
                icon={Settings20}
                iconDescription="Settings"
                onClick={action('TableToolbarAction - Download')}
              />
            </TableToolbarMenu>
            <Button onClick={console.log('Adding!!!!!!!!!')} size="small" kind="primary">
              Add new
            </Button>
          </TableToolbarContent>
        </TableToolbar>
      </>
    );
  }
}

export default DataTableToolBar;
