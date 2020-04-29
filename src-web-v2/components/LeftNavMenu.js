import React, { PureComponent } from 'react';
import { Link } from "react-router-dom";

import {
  SideNav,
  SideNavItems,
  SideNavLink,
  SideNavMenu,
  SideNavMenuItem,
} from 'carbon-components-react/lib/components/UIShell';

import {
  Application20,
  Code20,
  Category20,
  TreeViewAlt20,
} from '@carbon/icons-react';

export class LeftNavMenu extends PureComponent {
  render() {
    const { expanded } = this.props;
    return (
      <SideNav
        aria-label="Side navigation"
        isRail
        expanded={expanded}
      >
        <SideNavItems>
          <SideNavMenu renderIcon={Application20} title="Applications">
            <SideNavMenuItem element={Link} to="applications/stock-trader">
              Stock Trader
            </SideNavMenuItem>
            <SideNavMenuItem href="">
              Book Info
            </SideNavMenuItem>
            <SideNavMenuItem href="">
              Music Service
            </SideNavMenuItem>
          </SideNavMenu>
          <SideNavLink renderIcon={Code20} element={Link} to="jobs">
            Command Actions
          </SideNavLink>
          {/* <SideNavLink renderIcon={Category20} href="">
            WAS ND Cells
          </SideNavLink>
          <SideNavLink renderIcon={TreeViewAlt20} href="">
            Liberty Collectives
          </SideNavLink> */}
        </SideNavItems>
      </SideNav>
    );
  }
}

export default LeftNavMenu;
