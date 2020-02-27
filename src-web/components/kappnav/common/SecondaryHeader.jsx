/*****************************************************************
 *
 * Copyright 2020 IBM Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *****************************************************************/

'use strict'

import React from 'react'
import { DetailPageHeader } from 'carbon-addons-cloud-react'
import { Breadcrumb, Tabs, Tab, DropdownV2, Icon } from 'carbon-components-react'
import ResourceModal from '../modals/ResourceModal'
import RemoveResourceModal from '../modals/RemoveResourceModal'
import ActionModal from '../modals/ActionModal'
import ActionMessageModal from '../modals/ActionMessageModal'
import {CONTEXT_PATH} from '../../../actions/constants';
import msgs from '../../../../nls/kappnav.properties'
import LeftNav from '../../LeftNav'

require('../../../../scss/header.scss')
require('../../../../scss/secondary-header.scss')
require('../../../../scss/common.scss')
require('../../../../scss/resource-overview.scss')
require('../../../../scss/kappnav.scss')

const items = [
  {
    id: "logout",
    text: msgs.get('user.menu.logout')
  }
];
class SecondaryHeader extends React.Component {
  constructor(props) {
    super(props)
    this.renderBreadCrumb = this.renderBreadCrumb.bind(this)
    this.renderTabs = this.renderTabs.bind(this)
    this.focusTab = this.focusTab.bind(this)

    this.handleMenuClick = this.handleMenuClick.bind(this)
    this.handleMouseClick = this.handleMouseClick.bind(this)

    // One day, this will be in Redux store
    this.state = {
      leftNavOpen: false,
      actions: '',
      statusColor: 'white',
      statusText: '',
      resourceModalOpen: false,
      removeResourceModalOpen: false,
      actionModalOpen: false,
      resourceModalLabel: {
        primaryBtn: 'modal.button.save',
        heading: 'modal.create.label'
      },
      resourceModalSubmitUrl: '',
      resourceModalData: {
      }
    };
    window.secondaryHeader = this;
  }

  componentDidMount() {
    this.props.tabs && this.focusTab()
  }

  initiateLogOut = (event) => {
    let url = location.protocol + '//' + location.host + CONTEXT_PATH + '/logout'
    window.location.href = url
  }

  render() {

    const { leftNavOpen } = this.state
    const { tabs, title, breadcrumbItems, headerClasses } = this.props
    //extracting the simpleHeader and primary header classes
    const simpleHeaderClasses = (headerClasses && headerClasses.indexOf('with-inner-left-nav-simple') > -1) ? headerClasses.substr(headerClasses.indexOf('with-inner-left-nav-simple')) : ''
    const primaryHeaderClasses = !headerClasses ? '' : (headerClasses && headerClasses.indexOf('with-inner-left-nav-simple') > -1) ? headerClasses.substr(0, headerClasses.indexOf('with-inner-left-nav-simple')) : headerClasses

    // https://www.npmjs.com/package/hamburgers
    const hamburgerButton = (
      <button className={'hamburger hamburger--slider ' + (leftNavOpen ? 'is-active' : '')}
              id='hamburger' aria-label={msgs.get('header.menu.label')}
              onClick={this.handleMenuClick} title={msgs.get('header.menu.label')}>

        <span className="hamburger-box">
          <span className="hamburger-inner"></span>
        </span>

      </button>
    )

    return (
      <div>
        <LeftNav handleMenuClick={this.handleMenuClick} open={this.state.leftNavOpen}/>
        <div className="app-header app-header__container secondary" role="banner" aria-label={msgs.get('kappnav')}>
          <div className="app-menu-btn-container">
            {hamburgerButton}
          </div>
          {(() => {
              return (
                <div className='logo-container'>
                  <div className='logo' style={{color: 'white', fontWeight:'bold'}}>
                    Kubernetes Application Navigator
                  </div>
                </div>
              )
          })()}
          <div className="navigation-container"></div>
          {document.documentElement.getAttribute('kube') === 'ocp' || document.documentElement.getAttribute('kube') === 'okd' ?
            <div>
              <DropdownV2
                label={<Icon
                  className="user-icon"
                  name='user'
                  description={document.documentElement.getAttribute('displayUser')}
                />}
                items={items}
                className="user-width"
                onChange={(event) => this.initiateLogOut(event)}
                itemToString={item => (item ? item.text : "")}
                ariaLabel={msgs.get('user.menu.button.label')}
              />
            </div> : null}
        </div>
        <ActionMessageModal open={this.state.actionMessageModalOpen}
          label={this.state.resourceModalLabel}
          result={this.state.actionResult}
          error={this.state.actionError}
          handleClose={() => {
            this.setState({ actionMessageModalOpen: false })
          }}
        />
      {(() => {
        if( (tabs && tabs.length > 0) || (breadcrumbItems && breadcrumbItems.length > 0) ) {
          return (
            <div className={'secondary-header-wrapper ' + primaryHeaderClasses} role='region' aria-label={title}>
              <div className={`secondary-header ${simpleHeaderClasses}`} ref={div => this.secondaryHeader = div}>
                {tabs && tabs.length > 0 ? (
                  <DetailPageHeader role="presentation" hasTabs={true} title={decodeURIComponent(title)} aria-label={`${title} ${msgs.get('secondaryHeader')}`}>
                    <Breadcrumb>
                      {breadcrumbItems && this.renderBreadCrumb()}
                    </Breadcrumb>
                    <Tabs selected={this.getSelectedTab() || 0} aria-label={`${title} ${msgs.get('tabs.label')}`}>
                      {this.renderTabs()}
                    </Tabs>
                  </DetailPageHeader>
                ) : (
                  <DetailPageHeader role="presentation" hasTabs={true} statusColor={this.state.statusColor} statusText={this.state.statusText} title={decodeURIComponent(title)} aria-label={`${title} ${msgs.get('secondaryHeader')}`}>
                    <Breadcrumb>
                      {this.renderBreadCrumb()}
                    </Breadcrumb>
                    {this.state.actions}
                  </DetailPageHeader>
                )}
              </div>
            </div>
          )
        } else {
          return (
            <div className={'secondary-header-wrapper-min ' + primaryHeaderClasses} role='region' aria-label={`${title} ${msgs.get('secondaryHeader')}`}>
              <div className={'secondary-header simple-header ' + simpleHeaderClasses}>
                <h1 className='bx--detail-page-header-title'>{decodeURIComponent(title)}</h1>
              </div>
            </div>
          )
        }
      })()}
      <ResourceModal open={this.state.resourceModalOpen}
                     label={this.state.resourceModalLabel}
                     editorMode='json'
                     data={this.state.resourceModalData}
                     submitUrl={this.state.resourceModalSubmitUrl}
                     handleClose={(refresh, originalResource, newResource)=>{
                       if(refresh===true && this.refreshCallback) {
                         this.refreshCallback({operation:"edit", originalResource:originalResource, newResource:newResource});
                       }
                       this.setState({resourceModalOpen:false})
                     }}
      />
        <RemoveResourceModal open={this.state.removeResourceModalOpen}
          label={this.state.resourceModalLabel}
          data={this.state.resourceModalData}
          submitUrl={this.state.resourceModalSubmitUrl}
          handleClose={(refresh) => {
            if (refresh === true && this.refreshCallback) {
              this.refreshCallback({ operation: "delete", "name": this.state.resourceModalData.metadata.name });
            }
            this.setState({ removeResourceModalOpen: false })
          }}
        />
        <ActionModal open={this.state.actionModalOpen}
          label={this.state.resourceModalLabel}
          data={this.state.resourceModalData}
          input={this.state.actionModalInput}
          submitNoInput={this.state.submitNoInput}
          submitCmd={this.state.submitCmd}
          submitUrl={this.state.resourceModalSubmitUrl}
          handleClose={() => {
            this.setState({ actionModalOpen: false })
          }}
        />
    </div>
    )
  }

