import React, { PureComponent } from 'react';
import {
  HeaderGlobalBar,
  HeaderGlobalAction,
  HeaderPanel,
  Switcher,
  SwitcherItem,
  SwitcherItemLink,
} from 'carbon-components-react/lib/components/UIShell';

import {
  Notification20,
  UserAvatar20,
  Information20,
} from '@carbon/icons-react';

class GlobalActions extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isRightSideNavExpanded: false,
    };
  }

  render() {
    const { isRightSideNavExpanded } = this.state;
    return (
      <>
        <HeaderGlobalBar>
          <HeaderGlobalAction aria-label="About">
            <Information20 />
          </HeaderGlobalAction>
          <HeaderGlobalAction aria-label="Notifications Menu" onClick={() => { this.setState({ isRightSideNavExpanded: !isRightSideNavExpanded }); }}>
            <Notification20 />
          </HeaderGlobalAction>
          <HeaderGlobalAction aria-label="User Account Menu" onClick={() => { this.setState({ isRightSideNavExpanded: !isRightSideNavExpanded }); }}>
            <UserAvatar20 />
          </HeaderGlobalAction>
        </HeaderGlobalBar>
        <HeaderPanel aria-label="Header Panel" expanded={isRightSideNavExpanded} />
      </>
    );
  }
}

export default GlobalActions;
