import React, { PureComponent } from 'react';
import HeaderContainer from 'carbon-components-react/lib/components/UIShell/HeaderContainer';
import {
  Header,
  HeaderName,
  SkipToContent,
  HeaderMenuButton,
} from 'carbon-components-react/lib/components/UIShell';

import GlobalActions from '../components/GlobalActions';
import LeftNavMenu from '../components/LeftNavMenu';

import App from './App';

export default class TopNavBar extends PureComponent {
  render() {
    return (
      <div className="container">
        <HeaderContainer
          isSideNavExpanded={false}
          render={({ isSideNavExpanded, onClickSideNavExpand }) => (
            <>
              <Header aria-label="IBM Application Navigator">
                <SkipToContent />

                <HeaderMenuButton
                  aria-label="Open menu"
                  onClick={onClickSideNavExpand}
                  isActive={isSideNavExpanded}
                  isCollapsible
                />

                <LeftNavMenu expanded={isSideNavExpanded} />

                <HeaderName href="" prefix="IBM">
                  Application Navigator
                </HeaderName>

                <GlobalActions />
              </Header>
              <App />
            </>
          )}
        />
      </div>
    );
  }
}
