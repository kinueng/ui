import React, { PureComponent } from 'react';
import {
  OverflowMenu,
  OverflowMenuItem,
} from 'carbon-components-react';

export class ActionsDropdownMenu extends PureComponent {
  render() {
    return (
      <>
        <OverflowMenu flipped>
          <OverflowMenuItem primaryFocus itemText="Edit" />
          <OverflowMenuItem itemText="Delete" />
        </OverflowMenu>
      </>
    );
  }
}

export default ActionsDropdownMenu;