  renderBreadCrumb() {
    const { breadcrumbItems } = this.props
    return breadcrumbItems && breadcrumbItems.map((breadcrumb, index) => {
      return (
        <div key={`${breadcrumb}-${index}`} className='bx--breadcrumb-item' title={decodeURIComponent(breadcrumb.label)}>
          <a href={breadcrumb.url} className='bx--link'>{decodeURIComponent(breadcrumb.label)}</a>
        </div>
      )
    })
  }

  renderTabs() {
    const { tabs } = this.props
    return tabs.map(tab => {
      return <Tab label={msgs.get(tab.label)} key={tab.id} id={tab.id} href={tab.url} onClick={this.clickTab.bind(this, tab.url)} onKeyDown={this.handleKeyDown.bind(this)} />
    })
  }

  getSelectedTab() {
    const { tabs, location } = this.props
    const selectedTab = tabs.map((tab, index) => {
      tab.index = index
      return tab
    }).filter((tab, index) => {
      if (index !== 0) {
        return location.pathname.startsWith(tab.url)
      }
    })
    return selectedTab[0] && selectedTab[0].index
  }

  clickTab(url) {
  }

  handleKeyDown(e) {
    e.persist()
    e.which === 32 && this.props.history.push(e.target.pathname)
  }

  focusTab() {
    const index = this.getSelectedTab() || 0
    this.secondaryHeader && this.secondaryHeader.querySelector(`#${this.props.tabs[index].id}`).focus()
  }

  showResourceModal(open, label, data, submitUrl){
    this.setState({resourceModalOpen:open, resourceModalLabel:label, resourceModalData:data, resourceModalSubmitUrl:submitUrl});
  }

  showRemoveResourceModal(open, label, data, submitUrl){
    this.setState({removeResourceModalOpen:open, resourceModalLabel:label, resourceModalData:data, resourceModalSubmitUrl:submitUrl});
  }

  showActionResourceModal(open, label, data, submitUrl, input, cmd){
    var submitNoInput = true
    if(input && input.fields){
      submitNoInput = false;
    }
    this.setState({actionModalOpen:open, resourceModalLabel:label, resourceModalData:data, resourceModalSubmitUrl:submitUrl, actionModalInput:input, submitNoInput:submitNoInput, submitCmd:cmd});
  }

  showActionMessageModal(open, result, error){
    this.setState({actionMessageModalOpen:open, actionResult:result, actionError:error});
  }

  update(statusColor, statusText, actions){
    this.setState({statusColor: statusColor, statusText: statusText, actions: actions});
  }

  handleMenuClick() {
    this.setState({
      leftNavOpen: !this.state.leftNavOpen
    }, () => {
      if (this.state.leftNavOpen) {
        document.addEventListener('click', this.handleMouseClick)
      } else {
        document.removeEventListener('click', this.handleMouseClick)
      }
    })
  }

  handleMouseClick() {
    this.setState({
      leftNavOpen: false
    })

    document.removeEventListener('click', this.handleMouseClick)
  }

}

export default SecondaryHeader
